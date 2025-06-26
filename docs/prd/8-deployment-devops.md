# 8. Deployment & DevOps

## 8.1 CI/CD Pipeline
```yaml
name: Production Pipeline
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - name: Type Check
        run: pnpm tsc --noEmit
      - name: Lint
        run: pnpm eslint . --max-warnings=0
      - name: Unit Tests
        run: pnpm vitest run --coverage
      - name: Build
        run: pnpm build
      
  e2e:
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - name: E2E Tests
        run: pnpm playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          
  deploy:
    needs: [quality, e2e]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: dctl-generator
          directory: dist
```

## 8.2 Monitoring
- **Error Tracking**: Sentry integration (opt-in)
- **Performance Monitoring**: Web Vitals tracking
- **Usage Analytics**: Privacy-preserving metrics

---
