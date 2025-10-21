# Design System Reference

This document describes the visual design language, color palette, typography, spacing, and component styling patterns. Use this as a reference to create consistent, modern interfaces with a similar aesthetic for any application.

---

## 1. Color Palette

### Primary Colors
- **Primary Blue**: `#2563eb` (light mode) / `#3b82f6` (dark mode)
  - Use for: Primary actions, key interactive elements, brand accent
- **Primary Dark**: `#1d4ed8` (light mode) / `#2563eb` (dark mode)
  - Use for: Gradient endpoints, hover states, depth

### Secondary Colors
- **Secondary Green**: `#10b981` (both modes)
  - Use for: Success states, positive actions, secondary accents
- **Secondary Dark**: `#059669` (both modes)
  - Use for: Gradient transitions, active states

### Accent Colors
- **Accent Amber**: `#f59e0b` (light mode) / `#fbbf24` (dark mode)
  - Use for: Highlights, warnings, attention-grabbing elements
- **Danger Red**: `#ef4444` (both modes)
  - Use for: Errors, destructive actions, alerts

### Neutral Palette

#### Light Mode
- **Background**: `#f8fafc` - Main app background
- **Surface**: `#ffffff` - Cards, panels, elevated surfaces
- **Surface Hover**: `#f1f5f9` - Hover states for interactive surfaces
- **Foreground**: `#0f172a` - Primary text color
- **Foreground Muted**: `#64748b` - Secondary text, less emphasis
- **Border**: `#e2e8f0` - Standard borders
- **Border Light**: `#f1f5f9` - Subtle dividers

#### Dark Mode
- **Background**: `#0f172a` - Main app background
- **Surface**: `#1e293b` - Cards, panels, elevated surfaces
- **Surface Hover**: `#334155` - Hover states for interactive surfaces
- **Foreground**: `#f8fafc` - Primary text color
- **Foreground Muted**: `#94a3b8` - Secondary text, less emphasis
- **Border**: `#334155` - Standard borders
- **Border Light**: `#1e293b` - Subtle dividers

### Special Effect Colors
- **Semi-transparent White Overlays**:
  - `white/5` - Subtle floating elements
  - `white/10` - Glassmorphism surfaces, cards
  - `white/20` - Borders, emphasized glass surfaces
  - `white/60` - Inactive icons/text
  - `white/80` - Secondary text on colored backgrounds

### Color Usage Principles
- Use **gradient backgrounds** for immersive full-page experiences
- Apply **glassmorphism** (semi-transparent white with blur) for floating UI elements
- Maintain **high contrast** between text and backgrounds for accessibility
- Use **opacity variations** on white for layering on gradient backgrounds

---

## 2. Typography

### Font Families
- **Sans-serif**: Geist Sans (primary), fallback to system fonts
  - System fallback stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Monospace**: Geist Mono (for code, data, technical content)

### Type Scale
- **Headings**:
  - `text-2xl` (24px) - Page titles, primary headings
  - `text-xl` (20px) - Section headings, card titles
  - `text-lg` (18px) - Subsection headings
- **Body**:
  - `text-base` (16px) - Default body text
  - `text-sm` (14px) - Secondary information, captions
  - `text-xs` (12px) - Labels, metadata, tertiary info
- **Display**:
  - `text-3xl` (30px) - Large numbers, stats
  - `text-2xl` (24px) - Emphasized data points

### Font Weights
- **Bold** (`font-bold`, 700) - Headings, emphasis, stats
- **Semibold** (`font-semibold`, 600) - Subheadings, important labels
- **Medium** (`font-medium`, 500) - Active states, selected items
- **Normal** (400) - Body text, default weight

### Line Height
- Default: `1.6` for optimal readability
- Headings: Use tighter line-height for larger text

---

## 3. Spacing & Layout

### Spacing Scale (Tailwind)
- `p-1` / `m-1`: 4px - Minimal spacing
- `p-2` / `m-2`: 8px - Tight spacing
- `p-3` / `m-3`: 12px - Compact elements
- `p-4` / `m-4`: 16px - Standard spacing
- `p-5` / `m-5`: 20px - Comfortable spacing
- `p-6` / `m-6`: 24px - Generous spacing
- `p-8` / `m-8`: 32px - Large spacing

### Container & Page Layout
- **Max Width**: `max-w-4xl` (768px) - Centered content container
- **Page Padding**: `px-4` (16px) horizontal, `py-6` (24px) vertical
- **Bottom Spacing**: `pb-6` - Extra bottom padding for fixed navigation
- **Content Spacing**: `space-y-6` (24px) - Vertical rhythm between sections

