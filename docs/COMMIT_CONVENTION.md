# Commit Convention Guidelines

This project strictly follows the **Conventional Commits** specification for all code changes. This ensures a clean, searchable, and automated history.

## Format

```text
<type>(<scope>): <description>

[optional body]

[optional footer]
```

## Commit Types

| Type | Description |
| :--- | :--- |
| **feat** | A new feature for the user |
| **fix** | A bug fix |
| **refactor** | A code change that neither fixes a bug nor adds a feature |
| **chore** | Updating build tasks, package manager configs, etc. |
| **docs** | Documentation only changes |
| **style** | Changes that do not affect the meaning of the code (white-space, formatting, etc.) |
| **test** | Adding missing tests or correcting existing tests |
| **perf** | A code change that improves performance |

## Rules

1. **Short & Clear**: The subject line should not exceed 50 characters.
2. **Imperative Mood**: Use "add" instead of "added", "change" instead of "changed".
3. **No Period**: Do not end the subject line with a period.
4. **Scope (Optional)**: Provide additional contextual information (e.g., `feat(auth): add login validation`).

## Examples

- `feat: implement tenant login portal`
- `fix(rooms): resolve image loading flicker in carousel`
- `refactor: extract billing logic to specialized module`
- `chore: update next.js to v16`
