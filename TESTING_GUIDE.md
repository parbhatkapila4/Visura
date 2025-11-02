# Testing Guide for Visura

## 🧪 Testing Strategy

Visura uses **Vitest** for unit and integration testing. This ensures code quality and catches bugs before production.

---

## 📦 Installation

Testing dependencies are ready to install:

```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitest/ui
```

---

## 🚀 Running Tests

```bash
# Run tests in watch mode (development)
npm test

# Run tests once (CI)
npm run test:run

# Generate coverage report
npm run test:coverage

# Open test UI (visual test runner)
npm run test:ui
```

---

## 📁 Test Structure

```
tests/
├── setup.ts                 # Global test configuration
├── lib/                     # Library/utility tests
│   ├── validators.test.ts
│   ├── rate-limit.test.ts
│   └── monitoring.test.ts
├── components/              # Component tests
│   ├── summary-card.test.tsx
│   └── chatbot-client.test.tsx
├── api/                     # API route tests
│   └── chatbot-messages.test.ts
└── e2e/                     # End-to-end tests (future)
    └── upload-flow.test.ts
```

---

## ✅ Test Coverage Goals

- **Utilities**: >90% coverage
- **API Routes**: >80% coverage
- **Components**: >70% coverage
- **Overall**: >75% coverage

---

## 📝 Writing Tests

### Unit Test Example

```typescript
// tests/lib/validators.test.ts
import { describe, it, expect } from 'vitest';
import { SendMessageSchema } from '@/lib/validators';

describe('SendMessageSchema', () => {
  it('should validate correct message', () => {
    const result = SendMessageSchema.safeParse({
      sessionId: '123e4567-e89b-12d3-a456-426614174000',
      message: 'Hello world'
    });
    
    expect(result.success).toBe(true);
  });
  
  it('should reject invalid UUID', () => {
    const result = SendMessageSchema.safeParse({
      sessionId: 'invalid-id',
      message: 'Hello'
    });
    
    expect(result.success).toBe(false);
  });
});
```

### Component Test Example

```typescript
// tests/components/button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('should render button text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDefined();
  });
  
  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
  
  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByText('Disabled').closest('button');
    expect(button?.disabled).toBe(true);
  });
});
```

### API Test Example

```typescript
// tests/api/chatbot-messages.test.ts
import { describe, it, expect, vi } from 'vitest';
import { POST } from '@/app/api/chatbot/messages/route';
import { NextRequest } from 'next/server';

// Mock auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: () => ({ userId: 'user_123' })
}));

describe('POST /api/chatbot/messages', () => {
  it('should return 401 if not authenticated', async () => {
    // Test unauthorized access
  });
  
  it('should validate request body with Zod', async () => {
    // Test validation
  });
  
  it('should create message and return response', async () => {
    // Test happy path
  });
});
```

---

## 🎯 What to Test

### High Priority
1. ✅ **Validators** - All Zod schemas
2. ✅ **Rate Limiting** - Limits work correctly
3. ✅ **PDF Processing** - Text extraction
4. ✅ **Summary Generation** - Parsing logic
5. ✅ **API Routes** - Request/response handling

### Medium Priority
6. **Components** - UI components render correctly
7. **Utilities** - Helper functions work as expected
8. **Error Handling** - Errors are caught and handled
9. **Authentication** - Protected routes require auth

### Lower Priority
10. **E2E Flows** - Full user journeys
11. **Performance** - Load testing
12. **Accessibility** - a11y compliance

---

## 🔧 Testing Best Practices

### DO:
✅ Test behavior, not implementation
✅ Use descriptive test names
✅ Keep tests isolated and independent
✅ Mock external dependencies (APIs, database)
✅ Test edge cases and error conditions
✅ Maintain >75% code coverage

### DON'T:
❌ Test implementation details
❌ Make tests depend on each other
❌ Test external libraries (trust they work)
❌ Skip error case testing
❌ Commit failing tests

---

## 🐛 Debugging Tests

```bash
# Run specific test file
npx vitest tests/lib/validators.test.ts

# Run tests matching pattern
npx vitest --grep="SendMessageSchema"

# Debug in VS Code
# Add to .vscode/launch.json:
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "test"],
  "console": "integratedTerminal"
}
```

---

## 🚀 CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run test:run
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          file: ./coverage/coverage-final.json
```

---

## 📊 Coverage Reports

After running `npm run test:coverage`:

```
tests/
coverage/
├── index.html          # Open this in browser
├── lcov.info          # For CI tools
└── coverage-final.json
```

View coverage:
```bash
open coverage/index.html
```

---

## ✨ Advanced Testing

### Snapshot Testing

```typescript
it('should match snapshot', () => {
  const { container } = render(<SummaryCard summary={mockSummary} />);
  expect(container).toMatchSnapshot();
});
```

### Async Testing

```typescript
it('should load data asynchronously', async () => {
  render(<DataComponent />);
  
  // Wait for data to load
  const element = await screen.findByText('Loaded Data');
  expect(element).toBeDefined();
});
```

### Mocking API Calls

```typescript
import { vi } from 'vitest';

vi.mock('@/lib/openai', () => ({
  generateSummaryFromText: vi.fn().mockResolvedValue('Mocked summary')
}));
```

---

## 🎓 Resources

- [Vitest Docs](https://vitest.dev/)
- [Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Remember**: Tests are documentation of how your code should work. Write tests that explain the "why", not just the "what".

