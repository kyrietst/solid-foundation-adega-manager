# Design System Governance
**Adega Manager Design System - Official Constitution**

Version: 2.0.0
Created: September 19, 2025
Last Updated: September 19, 2025
Status: ✅ ACTIVE

---

## 📋 Table of Contents

1. [Fundamental Principles](#-fundamental-principles)
2. [Design Token Governance](#-design-token-governance)
3. [Component Architecture Rules](#-component-architecture-rules)
4. [Naming Conventions](#-naming-conventions)
5. [Accessibility Standards](#-accessibility-standards)
6. [Layout System Guidelines](#-layout-system-guidelines)
7. [Development Workflow](#-development-workflow)
8. [Quality Assurance](#-quality-assurance)
9. [Breaking Changes Protocol](#-breaking-changes-protocol)
10. [Enforcement and Compliance](#-enforcement-and-compliance)

---

## 🎯 Fundamental Principles

### 1. **Consistency Above All**
> "One system, one way of doing things, infinite possibilities"

- **Single Source of Truth**: All design decisions must originate from documented tokens and patterns
- **No Exceptions Rule**: Hardcoded values are forbidden unless explicitly documented as exceptions
- **Systematic Approach**: Every UI element must follow established patterns or create new reusable ones

### 2. **Accessibility is Not Optional**
> "Universal design benefits everyone"

- **WCAG 2.1 AA Compliance**: Mandatory for all components and patterns
- **Progressive Enhancement**: Start accessible, enhance with advanced features
- **Inclusive Design**: Consider diverse user needs from the beginning

### 3. **Performance First**
> "Speed is a feature, not an afterthought"

- **Bundle Size Awareness**: Every component addition must consider impact
- **Lazy Loading by Default**: Non-critical components must be lazily loaded
- **Optimize for Real Hardware**: Test on low-performance devices regularly

### 4. **Developer Experience**
> "Great tools create great products"

- **Type Safety**: TypeScript is mandatory for all design system components
- **IntelliSense Support**: All props and variants must be typed
- **Clear Error Messages**: Helpful validation with suggested solutions

### 5. **Maintainability**
> "Code is written once, read many times"

- **Self-Documenting Code**: Clear naming and structure over comments
- **Separation of Concerns**: Business logic separate from presentation
- **Future-Proof Architecture**: Design for change and evolution

---

## 🎨 Design Token Governance

### Token Hierarchy
```
Design Tokens (tailwind.config.ts)
├── Primitive Tokens (colors, spacing, typography)
├── Semantic Tokens (primary, secondary, success, error)
├── Component Tokens (button-primary, card-background)
└── Context Tokens (mobile-padding, desktop-spacing)
```

### Color Token Rules

#### ✅ APPROVED Usage
- **Always use design tokens**: `text-accent-gold-100`, `bg-primary-black`
- **Semantic naming**: Use intent-based names (`text-success`, `bg-warning`)
- **Consistent opacity**: Use token-based opacity levels (`/10`, `/20`, `/30`)

#### ❌ FORBIDDEN Practices
- **Hardcoded hex values**: `#FFD700`, `#000000`
- **Arbitrary values**: `text-[#custom]`, `bg-[rgb(255,215,0)]`
- **Magic numbers**: Opacity values not based on design system

#### Color Token Categories
1. **Primary Brand** (`primary-black`, `primary-yellow`)
2. **Extended Scales** (`black-100` to `black-60`, `yellow-100` to `yellow-60`)
3. **Professional Neutrals** (`gray-950` to `gray-50`)
4. **Modern Accents** (`accent-blue`, `accent-green`, `accent-red`, `accent-purple`, `accent-orange`)
5. **Golden System** (`accent-gold-100` to `accent-gold-5`)
6. **Semantic Colors** (`background`, `foreground`, `muted`, etc.)

### Dimension Token Rules

#### Width System
- **Column Widths**: `w-col-xs` (80px) to `w-col-max` (250px)
- **Modal Widths**: `w-modal-sm` (384px) to `w-modal-1400` (1400px)
- **Standard Widths**: Use Tailwind defaults (`w-full`, `w-1/2`, etc.)

#### Height System
- **Content Heights**: `h-content-xs` (40vh) to `h-content-full` (100vh)
- **Dialog Heights**: `h-dialog-xs` (30vh) to `h-dialog-xl` (90vh)
- **Decorative Heights**: `h-deco-thin` (1px) to `h-deco-border` (3px)

### Typography Token Rules
- **Font Family**: Only `font-sf-pro-display` (consolidated)
- **Weight Classes**: `font-sf-thin` to `font-sf-black` (9 weights available)
- **Semantic Hierarchy**: Use utility functions (`getSFProTextClasses()`)
- **Text Shadows**: Standardized effects (`text-shadow-glow-gold`)

---

## 🏗️ Component Architecture Rules

### Component Classification

#### 1. **Primitive Components** (`src/shared/ui/primitives/`)
- **Definition**: Basic building blocks from Shadcn/ui and Radix UI
- **Examples**: Button, Input, Dialog, Card
- **Rules**:
  - NEVER modify primitive components directly
  - Extend through composition, not inheritance
  - Maintain Shadcn/ui compatibility

#### 2. **Composite Components** (`src/shared/ui/composite/`)
- **Definition**: Combinations of primitives for specific use cases
- **Examples**: StatCard, PaginationControls, LoadingSpinner, SearchInput
- **Rules**:
  - Must be reusable across multiple features
  - Follow Container/Presentation pattern
  - Include proper TypeScript interfaces

#### 3. **Layout Components** (`src/shared/ui/layout/`)
- **Definition**: Structural components for consistent layouts
- **Examples**: PageContainer, PageHeader, DataTable, FormDialog
- **Rules**:
  - Enforce consistent spacing and structure
  - Support responsive design by default
  - Include accessibility landmarks

#### 4. **Feature Components** (`src/features/*/components/`)
- **Definition**: Feature-specific components
- **Rules**:
  - Consume shared components first
  - No hardcoded styling
  - Business logic in hooks, not components

### Component Creation Decision Tree
```
New UI Need Identified
├── Does exact primitive exist? → Use it
├── Can compose from primitives? → Create composite
├── Is it layout-related? → Create layout component
├── Is it feature-specific? → Create in feature/components
└── Is it reusable? → Promote to shared/ui
```

### Composition Over Inheritance
```tsx
// ✅ CORRECT - Composition
<StatCard variant="success" size="lg">
  <StatCard.Title>Revenue</StatCard.Title>
  <StatCard.Value>$42,000</StatCard.Value>
</StatCard>

// ❌ WRONG - Direct modification
<CustomStatCard className="bg-green-500 text-white" />
```

---

## 📝 Naming Conventions

### Component Naming

#### Files and Components
- **Components**: PascalCase (`StatCard`, `PaginationControls`)
- **Files**: PascalCase with `.tsx` extension (`StatCard.tsx`)
- **Directories**: kebab-case (`shared/ui/composite`)

#### Props and Variants
- **Props**: camelCase (`variant`, `showBorder`, `isLoading`)
- **Variants**: kebab-case strings (`'default'`, `'success'`, `'warning'`)
- **Boolean Props**: Positive naming (`isVisible`, not `isHidden`)

### CSS Class Naming
- **Utility Classes**: Follow Tailwind conventions
- **Custom Classes**: BEM methodology when needed
- **Component Classes**: Prefix with component name

```tsx
// ✅ CORRECT
<div className={cn(
  "stat-card",
  "rounded-lg border shadow-sm transition-colors",
  getValueClasses(size, variant)
)}>

// ❌ WRONG
<div className="my-custom-card red-border">
```

### Design Token Naming
- **Color Tokens**: `{category}-{name}-{variant?}`
  - Examples: `accent-gold-100`, `primary-yellow`
- **Dimension Tokens**: `{type}-{size}`
  - Examples: `modal-lg`, `col-xl`, `content-md`
- **Semantic Tokens**: `{intent}`
  - Examples: `background`, `foreground`, `muted`

---

## ♿ Accessibility Standards

### WCAG 2.1 AA Compliance Requirements

#### Color and Contrast
- **Text Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Background Contrast**: Sufficient contrast between all background/foreground combinations
- **Color Independence**: Never rely solely on color to convey information

#### Keyboard Navigation
- **Focus Management**: All interactive elements must be keyboard accessible
- **Focus Indicators**: Visible focus indicators for all interactive elements
- **Tab Order**: Logical tab sequence through interface
- **Skip Links**: Provide skip navigation for screen readers

#### Screen Reader Support
- **Semantic HTML**: Use proper HTML elements for their intended purpose
- **ARIA Labels**: Comprehensive labeling for complex components
- **Role Attributes**: Proper role definitions for custom components
- **State Communication**: Announce state changes to screen readers

#### Interactive Elements
```tsx
// ✅ CORRECT - Full accessibility
<Button
  variant="primary"
  aria-label="Delete product"
  aria-describedby="delete-help"
  onClick={handleDelete}
  disabled={isLoading}
>
  {isLoading ? <Spinner aria-hidden="true" /> : <TrashIcon aria-hidden="true" />}
  Delete
</Button>

// ❌ WRONG - No accessibility
<div onClick={handleDelete} className="delete-btn">
  🗑️
</div>
```

### Mandatory Accessibility Patterns

#### Form Controls
- **Labels**: Every input must have an associated label
- **Error Messages**: Clear, specific error messaging
- **Required Fields**: Marked with appropriate ARIA attributes
- **Validation**: Real-time validation with screen reader announcements

#### Modal Dialogs
- **Focus Trap**: Focus contained within modal
- **Escape Key**: Close modal with Escape
- **Return Focus**: Focus returns to trigger element
- **Role Dialog**: Proper ARIA dialog role

#### Data Tables
- **Column Headers**: Proper `<th>` elements with scope
- **Row Headers**: When applicable, use row headers
- **Caption**: Descriptive table caption
- **Sorting**: Announce sort state changes

---

## 📐 Layout System Guidelines

### Container Components

#### PageContainer
```tsx
// ✅ STANDARD USAGE
<PageContainer>
  <PageHeader title="Dashboard" />
  <PageContent>
    {/* Main content */}
  </PageContent>
</PageContainer>
```

**Rules:**
- **Always use PageContainer** for top-level page layouts
- **Consistent Spacing**: Automatic margin and padding management
- **Responsive**: Built-in breakpoint handling
- **Semantic Structure**: Proper landmarks and heading hierarchy

#### PageHeader
```tsx
// ✅ STANDARD PATTERN
<PageHeader
  title="PRODUCTS"
  count={products.length}
  countLabel="items"
>
  <Button variant="outline">Export</Button>
  <Button variant="default">Add Product</Button>
</PageHeader>
```

**Rules:**
- **Standardized Headers**: Never create custom page headers
- **Action Buttons**: Use children prop for header actions
- **Count Display**: Always show item counts when applicable
- **Gradient Text**: Automatic Adega gradient application

### Grid and Flexbox Standards

#### CSS Grid Usage
- **Primary Layout**: Use CSS Grid for main page structure
- **12-Column System**: Follow standard 12-column grid
- **Responsive Breakpoints**: Mobile-first approach

#### Flexbox Usage
- **Component Layout**: Use Flexbox for component internal layout
- **Alignment**: Consistent alignment patterns
- **Gap Management**: Use gap properties instead of margins

### Responsive Design Rules

#### Breakpoint Strategy
```scss
// Standard breakpoints (inherited from Tailwind)
sm: 640px   // Small devices
md: 768px   // Medium devices
lg: 1024px  // Large devices
xl: 1280px  // Extra large devices
2xl: 1536px // 2X large devices
```

#### Mobile-First Approach
- **Start Mobile**: Design for mobile devices first
- **Progressive Enhancement**: Add features for larger screens
- **Touch Targets**: Minimum 44px touch targets
- **Content Priority**: Most important content visible on small screens

---

## 🔄 Development Workflow

### Component Development Process

#### Phase 1: Analysis
1. **Check Shared Components**: Review `src/shared/ui/` for existing solutions
2. **Identify Patterns**: Look for similar components in codebase
3. **Assess Reusability**: Determine if component will be used in multiple places
4. **Plan Dependencies**: Identify required primitives and composites

#### Phase 2: Design
1. **Define Interface**: Create TypeScript interface with all props
2. **Choose Variants**: Define all visual and behavioral variants
3. **Plan Composition**: Decide on internal component structure
4. **Accessibility Review**: Plan keyboard navigation and screen reader support

#### Phase 3: Implementation
1. **Create Component**: Following naming conventions and architecture
2. **Add Type Safety**: Complete TypeScript definitions
3. **Implement Accessibility**: Full WCAG 2.1 AA compliance
4. **Test Thoroughly**: Manual testing of all variants and states

#### Phase 4: Integration
1. **Update Documentation**: Add to component registry
2. **Create Examples**: Provide usage examples
3. **Test in Context**: Verify component works in real applications
4. **Performance Check**: Verify no performance regressions

### Code Review Standards

#### Required Checks
- [ ] **Design Token Usage**: No hardcoded values
- [ ] **TypeScript Compliance**: Full type safety
- [ ] **Accessibility**: WCAG 2.1 AA compliance verified
- [ ] **Performance**: No unnecessary re-renders
- [ ] **Naming Conventions**: Consistent with style guide
- [ ] **Documentation**: Proper prop documentation

#### Testing Requirements
- [ ] **Unit Tests**: Component behavior testing
- [ ] **Accessibility Tests**: Automated accessibility checks
- [ ] **Visual Regression**: Screenshot comparison testing
- [ ] **Integration Tests**: Component interaction testing

---

## 🎯 Quality Assurance

### Component Quality Metrics

#### Code Quality
- **Cyclomatic Complexity**: Maximum 10 per component
- **Props Interface**: Maximum 15 props per component
- **File Size**: Maximum 300 lines per component file
- **Dependencies**: Minimize external dependencies

#### Performance Metrics
- **Bundle Size**: Track component bundle impact
- **Render Performance**: No unnecessary re-renders
- **Memory Usage**: Efficient memory management
- **First Paint**: Components should not block initial render

#### Accessibility Metrics
- **Automated Tests**: 100% pass rate on axe-core tests
- **Keyboard Navigation**: All functions accessible via keyboard
- **Screen Reader**: Proper announcements and navigation
- **Color Contrast**: All combinations meet WCAG standards

### Continuous Monitoring

#### Automated Checks
```json
{
  "scripts": {
    "lint": "eslint src/ --max-warnings 0",
    "test:a11y": "jest --testPathPattern=accessibility",
    "test:visual": "chromatic --build-script-name build",
    "check:tokens": "node scripts/validate-design-tokens.js"
  }
}
```

#### Quality Gates
- **Zero ESLint Warnings**: Must pass before commit
- **100% Accessibility**: No accessibility violations allowed
- **Performance Budget**: Bundle size within limits
- **Type Safety**: Zero TypeScript errors

---

## 💥 Breaking Changes Protocol

### Definition of Breaking Changes
- **Component API Changes**: Removing or renaming props
- **Design Token Changes**: Removing or significantly altering tokens
- **Layout Changes**: Modifying component structure or spacing
- **Accessibility Changes**: Altering keyboard navigation or screen reader behavior

### Breaking Change Process

#### Phase 1: Deprecation (1 version)
1. **Mark as Deprecated**: Add deprecation warnings
2. **Provide Migration Path**: Clear upgrade instructions
3. **Update Documentation**: Note deprecation in docs
4. **Announce Change**: Communicate to team

#### Phase 2: Warning Period (1 version)
1. **Console Warnings**: Runtime warnings for deprecated usage
2. **Migration Support**: Provide automated migration tools when possible
3. **Documentation Updates**: Complete migration guides
4. **Team Communication**: Ensure all developers aware

#### Phase 3: Removal (1 version)
1. **Remove Deprecated Code**: Clean removal of old APIs
2. **Update Tests**: Ensure all tests pass with new APIs
3. **Final Documentation**: Update all documentation
4. **Version Bump**: Major version increment

### Emergency Breaking Changes
In critical situations (security, major bugs), breaking changes may be expedited:
1. **Immediate Communication**: Alert all team members
2. **Hotfix Process**: Fast-track critical fixes
3. **Post-Incident Review**: Analyze what led to emergency change

---

## 🛡️ Enforcement and Compliance

### Automated Enforcement

#### ESLint Rules
```javascript
// Custom ESLint rules for design system compliance
"rules": {
  "@adega/no-hardcoded-colors": "error",
  "@adega/use-design-tokens": "error",
  "@adega/component-naming": "error",
  "@adega/accessibility-required": "error"
}
```

#### TypeScript Strict Mode
- **Strict Type Checking**: All design system code must pass strict TypeScript
- **No Any Types**: Explicit typing required for all props and interfaces
- **Design Token Types**: Use typed design token interfaces

#### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged && npm run test:a11y",
      "pre-push": "npm run build && npm run test"
    }
  }
}
```

### Manual Review Process

#### Component Review Checklist
- [ ] Follows naming conventions
- [ ] Uses design tokens exclusively
- [ ] Meets accessibility standards
- [ ] Includes proper TypeScript definitions
- [ ] Has appropriate test coverage
- [ ] Documentation is complete

#### Architecture Review Points
- [ ] Component fits architectural patterns
- [ ] No unnecessary complexity
- [ ] Proper separation of concerns
- [ ] Reusability considerations addressed
- [ ] Performance implications considered

### Compliance Reporting

#### Monthly Design System Health Report
- **Token Usage Compliance**: Percentage of hardcoded values eliminated
- **Component Coverage**: Number of certified components
- **Accessibility Score**: Automated accessibility test results
- **Performance Metrics**: Bundle size and render performance
- **Developer Satisfaction**: Survey results on design system usage

#### Quarterly Architecture Review
- **Pattern Analysis**: Review emerging patterns for standardization
- **Debt Assessment**: Identify technical debt in design system
- **Evolution Planning**: Plan next phase improvements
- **Tool Evaluation**: Assess design system tooling effectiveness

---

## 📚 References and Resources

### Official Documentation
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn/ui Component Library](https://ui.shadcn.com/)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)

### Internal Resources
- `tailwind.config.ts` - Design token definitions
- `src/core/config/theme-utils.ts` - Utility functions
- `src/core/types/design-tokens.ts` - TypeScript definitions
- `docs/design-system/` - Design system documentation

### External Tools
- **Chromatic**: Visual testing and component library
- **Axe DevTools**: Accessibility testing
- **React DevTools**: Performance profiling
- **TypeScript**: Type checking and IntelliSense

---

## 🔄 Document History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 2.0.0 | 2025-09-19 | Initial comprehensive governance document | Claude Code |

---

**Status**: ✅ ACTIVE
**Next Review**: 2025-12-19
**Approval Authority**: Design System Team
**Enforcement**: Mandatory for all new components and changes

---

*This document serves as the official constitution for the Adega Manager Design System. All team members are expected to follow these guidelines. Questions or suggestions should be directed to the Design System Team.*