# Sidebar Implementation Guide

## Overview

This document describes the sidebar implementation in TrustWork, including architecture, best practices, error handling, and troubleshooting guidelines.

## Architecture

### Component Hierarchy

```
SidebarProvider (Context Provider)
└── DashboardLayout
    ├── TopNavigation (Fixed navbar)
    ├── SidebarErrorBoundary
    │   └── AppSidebar
    │       ├── Sidebar (shadcn/ui)
    │       │   └── SidebarContent
    │       │       ├── SidebarGroup (Main Navigation)
    │       │       └── SidebarGroup (Support Navigation)
    │       └── NavigationItem components
    └── SidebarInset (Main content area)
```

### Key Files

- **`src/components/ui/sidebar.tsx`**: Base sidebar components from shadcn/ui with custom enhancements
- **`src/components/layout/AppSidebar.tsx`**: Application-specific sidebar implementation
- **`src/components/layout/DashboardLayout.tsx`**: Layout wrapper that integrates sidebar with navbar
- **`src/components/error/SidebarErrorBoundary.tsx`**: Error boundary for sidebar resilience
- **`src/hooks/use-mobile.tsx`**: Mobile detection hook with debouncing

## State Management

### Context-Based State

The sidebar uses React Context (`SidebarContext`) to manage state across components:

```typescript
interface SidebarContext {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}
```

### State Persistence

- Desktop sidebar state is persisted via cookies (`sidebar:state`)
- Cookie max age: 7 days
- Mobile sidebar state is session-based (not persisted)

## Responsive Behavior

### Breakpoints

- **Mobile**: `< 768px` - Sheet-based overlay sidebar
- **Desktop**: `>= 768px` - Fixed positioned sidebar

### Mobile Mode

- Sidebar appears as a Sheet (modal overlay)
- Closes automatically on navigation
- Body scroll is locked when open
- Backdrop overlay for dismissal

### Desktop Mode

- Fixed positioned on the left
- Can be collapsed/expanded
- Keyboard shortcut: `Ctrl/Cmd + B`
- State persisted across sessions

## Layout System

### Fixed Navbar Integration

The sidebar is positioned below the fixed navbar:

```css
/* Navbar */
height: 4rem (64px)
position: fixed
top: 0
z-index: var(--z-navbar) /* 50 */

/* Sidebar */
position: fixed
top: 4rem
height: calc(100vh - 4rem)
z-index: var(--z-sidebar-desktop) /* 10 */

/* Main Content */
position: fixed
top: 4rem
left: 0 (or sidebar width on desktop)
height: calc(100vh - 4rem)
overflow-y: auto
```

### Z-Index Layers

Defined in `src/index.css`:

```css
--z-base: 1
--z-sidebar-desktop: 10
--z-overlay: 20
--z-sidebar-mobile: 30
--z-navbar: 50
--z-modal: 100
--z-toast: 200
--z-skip-link: 9999
```

## Error Handling

### Error Boundary Protection

The sidebar is wrapped in `SidebarErrorBoundary` which:

- Catches React rendering errors
- Displays user-friendly fallback UI
- Logs errors to console (and can be sent to monitoring service)
- Provides retry mechanism
- Does not crash the entire application

### Defensive Checks

All sidebar components include defensive programming:

1. **Context Availability**: Check if `useSidebar` context exists
2. **DOM Availability**: Check if `window` and `document` exist (SSR)
3. **Function Validity**: Verify functions exist before calling
4. **Try-Catch Blocks**: Wrap critical operations
5. **Array Filtering**: Filter invalid navigation items before rendering

### Error Logging

Errors are logged with descriptive prefixes:

```typescript
console.error('Sidebar: Error updating state or cookie', error)
console.error('AppSidebar: useSidebar hook failed', error)
console.error('useIsMobile: Error in resize handler', error)
```

## Best Practices

### 1. Always Use Within SidebarProvider

```tsx
// ✅ Correct
<SidebarProvider>
  <AppSidebar />
</SidebarProvider>

// ❌ Wrong - will throw error
<AppSidebar />
```

### 2. Use Error Boundary

```tsx
// ✅ Recommended
<SidebarErrorBoundary>
  <AppSidebar />
</SidebarErrorBoundary>

// ⚠️ Not recommended - errors will crash app
<AppSidebar />
```

### 3. Debounce Resize Events

The `useIsMobile` hook automatically debounces (150ms) to prevent:
- Excessive re-renders during window resize
- Layout thrashing
- Performance degradation

### 4. Proper Cleanup

All event listeners are properly cleaned up in `useEffect` returns:

```typescript
React.useEffect(() => {
  window.addEventListener("keydown", handleKeyDown)
  return () => {
    window.removeEventListener("keydown", handleKeyDown)
  }
}, [])
```

### 5. Accessibility

- Semantic HTML elements (`<nav>`, `<aside>`)
- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader announcements

## Common Issues and Solutions

### Issue: Sidebar Not Appearing

**Symptoms**: Sidebar is invisible or not rendering

**Possible Causes & Solutions**:

1. **Missing SidebarProvider**
   ```tsx
   // Solution: Wrap layout in SidebarProvider
   <SidebarProvider>
     <YourLayout />
   </SidebarProvider>
   ```

