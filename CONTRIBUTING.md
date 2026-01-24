# Contributing to GigFlow

We love your input! We want to make contributing to GigFlow as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

### Pull Requests

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/gigflow-freelancer.git
   cd gigflow-freelancer
   ```

2. **Install Dependencies**
   ```bash
   # Backend
   cd backend && npm install
   
   # Frontend
   cd ../frontend && npm install
   ```

3. **Environment Setup**
   ```bash
   cp backend/.env.example backend/.env
   # Fill in your environment variables
   ```

4. **Database Setup**
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   npm run setup:supabase
   ```

5. **Start Development**
   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev
   
   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

## Code Style

### TypeScript
- Use TypeScript for all new code
- Prefer interfaces over types for object shapes
- Use strict mode settings

### React
- Use functional components with hooks
- Prefer custom hooks for reusable logic
- Use TypeScript for prop types

### Backend
- Use async/await over promises
- Implement proper error handling
- Use Prisma for database operations

### Naming Conventions
- **Files**: kebab-case (`user-profile.tsx`)
- **Components**: PascalCase (`UserProfile`)
- **Functions**: camelCase (`getUserProfile`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)

## Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:

```
type(scope): description

[optional body]

[optional footer]
```

### Types
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

### Examples
```bash
feat(auth): add JWT token refresh mechanism
fix(upload): resolve file size validation issue
docs(api): update endpoint documentation
style(ui): improve button hover states
refactor(db): optimize user query performance
test(auth): add login flow test cases
chore(deps): update dependencies to latest versions
```

## Testing

### Backend Testing
```bash
cd backend
npm run test:upload  # Test file upload system
npm run test         # Run all tests (when implemented)
```

### Frontend Testing
```bash
cd frontend
npm run test         # Run component tests (when implemented)
npm run test:e2e     # Run end-to-end tests (when implemented)
```

## Bug Reports

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/yourusername/gigflow-freelancer/issues).

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

### Bug Report Template

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Safari, Firefox]
- Node.js version: [e.g. 18.17.0]
- npm version: [e.g. 9.6.7]

**Additional context**
Add any other context about the problem here.
```

## Feature Requests

We use GitHub issues to track feature requests. Request a feature by [opening a new issue](https://github.com/yourusername/gigflow-freelancer/issues) with the "enhancement" label.

### Feature Request Template

```markdown
**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is. Ex. I'm always frustrated when [...]

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

## Code Review Process

1. **Automated Checks**: All PRs must pass automated checks (linting, type checking, tests)
2. **Manual Review**: At least one maintainer must review and approve the PR
3. **Testing**: New features should include appropriate tests
4. **Documentation**: Update documentation for any API changes

### Review Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review of the code has been performed
- [ ] Code is commented, particularly in hard-to-understand areas
- [ ] Corresponding changes to documentation have been made
- [ ] Changes generate no new warnings
- [ ] Tests have been added that prove the fix is effective or that the feature works
- [ ] New and existing unit tests pass locally

## Security

### Reporting Security Issues

Please do not report security vulnerabilities through public GitHub issues. Instead, please send an email to security@gigflow.com.

### Security Best Practices

- Never commit secrets or API keys
- Use environment variables for configuration
- Validate all user inputs
- Use HTTPS in production
- Keep dependencies updated
- Follow OWASP security guidelines

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to reach out:
- Create an issue for bugs or feature requests
- Start a discussion for questions or ideas
- Email us at contribute@gigflow.com

Thank you for contributing to GigFlow! 🚀