### Component Spacing
- **Card Padding**: `p-6` (24px) for comfortable internal spacing
- **Button Padding**: `px-6 py-3` (24px horizontal, 12px vertical)
- **Icon Margins**: `mb-1` (4px), `mr-3` (12px), `ml-1` (4px) - contextual spacing
- **Grid Gaps**: `gap-4` (16px) for card grids, `gap-2` (8px) for list items

### Responsive Breakpoints
- Mobile-first approach
- `md:` - Medium screens and up (768px)
- `lg:` - Large screens and up (1024px)

---

## 4. Visual Effects

### Shadows
- **Small**: `0 1px 2px 0 rgb(0 0 0 / 0.05)` - Subtle elevation
- **Medium**: `0 4px 6px -1px rgb(0 0 0 / 0.1)` - Standard cards
- **Large**: `0 10px 15px -3px rgb(0 0 0 / 0.1)` - Floating panels, modals
- **Extra Large**: `shadow-xl` - Deep elevation, important overlays

### Glassmorphism Pattern
Signature frosted glass effect used throughout:
```css
background: white/10 (or white/20)
backdrop-filter: blur(medium)
border: 1px solid white/20 (or white/30)
```

**When to use**:
- Floating navigation bars
- Card overlays on gradient backgrounds
- Interactive panels
- Modal/dialog backgrounds

### Border Radius
- **Small**: `rounded-lg` (8px) - Buttons, small cards
- **Medium**: `rounded-xl` (12px) - Standard buttons, inputs
- **Large**: `rounded-2xl` (16px) - Cards, panels, major containers
- **Full**: `rounded-full` - Circular elements (avatars, badges, progress indicators)

### Backdrop Blur
- `backdrop-blur-md` - Standard blur for glassmorphism (12px blur)

---

## 5. Gradients

### Primary Page Gradient
```css
background: linear-gradient(135deg, var(--primary), var(--primary-dark), var(--secondary))
/* Translates to: from-[var(--primary)] via-[var(--primary-dark)] to-[var(--secondary)] */
/* Direction: bottom-right diagonal (br) */
```

**Usage**: Full-page backgrounds to create immersive, colorful experiences

### Secondary Gradients
- **Teal to Cyan**: `from-teal-500 to-cyan-600` - Special sections (e.g., rehab, health features)
- **Primary to Secondary**: `from-[var(--primary)] to-[var(--secondary)]` - Progress bars, highlights

### Gradient Best Practices
- Use `bg-gradient-to-br` (bottom-right) for dynamic, flowing feel
- Apply on page backgrounds, not individual cards (keeps cards clean with glassmorphism)
- Combine with animated background elements for depth

---

## 6. Animation & Motion

### Animation Library
- **Framer Motion** for all interactive animations
- Custom CSS keyframe animations for simple effects

### Animation Patterns

#### Hover Effects
```javascript
whileHover={{
  scale: 1.2,
  y: -5,
  transition: { type: "spring", stiffness: 400, damping: 10 }
}}
```
- Use for navigation items, interactive icons
- Spring physics for natural, bouncy feel

#### Tap Effects
```javascript
whileTap={{ scale: 0.9, y: 0 }}
```
- Immediate visual feedback on press
- Use on all clickable elements

#### Active State Animations
```javascript
animate={isActive ? {
  scale: [1, 1.1, 1],
  rotate: [0, 5, -5, 0]
} : {}}
```
- Celebratory micro-animations for active/selected states
- Keyframe sequences for personality

#### Layout Transitions
```javascript
layoutId="activeTab"
transition={{ type: "spring", stiffness: 500, damping: 25 }}
```
- Smooth morphing between states
- Use for tab indicators, selection highlights

#### Page Transitions
```javascript
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -20 }}
```
- Fade + slide for page/section transitions
- `AnimatePresence` for enter/exit animations

### Keyframe Animations

#### Slide Up
```css
@keyframes slideUp {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
/* Usage: .animate-slide-up (duration: 0.3s) */
```

#### Fade In
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
/* Usage: .animate-fade-in (duration: 0.2s) */
```

#### Rotating Loader
```javascript
animate={{ rotate: 360 }}
transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
```

### Transition Classes
- `transition-colors` - Smooth color changes (hover, active states)
- `transition-all` - General-purpose transitions
- `transition-transform` - Smooth scale/translate effects
- `duration-500 ease-out` - Progress bars, smooth fills

### Motion Principles
- **Purposeful**: Every animation serves a functional purpose (feedback, guidance, delight)
- **Snappy**: Fast durations (0.2-0.5s) for responsiveness
- **Spring Physics**: Use spring animations for natural, premium feel
- **Reduce Motion**: Respect user preferences (not shown in code, but should be implemented)

---

## 7. Component Patterns

### Card Component
```jsx
<div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20">
  {/* Card content */}
