<script lang="ts">
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';

	interface Props {
		label: string;
		value: string | string[];
		options: string[];
		multiple?: boolean;
		onValueChange?: (value: string | string[]) => void;
		placeholder?: string;
		disabled?: boolean;
		class?: string;
	}

	let {
		label,
		value = $bindable(),
		options,
		multiple,
		onValueChange,
		placeholder = 'Select an option...',
		disabled = false,
		class: className = ''
	}: Props = $props();

	let selectTriggerRef: HTMLButtonElement | null = $state(null);

	const SPACE_KEY_EVENT_CONFIG = {
		key: ' ',
		code: 'Space',
		bubbles: true,
		cancelable: true
	} as const;

	function handleLabelClick() {
		if (!selectTriggerRef || disabled) return;

		selectTriggerRef.dispatchEvent(new KeyboardEvent('keydown', SPACE_KEY_EVENT_CONFIG));
		selectTriggerRef.dispatchEvent(new KeyboardEvent('keyup', SPACE_KEY_EVENT_CONFIG));
	}

	function handleValueChange(newValue: string | string[]): void {
		value = newValue;
		onValueChange?.(newValue);
	}

	function displayName(name: string | string[]) {
		if (Array.isArray(name)) {
			return name.join(',');
		}
		name = name.charAt(0).toUpperCase() + name.slice(1);
		name = name.replace('_', ' ');
		return name;
	}

	const displayValue = $derived(displayName(value || placeholder));
</script>

<div class="space-y-2">
	<Label for={selectTriggerRef?.id} onclick={handleLabelClick} class="cursor-pointer select-none">
		{label}
	</Label>
	<Select.Root
		type={multiple ? 'multiple' : 'single'}
		bind:value
		onValueChange={handleValueChange}
		{disabled}
	>
		<Select.Trigger
			bind:ref={selectTriggerRef}
			{disabled}
			class={className}
			aria-label={`Select ${label.toLowerCase()}`}
		>
			<span class:text-muted-foreground={!value}>
				{displayValue}
			</span>
		</Select.Trigger>
		<Select.Content>
			{#each options as option (option)}
				<Select.Item value={option} label={option} {disabled}>{displayName(option)}</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
</div>
