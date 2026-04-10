# Participating in the Project

As a Senior fullstack project assistant, I've established this guide to ensure our Motel Management System remains maintainable and high-quality.

## 🌿 Branching Strategy

We follow a professional branching model:

- **`main`**: Always stable and mirrors production. No direct commits allowed.
- **`develop`**: The primary integration branch. Features are merged here once verified.
- **`feature/*`**: For new features or non-urgent refactors. Created from `develop`.
- **`hotfix/*`**: For urgent production bug fixes. Created from `main`, merged into both `main` and `develop`.

### Typical Workflow

1.  Pull the latest changes: `git checkout develop && git pull origin develop`
2.  Create a branch: `git checkout -b feature/your-feature-name`
3.  Implement changes and commit locally.
4.  Push to origin: `git push origin feature/your-feature-name`
5.  Open a Pull Request to `develop`.

## ✍️ Commit Message Convention

We use **Conventional Commits** for clean and automated history:

Format: `<type>(<scope>): <description>`

- **`feat`**: A new feature (e.g., `feat(auth): add tenant login`)
- **`fix`**: A bug fix (e.g., `fix(invoice): correct total calculation`)
- **`chore`**: Maintenance (e.g., `chore(deps): update mongoose`)
- **`docs`**: Documentation (e.g., `docs(git): update contributing guide`)
- **`refactor`**: Code change that neither fixes a bug nor adds a feature
- **`style`**: Markup, white-space, formatting, etc.

## 🛠 Quality Standards

- **Modular Architecture**: Keep all business logic within `src/modules/`. Avoid inline database logic in API routes.
- **Naming**: Use English naming for all models, fields, and functions.
- **Automated Validation**: Ensure `npm run lint` and `npx tsc --noEmit` pass before pushing.
- **Pull Requests**: Use the provided template and wait for CI checks to pass.
