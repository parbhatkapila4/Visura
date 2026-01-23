# Contributing to Visura

Thank you for your interest in contributing to Visura! This document provides guidelines and best practices.

---

## Getting Started

### Prerequisites
- Node.js 20+ 
- npm or yarn
- Git
- Supabase account
- Clerk account
- OpenRouter API key

### Setup

1. **Fork and Clone**
```bash
git clone https://github.com/parbhatkapila4/Visura.git
cd visura
```

2. **Install Dependencies**
```bash
npm install
```

3. **Setup Environment**
```bash
# Create .env.local file
# Add required environment variables (see README.md for full list)
# Required: DATABASE_URL, CLERK keys, OPENROUTER_API_KEY, etc.
```

4. **Run Development Server**
```bash
npm run dev
```

5. **Run Tests**
```bash
npm test
```

---

## Development Workflow

### 1. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 2. Make Changes
- Write clean, readable code
- Follow existing patterns
- Add tests for new features
- Update documentation

### 3. Test Your Changes
```bash
npm run test:run      # All tests pass
npm run lint          # No lint errors
npm run type-check    # No TypeScript errors
npm run build         # Builds successfully
```

### 4. Commit
```bash
git add .
git commit -m "feat: add amazing feature"
```

**Commit Message Format:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting, no code change
- `refactor:` Code restructuring
- `test:` Adding tests
- `chore:` Maintenance

### 5. Push and Create PR
```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

---

## Code Style

### TypeScript
- Use TypeScript for all new files
- Prefer `const` over `let`
- Use arrow functions for components
- Export types alongside functions

```typescript
// Good
export interface User {
  id: string;
  email: string;
}

export const getUser = async (id: string): Promise<User> => {
  return await db.query(...);
};

// Avoid
export function getUser(id) {
  return db.query(...);
}
```

### React Components
- Use functional components
- Keep components small (<300 lines)
- Extract reusable logic to hooks
- Use proper TypeScript types for props

```typescript
// Good
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export function Button({ onClick, children, variant = 'primary' }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>;
}

// Avoid
export function Button(props: any) {
  return <button {...props} />;
}
```

### File Naming
- Components: `PascalCase.tsx`
- Utilities: `kebab-case.ts`
- Pages: `page.tsx` (Next.js convention)
- Tests: `*.test.ts` or `*.test.tsx`

---

## Testing Guidelines

### What to Test
1. **Business Logic**: All utility functions
2. **API Routes**: Request validation, responses
3. **Components**: User interactions, rendering
4. **Edge Cases**: Empty states, errors, loading

### Test Structure
```typescript
describe('Feature Name', () => {
  describe('Specific Functionality', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = functionUnderTest(input);
      
      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

### Coverage Goals
- Aim for >75% overall coverage
- 100% coverage for critical paths (payment, auth)
- Don't test external libraries

---

## Debugging Tips

### Common Issues

**Issue**: "Module not found"
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

**Issue**: Database connection errors
```bash
# Check DATABASE_URL in .env.local
# Verify Supabase credentials
# Check Supabase dashboard for errors
```

**Issue**: Tests failing
```bash
# Clear test cache
npx vitest run --clearCache
```

**Issue**: Build errors
```bash
# Check TypeScript errors
npm run type-check

# Check for ESLint errors
npm run lint
```

---

## Project Structure

```
visura/
├── app/                    # Next.js App Router
│   ├── (logged-in)/       # Protected routes
│   ├── api/               # API endpoints
│   ├── [page]/            # Public pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # UI primitives
│   ├── common/           # Shared components
│   ├── home/             # Landing page sections
│   ├── dashboard/        # Dashboard components
│   ├── chatbot/          # Chat interface
│   └── summaries/        # Summary display
├── lib/                   # Backend logic
│   ├── db.ts             # Database connection
│   ├── validators.ts     # Zod schemas
│   ├── chatbot.ts        # Chat functions
│   ├── versioned-documents.ts  # Versioned processing
│   ├── embeddings.ts     # Vector search
│   ├── observability.ts  # Monitoring & metrics
│   └── [service].ts      # Service integrations
├── actions/               # Server actions
├── utils/                 # Shared utilities
├── migrations/           # Database migrations
├── tests/                 # Test files
└── public/               # Static assets
```

---

## Contribution Ideas

### Good First Issues
- Add more keyboard shortcuts
- Improve error messages and user feedback
- Add loading states and skeleton screens
- Write more unit and integration tests
- Improve accessibility (ARIA labels, keyboard navigation)
- Add more document type classifications
- Enhance mobile responsiveness

### Medium Complexity
- Add export to Word/Markdown feature
- Implement document search functionality
- Add document comparison
- Build batch document upload
- Add email notifications
- Improve observability dashboards

### Advanced
- Add OCR for scanned PDFs
- Document comparison feature
- Custom AI model fine-tuning
- Public API for third-party integrations
- Multi-region deployment

---

## Pull Request Checklist

Before submitting:

- [ ] Code follows project style
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Documentation updated
- [ ] Commits are descriptive
- [ ] PR description explains changes
- [ ] Screenshots for UI changes
- [ ] Breaking changes documented

---

## Code Review Process

1. **Automated Checks**: Tests, lint, type-check must pass
2. **Manual Review**: Maintainer reviews code quality
3. **Testing**: Feature tested manually
4. **Approval**: At least 1 approval required
5. **Merge**: Squash and merge to main

---

## Getting Help

- **Issues**: [GitHub Issues](https://github.com/parbhatkapila4/Visura/issues)
- **Discussions**: [GitHub Discussions](https://github.com/parbhatkapila4/Visura/discussions)
- **Email**: parbhat@parbhat.dev

---

## Recognition

Contributors will be:
- Listed in README.md
- Mentioned in release notes
- Given credit in commit history

---

Thank you for making Visura better!

