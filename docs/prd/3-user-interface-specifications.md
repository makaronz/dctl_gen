# 3. User Interface Specifications

## 3.1 Layout Architecture

### 3.1.1 Responsive Grid System
```scss
.app-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--spacing-4);
  
  @media (min-width: 1440px) {
    .config-panel { grid-column: span 5; }
    .preview-panel { grid-column: span 7; }
  }
  
  @media (max-width: 1439px) {
    .config-panel, .preview-panel { grid-column: span 12; }
  }
}
```

### 3.1.2 Component Hierarchy
```
App
├── Header
│   ├── ProjectTitle (editable)
│   ├── VersionSelector
│   └── ActionBar (Save/Load/Export)
├── MainLayout
│   ├── ConfigPanel
│   │   ├── ParameterSection
│   │   │   ├── ParameterList
│   │   │   └── AddParameterButton
│   │   ├── LutSection
│   │   │   ├── LutDropzone
│   │   │   └── LutConfig
│   │   ├── MacroSection
│   │   │   ├── MacroEditor (Monaco)
│   │   │   └── MacroLibrary
│   │   └── AdvancedSection
│   └── PreviewPanel
│       ├── CodePreview (Prism.js)
│       ├── ErrorOverlay
│       └── MiniMap
└── StatusBar
    ├── ValidationStatus
    ├── PerformanceMetrics
    └── ExportOptions
```

## 3.2 Interaction Patterns

### 3.2.1 Parameter Management
- **Drag-and-drop reordering** with auto-save
- **Inline editing** with debounced validation
- **Bulk operations** (duplicate, delete, export selection)
- **Keyboard shortcuts** (Cmd+D duplicate, Del remove)
- **Undo/Redo stack** (up to 50 operations)

### 3.2.2 Real-time Feedback
- **Live code generation** (<16ms update cycle)
- **Incremental validation** (validate only changed portions)
- **Error highlighting** with line numbers and fix suggestions
- **Performance indicators** (estimated GPU cycles)

## 3.3 Accessibility Implementation

### 3.3.1 ARIA Patterns
```html
<div role="application" aria-label="DCTL Generator">
  <main role="main" aria-label="Configuration and Preview">
    <section role="region" aria-label="Parameters" aria-live="polite">
      <div role="list" aria-label="Parameter List">
        <div role="listitem" tabindex="0" aria-selected="true">
          <!-- Parameter controls with proper labeling -->
        </div>
      </div>
    </section>
  </main>
</div>
```

### 3.3.2 Keyboard Navigation
- **Tab order**: Logical flow through all interactive elements
- **Arrow keys**: Navigate within parameter lists
- **Enter/Space**: Activate buttons and toggles
- **Escape**: Close modals and cancel operations
- **Cmd/Ctrl+S**: Save configuration
- **Cmd/Ctrl+E**: Export DCTL

---
