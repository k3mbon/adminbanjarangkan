# CSS Architecture Documentation

## Overview
This document outlines the CSS architecture, dependencies, and styling guidelines for the Admin Banjarangkan project.

## File Structure and Dependencies

### Core Design System
- **`design-system.css`** - Foundation file containing all CSS custom properties, utility classes, and base styles
  - Must be loaded first
  - Contains color palette, typography, spacing, and component tokens
  - Includes light/dark theme definitions
  - WCAG AA compliant color combinations

### Layout Components
- **`DashboardLayout.css`** - Main dashboard layout and sidebar styling
  - Depends on: `design-system.css`
  - Contains responsive breakpoints and sidebar positioning
  - Fixed positioning implementation for sidebar
  - Mobile-first responsive design

### Page-Specific Styles
- **`Home.css`** - Homepage styling (scoped to avoid conflicts)
- **`Login.css`** - Authentication pages
- **`PostView.css`** - Blog post display
- **`PostsList.css`** - Blog posts listing
- **`PendingPostsList.css`** - Admin post management

### Form Components
- **`BlogForm.css`** - Blog creation/editing forms
- **`GalleryForm.css`** - Image gallery forms
- **`PrestasiForm.css`** - Achievement forms
- **`ReminderForm.css`** - Reminder creation forms

### List Components
- **`DocumentList.css`** - Document listing
- **`ListAlbumFoto.css`** - Photo album listing
- **`ListPrestasi.css`** - Achievement listing
- **`ReminderList.css`** - Reminder listing

### Media Components
- **`CarouselImage.css`** - Image carousel functionality

### Legacy Files
- **`Sidebar.css`** - DEPRECATED - Contains conflicting styles, replaced by DashboardLayout.css

## Dependency Chain
```
design-system.css (foundation)
├── DashboardLayout.css (layout)
├── Home.css (scoped)
├── Login.css
├── PostView.css
├── PostsList.css
├── PendingPostsList.css
├── BlogForm.css
├── GalleryForm.css
├── PrestasiForm.css
├── ReminderForm.css
├── DocumentList.css
├── ListAlbumFoto.css
├── ListPrestasi.css
├── ReminderList.css
└── CarouselImage.css
```

## Resolved Conflicts

### 1. Sidebar Styling Conflicts
- **Issue**: `Sidebar.css` contained hardcoded colors (#333, #fff, #555) that overrode design system
- **Resolution**: Deprecated `Sidebar.css`, moved all sidebar styles to `DashboardLayout.css`
- **Impact**: Consistent theming and proper dark mode support

### 2. Main Content Layout Conflicts
- **Issue**: Global `.main-content` class in `Home.css` conflicted with `DashboardLayout.css`
- **Resolution**: Scoped Home.css styles to `.home-page .main-content`
- **Impact**: Prevents layout conflicts between pages

### 3. Hardcoded Color Values
- **Issue**: Multiple files used hardcoded hex colors instead of design system variables
- **Resolution**: Replaced all hardcoded colors with CSS custom properties
- **Files Updated**: `DocumentList.css`, `PendingPostsList.css`, `BlogForm.css`
- **Impact**: Consistent theming, proper dark mode support, easier maintenance

## Design System Usage Guidelines

### Color Usage
- Always use CSS custom properties: `var(--color-name)`
- Primary colors: `--primary-50` through `--primary-900`
- Semantic colors: `--success-*`, `--warning-*`, `--error-*`
- Text colors: `--text-primary`, `--text-secondary`, `--text-muted`
- Background colors: `--bg-primary`, `--bg-secondary`, `--bg-card`

### Spacing
- Use spacing scale: `var(--space-1)` through `var(--space-16)`
- Consistent spacing maintains visual rhythm

### Typography
- Font sizes: `var(--text-xs)` through `var(--text-6xl)`
- Font weights: `var(--font-light)` through `var(--font-black)`
- Line heights: `var(--leading-tight)` through `var(--leading-loose)`

### Responsive Design
- Mobile-first approach
- Breakpoints: `--breakpoint-sm`, `--breakpoint-md`, `--breakpoint-lg`, `--breakpoint-xl`

## Accessibility Standards

### WCAG AA Compliance
- Minimum contrast ratio 4.5:1 for normal text
- Minimum contrast ratio 3:1 for large text (18pt+ or 14pt+ bold)
- All color combinations tested and verified

### Dark Mode Support
- Complete dark theme implementation
- Automatic theme switching support
- High contrast mode compatibility

## Maintenance Guidelines

### Adding New Styles
1. Check if existing utility classes can be used
2. Use design system variables for all values
3. Follow BEM naming convention for component-specific classes
4. Test in both light and dark themes
5. Verify WCAG compliance for new color combinations

### Modifying Existing Styles
1. Check for dependencies in other files
2. Test across all breakpoints
3. Verify theme consistency
4. Update this documentation if architectural changes are made

### Performance Considerations
- CSS custom properties enable efficient theme switching
- Utility classes reduce CSS bundle size
- Scoped styles prevent global conflicts

## File Loading Order
1. `design-system.css` (must be first)
2. `DashboardLayout.css` (layout foundation)
3. Component-specific CSS files as needed
4. Never load `Sidebar.css` (deprecated)

## Future Improvements
- Consider CSS-in-JS migration for component isolation
- Implement CSS modules for better scoping
- Add CSS custom property fallbacks for older browsers
- Consider PostCSS for advanced optimizations