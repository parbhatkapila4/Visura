# Contributing to Visura

Thank you for your interest in contributing to Visura! This document provides guidelines and best practices.

---

## 🚀 Getting Started

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
git clone https://github.com/YOUR_USERNAME/visura.git
cd visura
```

2. **Install Dependencies**
```bash
npm install
```

3. **Setup Environment**
```bash
# Copy ENV_TEMPLATE.md content to .env.local
# Fill in your API keys
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

## 📝 Development Workflow

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

## 🎨 Code Style

### TypeScript
- Use TypeScript for all new files
- Prefer `const` over `let`
- Use arrow functions for components
- Export types alongside functions

```typescript
// ✅ Good
export interface User {
  id: string;
  email: string;
}

export const getUser = async (id: string): Promise<User> => {
  return await db.query(...);
};

// ❌ Avoid
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
// ✅ Good
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export function Button({ onClick, children, variant = 'primary' }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>;
}

// ❌ Avoid
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

## 🧪 Testing Guidelines

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

## 🐛 Debugging Tips

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

## 📚 Project Structure

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
│   └── [service].ts      # Service integrations
├── utils/                 # Shared utilities
├── tests/                 # Test files
└── public/               # Static assets
```

---

## 🎯 Contribution Ideas

### Good First Issues
- Add more keyboard shortcuts
- Improve error messages
- Add loading states
- Write more tests
- Fix TypeScript `any` types
- Improve accessibility

### Medium Complexity
- Add export to Word feature
- Implement search functionality
- Add document comparison
- Build batch upload
- Add email notifications

### Advanced
- Implement streaming AI responses
- Add vector search for chat
- Build background job queue
- Add OCR for scanned PDFs
- Multi-language support

---

## ✅ Pull Request Checklist

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

## 🤝 Code Review Process

1. **Automated Checks**: Tests, lint, type-check must pass
2. **Manual Review**: Maintainer reviews code quality
3. **Testing**: Feature tested manually
4. **Approval**: At least 1 approval required
5. **Merge**: Squash and merge to main

---

## 📞 Getting Help

- **Issues**: [GitHub Issues](https://github.com/yourusername/visura/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/visura/discussions)
- **Email**: help@productsolution.net

---

## 🏆 Recognition

Contributors will be:
- Listed in README.md
- Mentioned in release notes
- Given credit in commit history

---

Thank you for making Visura better! 🎉

