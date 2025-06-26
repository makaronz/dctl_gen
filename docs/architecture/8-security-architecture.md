# 8. Security Architecture

## 8.1 Client-side Security

```typescript
// Content Security Policy
const CSP_POLICY = {
  "default-src": ["'self'"],
  "script-src": ["'self'", "'wasm-unsafe-eval'"], // For WASM modules
  "style-src": ["'self'", "'unsafe-inline'"], // Tailwind requires inline styles
  "img-src": ["'self'", "data:", "blob:"],
  "font-src": ["'self'"],
  "connect-src": ["'self'"],
  "worker-src": ["'self'"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"]
};

// Input sanitization
class SecurityUtils {
  static sanitizeInput(input: string): string {
    // Remove potentially dangerous characters
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  }
  
  static validateFileName(fileName: string): boolean {
    // Validate file names to prevent path traversal
    const regex = /^[a-zA-Z0-9._-]+$/;
    return regex.test(fileName) && !fileName.includes('..');
  }
  
  static validateFileSize(size: number, maxSize: number = 50 * 1024 * 1024): boolean {
    // 50MB max file size
    return size <= maxSize;
  }
  
  static validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
  }
}

// Sandboxed macro execution
class MacroSandbox {
  private worker: Worker;
  private timeout: number = 5000; // 5 second timeout
  
  constructor() {
    this.worker = new Worker('/workers/macro-sandbox.worker.js');
  }
  
  async executeMacro(macroCode: string, input: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.worker.terminate();
        reject(new Error('Macro execution timeout'));
      }, this.timeout);
      
      this.worker.onmessage = (event) => {
        clearTimeout(timeoutId);
        if (event.data.success) {
          resolve(event.data.result);
        } else {
          reject(new Error(event.data.error));
        }
      };
      
      this.worker.onerror = (error) => {
        clearTimeout(timeoutId);
        reject(error);
      };
      
      // Send sandboxed execution request
      this.worker.postMessage({
        code: macroCode,
        input: input,
        restrictions: {
          maxMemory: 100 * 1024 * 1024, // 100MB
          maxExecutionTime: 3000, // 3 seconds
          allowedGlobals: ['Math', 'Number', 'String', 'Array']
        }
      });
    });
  }
}
```

---
