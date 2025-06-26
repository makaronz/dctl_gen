# 5. Data Architecture

## 5.1 Storage Strategy

```typescript
// Storage abstraction layer
interface StorageAdapter {
  // Project management
  saveProject(project: DctlProject): Promise<void>;
  loadProject(id: string): Promise<DctlProject>;
  deleteProject(id: string): Promise<void>;
  listProjects(): Promise<ProjectMetadata[]>;
  
  // LUT management
  saveLut(lut: LutDefinition, data: ArrayBuffer): Promise<void>;
  loadLut(id: string): Promise<LutData>;
  deleteLut(id: string): Promise<void>;
  
  // Preferences
  savePreferences(prefs: UserPreferences): Promise<void>;
  loadPreferences(): Promise<UserPreferences>;
  
  // Export/Import
  exportProject(id: string, format: ExportFormat): Promise<Blob>;
  importProject(data: ArrayBuffer): Promise<DctlProject>;
}

// IndexedDB implementation
class IndexedDBAdapter implements StorageAdapter {
  private db: IDBDatabase;
  private readonly DB_NAME = 'dctl-generator';
  private readonly DB_VERSION = 1;
  
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createObjectStores(db);
      };
    });
  }
  
  private createObjectStores(db: IDBDatabase): void {
    // Projects store
    if (!db.objectStoreNames.contains('projects')) {
      const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
      projectStore.createIndex('created', 'metadata.created');
      projectStore.createIndex('modified', 'metadata.modified');
      projectStore.createIndex('tags', 'metadata.tags', { multiEntry: true });
    }
    
    // LUTs store
    if (!db.objectStoreNames.contains('luts')) {
      const lutStore = db.createObjectStore('luts', { keyPath: 'id' });
      lutStore.createIndex('format', 'format');
      lutStore.createIndex('size', 'size');
    }
    
    // Preferences store
    if (!db.objectStoreNames.contains('preferences')) {
      db.createObjectStore('preferences', { keyPath: 'key' });
    }
  }
  
  async saveProject(project: DctlProject): Promise<void> {
    const transaction = this.db.transaction(['projects'], 'readwrite');
    const store = transaction.objectStore('projects');
    
    // Update modification time
    project.metadata.modified = new Date().toISOString();
    
    await this.promisifyRequest(store.put(project));
  }
  
  async loadProject(id: string): Promise<DctlProject> {
    const transaction = this.db.transaction(['projects'], 'readonly');
    const store = transaction.objectStore('projects');
    const result = await this.promisifyRequest(store.get(id));
    
    if (!result) {
      throw new Error(`Project not found: ${id}`);
    }
    
    return result;
  }
  
  private promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}
```

## 5.2 Data Models

```typescript
// Core project schema
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
    category: ProjectCategory;
    thumbnail?: string; // base64 encoded image
  };
  
  config: {
    dctlVersion: 1 | 2;
    targetResolve: ResolveVersion;
    optimization: OptimizationConfig;
    compatibility: CompatibilityConfig;
  };
  
  structure: {
    parameters: ParameterDefinition[];
    luts: LutDefinition[];
    macros: MacroDefinition[];
    functions: FunctionDefinition[];
  };
  
  customCode: {
    includes: string[];
    declarations: string;
    transformBody: string;
    helpers: string[];
  };
  
  validation: {
    rules: ValidationRuleConfig[];
    overrides: ValidationOverride[];
    suppressedWarnings: string[];
  };
  
  ui: {
    parameterLayout: ParameterLayoutConfig;
    grouping: ParameterGroupConfig[];
    customizations: UICustomization[];
  };
}

// Parameter organization
interface ParameterGroupConfig {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  collapsed: boolean;
  parameterIds: string[];
  conditions?: GroupVisibilityCondition[];
}

interface ParameterLayoutConfig {
  type: 'tabs' | 'accordion' | 'sections';
  groups: ParameterGroupConfig[];
  customOrder: string[]; // parameter IDs in display order
}

// LUT definition with metadata
interface LutDefinition {
  id: UUID;
  name: string;
  description?: string;
  format: LutFormat;
  size: number;
  dimensions: 1 | 3;
  
  metadata: {
    title?: string;
    creator?: string;
    copyright?: string;
    colorSpace?: ColorSpace;
    inputRange?: [number, number];
    outputRange?: [number, number];
  };
  
  processing: {
    optimized: boolean;
    compressed: boolean;
    quantized: boolean;
    interpolation: 'linear' | 'cubic';
  };
  
  storage: {
    dataId: string; // Reference to stored binary data
    size: number; // Size in bytes
    checksum: string; // Data integrity check
  };
}
```

---
