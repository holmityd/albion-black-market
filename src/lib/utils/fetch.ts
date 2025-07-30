export interface FetchOptions extends RequestInit {
	timeout?: number;
	retries?: number;
	retryDelay?: number;
}

export interface ApiResponse<T> {
	data: T;
	status: number;
	statusText: string;
	headers: Headers;
}

export class FetchError extends Error {
	constructor(
		public status: number,
		public statusText: string,
		public url: string,
		message?: string
	) {
		super(message || `HTTP ${status}: ${statusText}`);
		this.name = 'FetchError';
	}
}

export async function fetchWithRetry<T = unknown>(
	url: string,
	options: FetchOptions = {}
): Promise<ApiResponse<T>> {
	const { timeout = 10000, retries = 3, retryDelay = 1000, ...fetchOptions } = options;

	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeout);

	let lastError: Error | undefined;

	for (let attempt = 0; attempt <= retries; attempt++) {
		try {
			const response = await fetch(url, {
				...fetchOptions,
				signal: controller.signal,
				headers: {
					'Content-Type': 'application/json',
					...fetchOptions.headers
				}
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				throw new FetchError(
					response.status,
					response.statusText,
					url,
					`Request failed: ${response.status} ${response.statusText}`
				);
			}

			const data = await response.json();

			return {
				data,
				status: response.status,
				statusText: response.statusText,
				headers: response.headers
			};
		} catch (error) {
			lastError = error as Error;

			// Don't retry on client errors (4xx) or abort errors
			if (error instanceof FetchError && error.status >= 400 && error.status < 500) {
				throw error;
			}

			if (error instanceof Error && error.name === 'AbortError') {
				throw new Error(`Request timeout after ${timeout}ms`);
			}

			// Wait before retrying (except on last attempt)
			if (attempt < retries) {
				await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)));
			}
		}
	}

	// This should never happen since we always catch errors, but TypeScript needs assurance
	throw lastError || new Error('Unknown error occurred');
}

export async function get<T = unknown>(
	url: string,
	options?: Omit<FetchOptions, 'method' | 'body'>
): Promise<ApiResponse<T>> {
	return fetchWithRetry<T>(url, { ...options, method: 'GET' });
}

export async function post<T = unknown>(
	url: string,
	body?: unknown,
	options?: Omit<FetchOptions, 'method' | 'body'>
): Promise<ApiResponse<T>> {
	return fetchWithRetry<T>(url, {
		...options,
		method: 'POST',
		body: body ? JSON.stringify(body) : undefined
	});
}

export async function put<T = unknown>(
	url: string,
	body?: unknown,
	options?: Omit<FetchOptions, 'method' | 'body'>
): Promise<ApiResponse<T>> {
	return fetchWithRetry<T>(url, {
		...options,
		method: 'PUT',
		body: body ? JSON.stringify(body) : undefined
	});
}

export async function del<T = unknown>(
	url: string,
	options?: Omit<FetchOptions, 'method' | 'body'>
): Promise<ApiResponse<T>> {
	return fetchWithRetry<T>(url, { ...options, method: 'DELETE' });
}

export async function patch<T = unknown>(
	url: string,
	body?: unknown,
	options?: Omit<FetchOptions, 'method' | 'body'>
): Promise<ApiResponse<T>> {
	return fetchWithRetry<T>(url, {
		...options,
		method: 'PATCH',
		body: body ? JSON.stringify(body) : undefined
	});
}

export async function fetchJson<T = unknown>(url: string, options: FetchOptions = {}): Promise<T> {
	const response = await fetchWithRetry<T>(url, options);
	return response.data;
}

export async function getJson<T = unknown>(
	url: string,
	options?: Omit<FetchOptions, 'method' | 'body'>
): Promise<T> {
	return fetchJson<T>(url, { ...options, method: 'GET' });
}

export async function postJson<T = unknown>(
	url: string,
	body?: unknown,
	options?: Omit<FetchOptions, 'method' | 'body'>
): Promise<T> {
	return fetchJson<T>(url, {
		...options,
		method: 'POST',
		body: body ? JSON.stringify(body) : undefined
	});
}

export function createFetchInstance(baseConfig: FetchOptions = {}) {
	return {
		get: <T = unknown>(url: string, options?: FetchOptions) =>
			get<T>(url, { ...baseConfig, ...options }),
		post: <T = unknown>(url: string, body?: unknown, options?: FetchOptions) =>
			post<T>(url, body, { ...baseConfig, ...options }),
		put: <T = unknown>(url: string, body?: unknown, options?: FetchOptions) =>
			put<T>(url, body, { ...baseConfig, ...options }),
		del: <T = unknown>(url: string, options?: FetchOptions) =>
			del<T>(url, { ...baseConfig, ...options }),
		patch: <T = unknown>(url: string, body?: unknown, options?: FetchOptions) =>
			patch<T>(url, body, { ...baseConfig, ...options }),
		fetchJson: <T = unknown>(url: string, options?: FetchOptions) =>
			fetchJson<T>(url, { ...baseConfig, ...options }),
		getJson: <T = unknown>(url: string, options?: FetchOptions) =>
			getJson<T>(url, { ...baseConfig, ...options }),
		postJson: <T = unknown>(url: string, body?: unknown, options?: FetchOptions) =>
			postJson<T>(url, body, { ...baseConfig, ...options })
	};
}
