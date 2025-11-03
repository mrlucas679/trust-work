# TrustWork Component Library Documentation

## Overview

This documentation provides comprehensive guidance for using TrustWork's component library. All components are built with React, TypeScript, and Tailwind CSS, following the shadcn/ui pattern.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Design Tokens](#design-tokens)
3. [Core Components](#core-components)
4. [Layout Components](#layout-components)
5. [Form Components](#form-components)
6. [Feedback Components](#feedback-components)
7. [Accessibility](#accessibility)
8. [Best Practices](#best-practices)

## Getting Started

### Importing Components

All components are available from the `@/components/ui` directory:

```typescript
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
```

### Design Tokens

Import design tokens for consistent styling:

```typescript
import { designTokens } from '@/lib/design-tokens';
import { getSpacing, spacingPresets } from '@/lib/spacing-utils';
```

## Design Tokens

### Colors

```typescript
import { colors } from '@/lib/design-tokens';

// Brand colors
colors.brand.primary // hsl(217 91% 60%)
colors.brand.secondary // hsl(214 32% 91%)

// Semantic colors
colors.semantic.success // hsl(142 76% 36%)
colors.semantic.warning // hsl(38 92% 50%)
colors.semantic.destructive // hsl(0 84% 60%)
```

### Spacing

```typescript
import { spacing, componentSpacing } from '@/lib/design-tokens';

// Standard spacing
spacing[4] // 1rem (16px)
spacing[6] // 1.5rem (24px)

// Component-specific spacing
componentSpacing.card.padding // 1.5rem
componentSpacing.form.fieldGap // 1rem
```

### Typography

```typescript
import { fontSize, fontWeight } from '@/lib/design-tokens';

fontSize.base // { size: '1rem', lineHeight: '1.5rem' }
fontWeight.semibold // '600'
```

## Core Components

### Button

Versatile button component with multiple variants.

#### Usage

```tsx
import { Button } from '@/components/ui/button';

<Button variant="default">Click me</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

#### Props

- `variant`: `default` | `destructive` | `outline` | `secondary` | `ghost` | `link`
- `size`: `default` | `sm` | `lg` | `icon`
- `disabled`: boolean
- `asChild`: boolean (render as child component)

#### Examples

```tsx
// Primary action
<Button>Submit</Button>

// Destructive action
<Button variant="destructive">Delete Account</Button>

// With icon
<Button>
  <Plus className="mr-2 h-4 w-4" />
  Add Item
</Button>

// Icon only
<Button size="icon" aria-label="Settings">
  <Settings className="h-4 w-4" />
</Button>

// Loading state
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Loading...
</Button>
```

#### Accessibility

- Always add `aria-label` for icon-only buttons
- Use `disabled` for loading states
- Ensure minimum 44x44px touch target

### Card

Container component for grouped content.

#### Usage

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

#### Examples

```tsx
// Simple card
<Card>
  <CardContent className="p-6">
    <p>Simple content</p>
  </CardContent>
</Card>

// Card with header and footer
<Card>
  <CardHeader>
    <CardTitle>Profile Settings</CardTitle>
    <CardDescription>Manage your account settings</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <Input placeholder="Name" />
    <Input placeholder="Email" />
  </CardContent>
  <CardFooter className="flex justify-end gap-2">
    <Button variant="outline">Cancel</Button>
    <Button>Save</Button>
  </CardFooter>
</Card>
```

### Badge

Small status indicator component.

#### Usage

```tsx
import { Badge } from '@/components/ui/badge';

<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
```

#### Examples

```tsx
// Status indicators
<Badge>Active</Badge>
<Badge variant="secondary">Pending</Badge>
<Badge variant="destructive">Rejected</Badge>

// With custom styling
<Badge className="bg-green-500">Verified</Badge>
```

## Layout Components

### AppLayout

Main application layout with navbar and sidebar.

#### Usage

```tsx
import { AppLayout } from '@/components/layout/AppLayout';

<AppLayout>
  <YourContent />
</AppLayout>
```

#### Structure

- Fixed navbar at top (64px height)
- Collapsible sidebar (256px width)
- Main content area with independent scrolling
- Responsive behavior (sidebar collapses on mobile)

### DashboardLayout

Dashboard-specific layout with navigation.

#### Usage

```tsx
import { DashboardLayout } from '@/components/layout/DashboardLayout';

<DashboardLayout>
  <DashboardContent />
</DashboardLayout>
```

## Form Components

### Input

Text input with label and error support.

#### Usage

```tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input 
    id="email" 
    type="email" 
    placeholder="Enter email"
    aria-invalid={!!error}
    aria-describedby={error ? "email-error" : undefined}
  />
  {error && <p id="email-error" className="text-sm text-destructive">{error}</p>}
</div>
```

#### Props

- `type`: HTML input type
- `disabled`: boolean
- `placeholder`: string
- `aria-invalid`: boolean
- `aria-describedby`: string

### Form

Form wrapper with validation support (React Hook Form).

#### Usage

```tsx
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

const form = useForm();

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input placeholder="email@example.com" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit">Submit</Button>
  </form>
</Form>
```

### Select

Dropdown select component.

#### Usage

```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

## Feedback Components

### Toast

Notification component for user feedback.

#### Usage

```tsx
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

toast({
  title: "Success",
  description: "Your changes have been saved.",
  variant: "default"
});

toast({
  title: "Error",
  description: "Something went wrong.",
  variant: "destructive"
});
```

### Alert

Static alert component for important messages.

#### Usage

```tsx
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

<Alert>
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>
    You have 3 new notifications.
  </AlertDescription>
</Alert>

<Alert variant="destructive">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Your session has expired. Please log in again.
  </AlertDescription>
</Alert>
```

### Dialog (Modal)

Modal dialog component.

#### Usage

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogDescription>
        This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button variant="destructive" onClick={handleConfirm}>
        Delete
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Accessibility

### Focus Management

All interactive components include proper focus indicators:

```css
/* Applied globally */
button:focus-visible,
a:focus-visible,
input:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}
```

### ARIA Labels

Always provide labels for interactive elements:

```tsx
// Icon buttons
<Button size="icon" aria-label="Close dialog">
  <X className="h-4 w-4" />
</Button>

// Form fields
<Input 
  aria-label="Search" 
  aria-describedby="search-help"
/>
<span id="search-help">Enter keywords to search</span>
```

### Keyboard Navigation

All components support keyboard navigation:

- Tab: Move between focusable elements
- Enter/Space: Activate buttons and links
- Escape: Close modals and dropdowns
- Arrow keys: Navigate menus and selects

### Screen Readers

Provide context for screen reader users:

```tsx
// Loading states
<div aria-busy={isLoading} aria-live="polite">
  {isLoading ? (
    <span className="sr-only">Loading...</span>
  ) : content}
</div>

// Form errors
<div role="alert" aria-live="polite">
  {error && <p>{error}</p>}
</div>
```

## Best Practices

### 1. Consistent Spacing

Use design tokens for spacing:

```tsx
// Good
<div className="space-y-4">
  <Input />
  <Input />
</div>

// Better (using tokens)
import { spacingPresets } from '@/lib/spacing-utils';

<div className={spacingPresets.formFieldGap}>
  <Input />
  <Input />
</div>
```

### 2. Responsive Design

Use mobile-first approach:

```tsx
<Card className="p-4 md:p-6 lg:p-8">
  <CardContent>
    Responsive padding
  </CardContent>
</Card>
```

### 3. Loading States

Always provide feedback during async operations:

```tsx
<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Loading...
    </>
  ) : (
    'Submit'
  )}
</Button>
```

### 4. Error Handling

Provide clear error messages:

```tsx
<FormItem>
  <FormLabel>Email</FormLabel>
  <FormControl>
    <Input {...field} aria-invalid={!!error} />
  </FormControl>
  <FormMessage>{error?.message}</FormMessage>
</FormItem>
```

### 5. Touch Targets

Ensure minimum 44x44px for mobile:

```tsx
// Good for mobile
<Button className="min-h-[44px] min-w-[44px]">
  Click
</Button>

// Icon buttons
<Button size="icon" className="h-11 w-11">
  <Icon />
</Button>
```

### 6. Dark Mode

All components support dark mode automatically:

```tsx
// Colors automatically adapt
<Card className="bg-card text-card-foreground">
  Content
</Card>
```

### 7. Performance

Use lazy loading for heavy components:

```tsx
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

<Suspense fallback={<Skeleton />}>
  <HeavyComponent />
</Suspense>
```

## Resources

- [Storybook](http://localhost:6006) - Interactive component explorer
- [Design Tokens](../src/lib/design-tokens.ts) - Complete token reference
- [Spacing Utils](../src/lib/spacing-utils.ts) - Spacing helper functions
- [Accessibility Audit](./ACCESSIBILITY_AUDIT.md) - Accessibility guidelines

## Support

For questions or issues with components:

1. Check Storybook for interactive examples
2. Review component source code in `src/components/ui`
3. Consult design token documentation
4. Test with accessibility tools (jest-axe, screen readers)