2. **Z-index conflict**
   ```css
   /* Solution: Check CSS variables in index.css */
   --z-sidebar-desktop: 10; /* Should be less than navbar */
   ```

3. **CSS class collision**
   - Check for conflicting `fixed` positioning
   - Verify `sidebar-with-navbar` class is applied

### Issue: Sidebar Overlaps Navbar

**Symptoms**: Sidebar appears on top of the navbar

**Solution**: Ensure correct positioning:

```tsx
// Navbar should have higher z-index
style={{ zIndex: 'var(--z-navbar)' }} // 50

// Sidebar should be positioned below navbar
className="md:top-16 md:h-[calc(100vh-4rem)]"
```

### Issue: Mobile Sidebar Won't Close

**Symptoms**: Clicking navigation items doesn't close mobile sidebar

**Solution**: Ensure `onClick` handler is passed and called:

```tsx
<NavigationItem
  onClick={handleNavigationClick} // This closes sidebar on mobile
  {...otherProps}
/>
```

### Issue: Content Scroll Issues

**Symptoms**: Main content doesn't scroll, or scrolls incorrectly

**Solution**: Check layout structure:

```tsx
// Main content should be in SidebarInset
<SidebarInset className="fixed top-16 overflow-y-auto">
  {/* Your content */}
</SidebarInset>
```

### Issue: Keyboard Shortcut Not Working

**Symptoms**: `Ctrl/Cmd + B` doesn't toggle sidebar

**Possible Causes**:

1. Browser extension intercepting shortcut
2. Other component capturing event
3. SidebarProvider not mounted

**Solution**: Check console for errors and verify provider is active

### Issue: Hydration Mismatch (SSR)

**Symptoms**: React hydration errors in SSR environment

**Solution**: `useIsMobile` hook handles SSR:

```typescript
const [isMobile, setIsMobile] = React.useState<boolean>(() => {
  if (typeof window !== 'undefined') {
    return window.innerWidth < MOBILE_BREAKPOINT
  }
  return false // Safe default for SSR
})
```

## Performance Considerations

### 1. Memoization

Navigation items are memoized to prevent unnecessary re-renders:

```typescript
const handleNavigationClick = React.useCallback(() => {
  setOpenMobile(false)
}, [setOpenMobile])
```

### 2. Lazy Loading

Navigation items can be lazy-loaded if needed:

```typescript
const NavigationItem = React.lazy(() => import('./NavigationItem'))
```

### 3. Debounced Resize

The mobile detection hook debounces resize events (150ms) to balance responsiveness and performance.

### 4. CSS Transitions

Hardware-accelerated CSS transitions are used:

```css
transition: transform 300ms ease-in-out;
transform: translateX(0); /* GPU accelerated */
```

## Testing Recommendations

### Unit Tests

Test each component in isolation:

```typescript
describe('AppSidebar', () => {
  it('should render navigation items', () => {
    render(
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>
    )
    expect(screen.getByText('My Space')).toBeInTheDocument()
  })
})
```

### Integration Tests

Test sidebar behavior with layout:

```typescript
it('should close on navigation click (mobile)', () => {
  const { getByText } = render(<DashboardLayout />)
  fireEvent.click(getByText('Jobs'))
  // Assert sidebar is closed
})
```

### E2E Tests

Test complete user flows:

```typescript
test('should navigate using sidebar', async ({ page }) => {
  await page.goto('/dashboard')
  await page.click('[data-testid="nav-jobs"]')
  await expect(page).toHaveURL('/jobs')
})
```

### Error Boundary Tests

Test error recovery:

```typescript
it('should show fallback UI on error', () => {
  const ThrowError = () => {
    throw new Error('Test error')
  }
  
  render(
    <SidebarErrorBoundary>
      <ThrowError />
    </SidebarErrorBoundary>
  )
  
  expect(screen.getByText('Navigation Error')).toBeInTheDocument()
})
```

## Future Enhancements

### Potential Improvements

1. **Nested Navigation**: Support for sub-menus and grouped items
2. **Customization API**: Allow runtime customization of sidebar items
3. **Animation Library**: Use Framer Motion for advanced animations
4. **Virtual Scrolling**: For sidebars with many items
5. **Search/Filter**: Built-in search for navigation items
6. **Collapsible Groups**: Expand/collapse navigation groups
7. **Drag-to-Resize**: Allow users to resize sidebar width
8. **Pinned Items**: Allow users to pin favorite navigation items

### Monitoring Recommendations

1. Track sidebar errors in production (Sentry, LogRocket, etc.)
2. Monitor performance metrics (render time, interaction delay)
3. A/B test different layouts and behaviors
4. Collect user feedback on navigation experience

## Version History

- **v1.0.0** (Current): Initial implementation with error handling and responsive design
- Focus: Stability, accessibility, and error resilience

## Support

For issues or questions about the sidebar implementation:

1. Check this documentation first
2. Review error logs in browser console
3. Verify all required components are properly imported
4. Check GitHub issues for known problems
5. Create a new issue with reproduction steps

## References

- [shadcn/ui Sidebar Documentation](https://ui.shadcn.com/docs/components/sidebar)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Responsive Design Best Practices](https://web.dev/responsive-web-design-basics/)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
