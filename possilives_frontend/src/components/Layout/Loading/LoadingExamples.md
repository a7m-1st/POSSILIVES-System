# Modern Loading Component Usage Examples

The new Loading component supports multiple use cases with a modern, animated design that matches the application's design system.

## Full Screen Loading (Default)
```tsx
<Loading loading={true} />
// or
<Loading loading={true} message="Generating your future..." />
```

## Inline Loading for Components
```tsx
<Loading 
  loading={true} 
  fullScreen={false} 
  message="Loading habits..." 
/>
```

## Features

### ✨ Modern Design Elements
- **Gradient background** matching the app's theme
- **Dual spinning animations** with different speeds and colors
- **Framer Motion animations** for smooth entry/exit
- **Tailwind CSS** for consistent styling

### 🎭 Animation Features
- **Staggered dot animations** for visual appeal
- **Scale and fade entrance** effects
- **Responsive design** that works on all screen sizes
- **TypeScript support** with proper interfaces

### 🔧 Customizable Options
- `loading`: Boolean to control visibility
- `fullScreen`: Toggle between full-screen and inline modes
- `message`: Custom loading message
- Automatic centering and positioning

### 🎨 Design Consistency
- Uses `PageContainer` for consistent layout
- Matches the gradient backgrounds used throughout the app
- Compatible with the existing `LoadingContext`
- Maintains the blue/purple color scheme

## Technical Implementation
- **Zero external dependencies** (removed react-spinners)
- **Performance optimized** with conditional rendering
- **Accessibility friendly** with proper contrast and animations
- **Mobile responsive** design

The component automatically handles both full-screen loading (like when the global LoadingContext is used) and inline loading for individual components, making it versatile for any loading scenario in the application.
