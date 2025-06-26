# 4. Data Models

## 4.1 Project Schema
```typescript
interface DctlProject {
  id: UUID;
  version: SemVer;
  metadata: {
    title: string;
    description?: string;
    author?: string;
    created: ISO8601;
    modified: ISO8601;
    tags: string[];
  };
  config: {
    dctlVersion: 1 | 2;
    targetResolve: ResolveVersion;
    optimization: OptimizationConfig;
  };
  parameters: ParameterDefinition[];
  luts: LutDefinition[];
  macros: MacroDefinition[];
  customCode: {
    includes: string[];
    declarations: string;
    transformBody: string;
  };
  validation: {
    rules: ValidationRuleConfig[];
    overrides: ValidationOverride[];
  };
}
```

## 4.2 Storage Strategy

### 4.2.1 Client-side Persistence
```typescript
interface StorageAdapter {
  // Projects stored in IndexedDB
  saveProject(project: DctlProject): Promise<void>;
  loadProject(id: UUID): Promise<DctlProject>;
  listProjects(): Promise<ProjectMetadata[]>;
  
  // LUTs stored separately for performance
  saveLut(id: UUID, data: ArrayBuffer): Promise<void>;
  loadLut(id: UUID): Promise<ArrayBuffer>;
  
  // User preferences in localStorage
  savePreferences(prefs: UserPreferences): void;
  loadPreferences(): UserPreferences;
}
```

### 4.2.2 Export/Import Formats
- **Project Bundle** (.dctlproj) - ZIP with project.json + LUTs
- **Configuration Only** (.json) - Portable settings without LUTs
- **DCTL Package** (.dctlpkg) - Multiple DCTL files + dependencies

---
