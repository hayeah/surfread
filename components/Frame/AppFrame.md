# App Frame Component Documentation

A flexible and reusable app frame component for building complex applications with Next.js, TailwindCSS, and dnd-kit.

## Core Components

### 1. AppFrame (`AppFrame.tsx`)
- Main container component that orchestrates the entire layout
- Manages left/right drawer states (open/closed)
- Provides a flexible main content area that adjusts based on drawer states
- Props:
  - `leftDrawerContent`: React.ReactNode
  - `rightDrawerContent`: React.ReactNode
  - `tabs`: Array of tab objects

### 2. Drawers (`LeftDrawer.tsx`, `RightDrawer.tsx`)
- Sliding panels on both sides of the app
- Toggleable with smooth transitions
- Fixed width (256px/16rem) with shadow and z-index layering
- Toggle buttons positioned outside the drawer for better UX

### 3. Tab System ([TabContainer.tsx](cci:7://file:///Users/me/src/hayeah/surfread/components/Frame/TabContainer.tsx:0:0-0:0), `SortableTab.tsx`)
- Uses `@dnd-kit` for drag-and-drop functionality
- Features:
  - Draggable/reorderable tabs
  - Click-to-switch tab content
  - Visual feedback for active tab
  - Smooth drag animations

## Implementation Details

### 1. Drag and Drop
- Uses `DndContext` from `@dnd-kit/core`
- `SortableContext` with horizontal list strategy
- 10px movement threshold before drag starts
- Separates click and drag events to prevent conflicts

### 2. State Management
- Drawer states in `AppFrame`
- Tab order and active tab state in [TabContainer](cci:1://file:///Users/me/src/hayeah/surfread/components/Frame/TabContainer.tsx:30:0-117:2)
- Drag state tracking to prevent unwanted tab switches

### 3. Styling
- TailwindCSS for responsive design
- Smooth transitions for drawers (300ms duration)
- Proper z-indexing for overlays
- Consistent color scheme (gray-800/900 for dark surfaces)

## Usage Example

```tsx
<AppFrame
  leftDrawerContent={<YourLeftContent />}
  rightDrawerContent={<YourRightContent />}
  tabs={[
    {
      id: "unique-id",
      label: "Tab Label",
      content: <YourTabContent />
    },
    // ... more tabs
  ]}
/>