</div>
```

**Variants**:
- **Emphasized Card**: `bg-white/20 border-white/30` - More prominent
- **Gradient Card**: `bg-gradient-to-br from-teal-500 to-cyan-600` - Special sections
- **Hover State**: Add `hover:bg-white/20` for interactive cards

### Button Component

#### Primary Button (Light on Dark)
```jsx
<button className="bg-white text-[var(--primary)] px-6 py-3 rounded-xl font-semibold hover:bg-white/90 transition-colors">
  Button Text
</button>
```

#### Secondary Button (Transparent)
```jsx
<button className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-lg font-semibold transition-colors">
  Button Text
</button>
```

#### Icon Button
```jsx
<button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
  <Icon className="w-5 h-5" />
</button>
```

### Navigation Bar (Glassmorphism)

#### Bottom Navigation
```jsx
<nav className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-md border-t border-white/20 z-50">
  <div className="flex justify-around items-center h-16">
    {/* Nav items */}
  </div>
</nav>
```

#### Top Header
```jsx
<header className="bg-white/10 backdrop-blur-md border-b border-white/20 shadow-sm sticky top-0 z-40">
  <div className="max-w-4xl mx-auto px-4 py-4">
    {/* Header content */}
  </div>
</header>
```

### Active Tab Indicator
```jsx
{isActive && (
  <motion.div
    layoutId="activeTab"
    className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-white rounded-full"
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ type: "spring", stiffness: 500, damping: 25 }}
  />
)}
```

### Progress Bar (Radix UI)
```jsx
<Progress.Root
  className="relative overflow-hidden bg-white/20 rounded-full w-full h-3"
  value={progressPercentage}
>
  <Progress.Indicator
    className="bg-white w-full h-full transition-transform duration-500 ease-out rounded-full"
    style={{
      transform: `translateX(-${100 - progressPercentage}%)`,
    }}
  />
</Progress.Root>
```

**Variants**:
- **Gradient Fill**: `bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]`
- **Thin Bar**: `h-2` or `h-0.5` for subtle indicators

### Checkbox/Toggle Pattern
```jsx
<div className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center
  ${completed ? 'bg-white' : 'bg-transparent'}
`}>
  {completed && (
    <motion.svg
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="w-4 h-4 text-[color]"
      /* checkmark path */
    />
  )}
</div>
```

### Stat Display Card
```jsx
<div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 shadow-lg border border-white/20">
  <div className="flex items-center justify-between mb-2">
    <Icon className="w-8 h-8 text-[accent-color]" />
    <span className="text-2xl font-bold text-white">{value}</span>
  </div>
  <p className="text-sm text-white/70">Label</p>
</div>
```

### Animated Background Elements
```jsx
<div className="absolute inset-0 pointer-events-none">
  {circles.map((circle) => (
    <motion.div
      key={circle.id}
      className="absolute rounded-full bg-white/5"
      style={{ width, height, left, top }}
      animate={{ x: [0, randomX], y: [0, randomY] }}
      transition={{
        duration: randomDuration,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
    />
  ))}
</div>
```

---

## 8. Interaction States

### Link/Button States
- **Default**: `text-white/60` or base color
- **Hover**: `hover:text-white`, `hover:bg-white/10`
- **Active/Selected**: `text-white font-medium`, background emphasis
- **Disabled**: `opacity-50 cursor-not-allowed`

### Interactive Feedback
- **Scale on Hover**: `whileHover={{ scale: 1.01 }}` or `1.1` for icons
- **Scale on Tap**: `whileTap={{ scale: 0.9 }}`
- **Color Transition**: `transition-colors` for smooth state changes
- **Spring Animations**: Bouncy, natural feel for important interactions

### Touch Targets
- **Minimum Size**: `48px × 48px` for mobile accessibility
- **Applied to**: All buttons and links
- **Tap Highlight**: `-webkit-tap-highlight-color: transparent` to prevent flash

---

## 9. Icons

