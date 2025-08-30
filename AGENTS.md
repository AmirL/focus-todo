# AGENTS.md

Guidelines for coding agents working in this repository.

## Shell Search Tip

- Grep/rg searches: always pass the full project path when searching recursively to avoid timeouts or waiting on STDIN.
  - Use the absolute path `/Users/amir/dev/nodejs/doable` (or `.` if CWD is the project root).
  - Prefer `rg` if available; otherwise use `grep`.
  - Examples:
    - `rg -n "pattern" /Users/amir/dev/nodejs/doable`
    - `grep -RIn --exclude-dir node_modules --exclude-dir .git "pattern" /Users/amir/dev/nodejs/doable`

## TypeScript Rules

- Do not use the `any` type. Prefer explicit types, generics, `unknown`, or proper narrowing. The linter rule `@typescript-eslint/no-explicit-any` is enforced.
