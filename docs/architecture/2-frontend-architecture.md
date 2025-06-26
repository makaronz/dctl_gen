# 2. Frontend Architecture

## 2.1 Technology Stack

```typescript
// Core Dependencies
interface TechStack {
  runtime: {
    react: "^18.2.0";
    typescript: "^5.3.0";
    vite: "^5.0.0";
  };
  stateManagement: {
    zustand: "^4.4.0";
    immer: "^10.0.0";
  };
  ui: {
    "@radix-ui/react-*": "latest";
    "tailwindcss": "^3.4.0";
    "framer-motion": "^11.0.0";
    "lucide-react": "latest";
  };
  codeGeneration: {
    zod: "^3.22.0";
    prettier: "^3.2.0";
    "@typescript-eslint/parser": "^6.0.0";
  };
  utilities: {
    "file-saver": "^2.0.5";
    "jszip": "^3.10.1";
    "comlink": "^4.4.1";
  };
}
```

## 2.2 Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   ├── forms/           # Form components
│   ├── editors/         # Code/parameter editors
│   ├── panels/          # Layout panels
│   └── dialogs/         # Modal dialogs
├── stores/              # Zustand stores
│   ├── project.ts       # Project state
│   ├── parameters.ts    # Parameter management
│   ├── luts.ts         # LUT management
│   └── ui.ts           # UI state
├── lib/                 # Core business logic
│   ├── dctl/           # DCTL generation engine
│   ├── validation/     # Validation rules
│   ├── storage/        # Data persistence
│   ├── export/         # Export functionality
│   └── utils/          # Utility functions
├── workers/            # Web Workers
│   ├── dctl-builder.worker.ts
│   ├── lut-processor.worker.ts
│   └── validation.worker.ts
├── types/              # TypeScript definitions
│   ├── dctl.ts         # DCTL-specific types
│   ├── project.ts      # Project data types
│   └── api.ts          # API interfaces
├── hooks/              # Custom React hooks
├── constants/          # Application constants
└── assets/             # Static assets
```

## 2.3 Component Architecture

### 2.3.1 Component Hierarchy
```typescript
interface ComponentArchitecture {
  layout: {
    App: "Root application component";
    Layout: "Main layout with panels";
    Header: "Navigation and project controls";
    StatusBar: "Validation and performance metrics";
  };
  
  panels: {
    ConfigPanel: "Left panel for configuration";
    PreviewPanel: "Right panel for code preview";
    ParameterSection: "Parameter management";
    LutSection: "LUT upload and configuration";
    MacroSection: "Custom macro editor";
  };
  
  editors: {
    ParameterEditor: "Individual parameter configuration";
    CodeEditor: "Monaco-based code editor";
    LutViewer: "LUT visualization and analysis";
    CurveEditor: "Bezier curve parameter editor";
  };
  
  forms: {
    SliderForm: "Float parameter configuration";
    CheckboxForm: "Boolean parameter configuration";
    EnumForm: "Dropdown parameter configuration";
    ProjectForm: "Project metadata editor";
  };
}
```

### 2.3.2 Component Patterns
```typescript
// Base component interface
interface BaseComponent<T = {}> {
  id?: string;
  className?: string;
  children?: React.ReactNode;
  testId?: string;
  ariaLabel?: string;
  props?: T;
}

// Parameter component pattern
interface ParameterComponent<T extends ParameterType> extends BaseComponent {
  parameter: ParameterDefinition<T>;
  onChange: (value: ParameterValue<T>) => void;
  onValidate: (result: ValidationResult) => void;
  disabled?: boolean;
  readOnly?: boolean;
}

// Editor component pattern
interface EditorComponent<T> extends BaseComponent {
  value: T;
  onChange: (value: T) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  validation?: ValidationResult;
  suggestions?: EditorSuggestion[];
}
```

---