### Icon Library
- **Lucide React**: Primary icon set
- **Size Scale**:
  - `w-4 h-4` (16px) - Small inline icons
  - `w-5 h-5` (20px) - Standard UI icons
  - `w-6 h-6` (24px) - Section headers, emphasized icons
  - `w-8 h-8` (32px) - Large stat icons, focal points
  - `w-12 h-12` (48px) - Decorative, loading states
  - `w-16 h-16` (64px) - Empty states, large illustrations

### Icon Color Patterns
- **On Glass Backgrounds**: `text-white` (active), `text-white/60` (inactive)
- **Accent Icons**: `text-yellow-300`, `text-orange-400`, specific brand colors
- **Inline with Text**: Match text color and size

### Common Icons
- **Navigation**: Home, Calendar, TrendingUp, User
- **Actions**: ChevronRight, LogOut, Settings, Info
- **Status**: Trophy, Flame, Heart, Dumbbell
- **Content**: FileText, Plus, Trash, Edit

---

## 10. Accessibility

### Color Contrast
- Maintain **WCAG AA** minimum contrast ratios
- White text on gradient backgrounds: ensure sufficient darkness in gradient
- Use `text-white` on colored backgrounds, `text-[var(--foreground)]` on neutral surfaces

### Touch & Click Targets
- Minimum **48px × 48px** for all interactive elements
- Adequate spacing between adjacent touch targets

### Keyboard Navigation
- Visible focus states (not shown in examples but should be implemented)
- Logical tab order
- Support for keyboard-only navigation

### Motion
- Respect `prefers-reduced-motion` media query (not shown but critical)
- Provide alternative non-animated states

### Semantic HTML
- Use proper heading hierarchy (h1, h2, h3)
- ARIA labels for icon-only buttons: `aria-label="descriptive text"`
- Semantic landmarks (nav, header, main)

### Custom Scrollbar Accessibility
```css
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: var(--background); }
::-webkit-scrollbar-thumb { background: var(--foreground-muted); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: var(--foreground); }
```

---

## 11. Implementation Notes

### CSS Architecture
- **Tailwind CSS v4** with PostCSS
- CSS Custom Properties for theme values
- `@theme inline` directive to bridge CSS variables and Tailwind utilities
- Global styles in single `globals.css` file

### Component Architecture
- **React** with Next.js 15 (App Router)
- **Framer Motion** for animations
- **Radix UI** for accessible primitives (Progress, etc.)
- **Client Components** (`'use client'`) for interactive elements

### State Management
- Local component state for UI interactions
- React hooks (useState, useEffect, useMemo)
- Memoization (`memo`) for performance

### Build Stack
- PostCSS for CSS processing
- Tailwind CSS for utility-first styling
- Next.js for React framework and routing

---

## 12. Design Principles Summary

### Visual Identity
- **Vibrant gradients** create energy and immersion
- **Glassmorphism** adds depth and modern sophistication
- **Bold typography** ensures readability and hierarchy
- **Ample whitespace** prevents clutter and improves focus

### User Experience
- **Immediate feedback** through animations and transitions
- **Clear visual hierarchy** guides user attention
- **Consistent patterns** reduce cognitive load
- **Delightful micro-interactions** create emotional connection

### Technical Excellence
- **Performance-first**: Memoization, efficient animations
- **Accessible**: Semantic HTML, ARIA labels, touch targets
- **Responsive**: Mobile-first, adaptive layouts
- **Maintainable**: Centralized theme, reusable patterns

---

## Quick Reference: Common Utility Classes

### Layout
- `min-h-screen` - Full viewport height
- `max-w-4xl mx-auto` - Centered content container
- `px-4 py-6` - Standard page padding
- `space-y-6` - Vertical rhythm between sections
- `grid grid-cols-2 gap-4` - Two-column grid

### Glassmorphism Card
- `bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20`

### Primary Button
- `bg-white text-[var(--primary)] px-6 py-3 rounded-xl font-semibold hover:bg-white/90 transition-colors`

### Text Hierarchy
- Heading: `text-2xl font-bold text-white`
- Subheading: `text-xl font-semibold text-white`
- Body: `text-base text-white/90`
- Secondary: `text-sm text-white/70`
- Muted: `text-xs text-white/60`

### Spacing Pattern
- `mb-1` (4px), `mb-2` (8px), `mb-4` (16px), `mb-6` (24px)
- `gap-2` (8px), `gap-4` (16px)
- `p-3` (12px), `p-5` (20px), `p-6` (24px)

---

**End of Design System Reference**

Use this document to replicate the visual language and interaction patterns in any new application. Adapt color values, gradient combinations, and specific components to fit your new product while maintaining the core aesthetic principles.
