# Contributing to Visura

Thank you for your interest in contributing to Visura.

---

## Getting started

### Prerequisites

- Node.js 20.19+ on 20.x, 22.12+ on 22.x, or 24+ (the test tooling requires it)
- npm
- Git
- Neon Postgres database
- Supabase account
- Clerk account
- OpenRouter API key

### Setup

1. **Fork and clone**

Fork the repo on GitHub, then clone your fork:

```bash
git clone https://github.com/<your-username>/Visura.git
cd Visura
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up the environment**

```bash
# Create .env.local file
# Add required environment variables, create the Supabase bucket and set up the database (see Steps 2-4 of QUICK_START.md)
# Required: DATABASE_URL, Clerk keys, OPENROUTER_API_KEY, etc.
```

4. **Run the development server**

```bash
npm run dev
```

5. **Run tests**

```bash
npm test
```

---

## Development workflow

### 1. Create a branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 2. Make changes

- Write clean, readable code
- Follow existing patterns
- Add tests for new features
- Update documentation

### 3. Test your changes

```bash
npm run test:run      # All tests pass
npm run lint          # No lint errors
npm run type-check    # No TypeScript errors
npm run build         # Builds successfully
```

### 4. Commit

```bash
git add .
git commit -m "feat: add markdown export"
```

**Commit message format:**

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting, no code change
- `refactor:` Code restructuring
- `test:` Adding tests
- `chore:` Maintenance

### 5. Push and open a pull request

```bash
git push origin feature/your-feature-name
```

Then open a pull request from your fork on GitHub.

---

## Code style

### TypeScript

- Use TypeScript for all new files
- Prefer `const` over `let`
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

### React components

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

### File naming

- Components: `kebab-case.tsx`
- Utilities: `kebab-case.ts`
- Pages: `page.tsx` (Next.js convention)
- Tests: `*.test.ts` or `*.test.tsx`

---

## Testing guidelines

### What to test

1. **Business logic**: All utility functions
2. **API routes**: Request validation, responses
3. **Components**: User interactions, rendering
4. **Edge cases**: Empty states, errors, loading

### Test structure

```typescript
describe("Feature Name", () => {
  describe("Specific Functionality", () => {
    it("should do something specific", () => {
      // Arrange
      const input = "test";

      // Act
      const result = functionUnderTest(input);

      // Assert
      expect(result).toBe("expected");
    });
  });
});
```

### What not to test

- Don't test external libraries

---

## Debugging tips

### Common issues

**Issue**: "Module not found"

```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

**Issue**: Database connection errors

```bash
# Check DATABASE_URL in .env.local
# Check Neon dashboard for errors
```

**Issue**: Tests failing

```bash
# Clear test cache
npx vitest run --clearCache
```

**Issue**: Build errors

`next build` skips TypeScript and ESLint errors (`next.config.ts`), so they are not what failed. Check that `RAZORPAY_KEY_ID` is set (Step 3 of QUICK_START.md) and read the first error the build prints. Run `npm run type-check` and `npm run lint` on their own before you push.

---

## Project structure

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
│   ├── landing/          # Landing page sections
│   ├── dashboard/        # Dashboard components
│   ├── chatbot/          # Chat interface
│   └── summaries/        # Summary display
├── lib/                   # App logic, mostly server-side (some files, such as document-extractor.ts, run in the browser)
│   ├── db.ts             # Database connection
│   ├── validators.ts     # Zod schemas
│   ├── chatbot.ts        # Chat functions
│   ├── versioned-documents.ts  # Versioned processing
│   ├── embeddings.ts     # Vector search
│   └── [service].ts      # Service integrations
├── actions/               # Server actions
├── utils/                 # Shared utilities
├── migrations/           # Database migrations
├── tests/                 # Test files
└── public/               # Static assets
```

---

## Contribution ideas

### Good first issues

- Add more keyboard shortcuts
- Improve error messages and user feedback
- Add loading states and skeleton screens
- Write more unit and integration tests
- Improve accessibility (ARIA labels, keyboard navigation)
- Enhance mobile responsiveness

### Medium complexity

- Add export to Word/Markdown feature
- Build batch document upload
- Add email notifications

### Advanced

- Custom AI model fine-tuning
- Public API for third-party integrations
- Multi-region deployment

---

## Pull request checklist

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

## Code review process

1. **Checks**: Tests, lint and type-check must pass. No CI runs them and `next build` skips lint and type errors (`next.config.ts`), so run them locally before you push.
2. **Manual review**: Maintainer reviews code quality
3. **Testing**: Feature tested manually
4. **Merge**: Squash and merge to main

---

## Getting help

- **Issues**: [GitHub Issues](https://github.com/parbhatkapila4/Visura/issues)
- **Email**: parbhat@parbhat.dev

---

## Recognition

Contributors will be:

- Given credit in commit history

---

Thank you for making Visura better.
