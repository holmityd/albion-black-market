<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>


<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "$lib/components/ui/tabs/index.js";
</script>

<div class="container mx-auto p-8 space-y-8">
  <h1 class="text-4xl font-bold">Albion Black Market</h1>
  
  <Tabs value="overview" class="w-full">
    <TabsList>
      <TabsTrigger value="overview">Overview</TabsTrigger>
      <TabsTrigger value="search">Search Items</TabsTrigger>
      <TabsTrigger value="profile">Profile</TabsTrigger>
    </TabsList>
    
    <TabsContent value="overview" class="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Market Overview</CardTitle>
          <CardDescription>Current market trends and statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="flex gap-2">
            <Badge>Active</Badge>
            <Badge variant="secondary">Updated</Badge>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
    
    <TabsContent value="search" class="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Item Search</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label for="item-search">Search Items</Label>
            <Input id="item-search" placeholder="Enter item name..." />
          </div>
          <Button>Search Market</Button>
        </CardContent>
      </Card>
    </TabsContent>
  </Tabs>
</div>

<Button>Click me</Button>


## Example Usage After Installation

Once all components are installed, you can update your <mcfile name="+page.svelte" path="c:\\Users\\Nicat\\Desktop\\albion-black-market\\src\\routes\\+page.svelte"></mcfile>:
