# Shared Components Documentation

This directory contains reusable UI components used throughout the EverMedical platform. These components are designed to be composable, accessible, and consistent with our design system.

## 🧩 Component Categories

### Authentication Components
- **`ProtectedRoute`** - Route wrapper for authenticated pages
- **`ProfileForm`** - User profile editing with type-safe form handling

### Navigation & Layout
- **`TopNav`** - Main navigation bar with user menu
- **`Footer`** - Site footer with links and branding
- **`AppShell`** - Main application layout wrapper

### Interactive Components
- **`LocationFilter`** - Geographic filtering for events
- **`SpecialtySelect`** - Medical specialty selection dropdown
- **`RFQAssistant`** - AI-powered RFQ creation assistant

### Content Display
- **`HeroSection`** - Landing page hero with CTA
- **`FeatureTile`** - Feature highlighting component
- **`StatPill`** - Statistic display badge
- **`BlurredText`** - Privacy-protected text display

### Accessibility Components
- **`SkipToContent`** - Skip navigation for screen readers
- **`LiveRegion`** - ARIA live region for dynamic updates
- **`FocusManager`** - Focus management for modals/overlays

## 📋 Usage Guidelines

### Import Pattern
```typescript
import { ComponentName } from '@/components/shared/ComponentName';
```

### Props Documentation
All components include comprehensive TypeScript interfaces for props. Use your IDE's IntelliSense for detailed prop information.

### Accessibility Requirements
- All components support keyboard navigation
- Screen reader compatibility via ARIA labels
- Color contrast ratios meet WCAG 2.1 AA standards
- Focus indicators are clearly visible

### Design System Integration
- Components use design tokens from `index.css`
- Consistent spacing via Tailwind utilities
- Responsive design with mobile-first approach
- Dark/light mode support built-in

## 🔧 Development Guidelines

### Component Structure
```typescript
/**
 * Component description and purpose
 * 
 * @param props - Component properties
 * @returns JSX element
 */
export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // Component logic
  return (
    <div className="component-styles">
      {/* Component content */}
    </div>
  );
}
```

### Testing Requirements
- Unit tests for component logic
- Accessibility tests with @testing-library/jest-dom
- Visual regression tests for UI consistency
- Integration tests for complex interactions

### Performance Considerations
- Use `React.memo()` for expensive components
- Implement proper dependency arrays in hooks
- Avoid inline object/function creation in render
- Lazy load heavy components when appropriate

## 📚 Component Reference

### High-Priority Components
These components are critical to the application and require careful consideration when modifying:

- **`ProtectedRoute`** - Security boundary for authenticated content
- **`ErrorBoundary`** - Error handling for graceful degradation  
- **`ProfileForm`** - User data collection with validation
- **`TopNav`** - Primary navigation and user actions

### Utility Components
Helper components that enhance UX:

- **`EmptyState`** - Consistent empty state messaging
- **`ExternalLink`** - Secure external link handling
- **`SpecialtyBreadcrumb`** - Specialty navigation breadcrumbs
- **`UsernameField`** - Username input with availability checking

## 🚀 Contributing

When creating new shared components:

1. **Follow naming conventions** - Use PascalCase for component names
2. **Include TypeScript interfaces** - Define clear prop types
3. **Add JSDoc comments** - Document purpose and usage
4. **Implement accessibility** - Support keyboard and screen readers
5. **Write tests** - Include unit and accessibility tests
6. **Update documentation** - Add component to this README

### Code Review Checklist
- [ ] Component is properly typed with TypeScript
- [ ] Accessibility requirements are met
- [ ] Tests cover main functionality
- [ ] Documentation is updated
- [ ] Design system tokens are used
- [ ] Performance is optimized