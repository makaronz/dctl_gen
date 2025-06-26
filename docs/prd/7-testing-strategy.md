# 7. Testing Strategy

## 7.1 Test Coverage Requirements
- **Unit Tests**: >90% coverage for business logic
- **Integration Tests**: All user workflows
- **E2E Tests**: Critical paths with Playwright
- **Performance Tests**: Load testing with large projects
- **Accessibility Tests**: Automated WCAG scanning

## 7.2 Test Implementation
```typescript
// Example E2E test
test('generates valid DCTL with complex parameters', async ({ page }) => {
  await page.goto('/');
  
  // Add multiple parameter types
  await addSliderParameter(page, {
    name: 'Exposure',
    min: -5, max: 5,
    default: 0, step: 0.1
  });
  
  await addEnumParameter(page, {
    name: 'ColorSpace',
    options: ['sRGB', 'ACEScg', 'Rec709']
  });
  
  await importLut(page, 'test-assets/film-emulation.cube');
  
  // Verify generated code
  const code = await page.locator('[data-testid="code-preview"]').textContent();
  expect(code).toMatchSnapshot('complex-dctl.snapshot');
  
  // Validate with external DCTL parser
  const validation = await validateDctl(code);
  expect(validation.errors).toHaveLength(0);
});
```

---
