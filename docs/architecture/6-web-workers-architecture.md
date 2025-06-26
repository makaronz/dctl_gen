# 6. Web Workers Architecture

## 6.1 Worker Structure

```typescript
// Main worker coordinator
class WorkerManager {
  private workers: Map<WorkerType, Worker>;
  private messageQueue: MessageQueue;
  
  constructor() {
    this.initializeWorkers();
  }
  
  private initializeWorkers(): void {
    this.workers.set('dctl-builder', new Worker('/workers/dctl-builder.worker.js'));
    this.workers.set('lut-processor', new Worker('/workers/lut-processor.worker.js'));
    this.workers.set('validation', new Worker('/workers/validation.worker.js'));
    
    // Set up message handlers
    this.workers.forEach((worker, type) => {
      worker.onmessage = (event) => this.handleWorkerMessage(type, event);
      worker.onerror = (error) => this.handleWorkerError(type, error);
    });
  }
  
  async executeInWorker<T, R>(
    workerType: WorkerType,
    operation: string,
    data: T
  ): Promise<R> {
    const worker = this.workers.get(workerType);
    if (!worker) {
      throw new Error(`Worker not found: ${workerType}`);
    }
    
    const messageId = generateUUID();
    const message: WorkerMessage<T> = {
      id: messageId,
      operation,
      data,
      timestamp: Date.now()
    };
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Worker timeout: ${workerType}:${operation}`));
      }, 30000); // 30 second timeout
      
      const handler = (event: MessageEvent) => {
        const response: WorkerResponse<R> = event.data;
        if (response.id === messageId) {
          clearTimeout(timeout);
          worker.removeEventListener('message', handler);
          
          if (response.success) {
            resolve(response.data);
          } else {
            reject(new Error(response.error));
          }
        }
      };
      
      worker.addEventListener('message', handler);
      worker.postMessage(message);
    });
  }
}

// DCTL Builder Worker
// workers/dctl-builder.worker.ts
import { DctlBuilderEngine } from '../lib/dctl/builder';
import { expose } from 'comlink';

class DctlBuilderWorker {
  private engine: DctlBuilderEngine;
  
  constructor() {
    this.engine = new DctlBuilderEngine({
      version: 1,
      targetResolveVersion: 18000,
      optimizationLevel: 'basic',
      syntaxValidation: 'strict',
      memoryAlignment: true
    });
  }
  
  async buildDctl(project: DctlProject): Promise<BuildResult> {
    try {
      return await this.engine.buildFromProject(project);
    } catch (error) {
      throw new Error(`DCTL build failed: ${error.message}`);
    }
  }
  
  async validateProject(project: DctlProject): Promise<ValidationResult> {
    return this.engine.validateProject(project);
  }
  
  async optimizeCode(
    code: string, 
    level: OptimizationLevel
  ): Promise<string> {
    return this.engine.optimizeCode(code, level);
  }
}

expose(DctlBuilderWorker);
```

## 6.2 LUT Processing Worker

```typescript
// workers/lut-processor.worker.ts
import { LutProcessorImpl } from '../lib/lut/processor';
import { expose } from 'comlink';

class LutProcessorWorker {
  private processor: LutProcessorImpl;
  
  constructor() {
    this.processor = new LutProcessorImpl();
  }
  
  async parseLut(
    data: ArrayBuffer, 
    format: LutFormat
  ): Promise<LutData> {
    return this.processor.parse(data, format);
  }
  
  async optimizeLut(
    lut: LutData, 
    options: OptimizationOptions
  ): Promise<OptimizedLut> {
    return this.processor.optimize(lut, options);
  }
  
  async generateThumbnail(lut: LutData): Promise<ImageData> {
    return this.processor.generateThumbnail(lut);
  }
  
  async analyzeLut(lut: LutData): Promise<LutAnalysis> {
    return this.processor.analyze(lut);
  }
  
  async convertFormat(
    lut: LutData, 
    targetFormat: LutFormat
  ): Promise<ArrayBuffer> {
    return this.processor.convertFormat(lut, targetFormat);
  }
}

expose(LutProcessorWorker);
```

---
