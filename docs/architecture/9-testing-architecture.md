# 9. Testing Architecture

## 9.1 Testing Strategy

```typescript
// Component testing with React Testing Library
describe('ParameterEditor', () => {
  it('should render float parameter correctly', () => {
    const parameter: ParameterDefinition<'float'> = {
      id: 'test-param',
      type: 'float',
      name: 'exposure',
      displayName: 'Exposure',
      category: 'color',
      metadata: {
        range: [-5, 5],
        step: 0.1,
        precision: 1,
        defaultValue: 0,
        unit: 'stops'
      },
      // ... other required properties
    };
    
    render(<ParameterEditor parameter={parameter} onChange={jest.fn()} />);
    
    expect(screen.getByLabelText('Exposure')).toBeInTheDocument();
    expect(screen.getByDisplayValue('0')).toBeInTheDocument();
  });
  
  it('should validate input and show errors', async () => {
    const onChange = jest.fn();
    render(<ParameterEditor parameter={floatParameter} onChange={onChange} />);
    
    const input = screen.getByLabelText('Exposure');
    await user.type(input, '10'); // Out of range
    
    expect(screen.getByText(/value must be between -5 and 5/i)).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });
});

// E2E testing with Playwright
test('complete DCTL generation workflow', async ({ page }) => {
  await page.goto('/');
  
  // Create new project
  await page.click('[data-testid="new-project"]');
  await page.fill('[data-testid="project-title"]', 'Test DCTL');
  
  // Add float parameter
  await page.click('[data-testid="add-parameter"]');
  await page.click('[data-testid="parameter-type-float"]');
  await page.fill('[data-testid="parameter-name"]', 'Exposure');
  await page.fill('[data-testid="parameter-min"]', '-5');
  await page.fill('[data-testid="parameter-max"]', '5');
  await page.click('[data-testid="save-parameter"]');
  
  // Verify code generation
  const codePreview = page.locator('[data-testid="code-preview"]');
  await expect(codePreview).toContainText('DEFINE_FLOAT_UI(Exposure');
  
  // Export DCTL
  await page.click('[data-testid="export-dctl"]');
  const downloadPromise = page.waitForEvent('download');
  await page.click('[data-testid="download-dctl"]');
  const download = await downloadPromise;
  
  expect(download.suggestedFilename()).toBe('Test DCTL.dctl');
});
```

---
