# Repository Guidelines

Concise guide for contributors and agents. Keep changes small, well-tested, and documented.

## Project Structure & Modules

- `backend/` â€” node backend app.
- `workflows/` â€” n8n workflows as JSON (`*.json`).
- `tests/` â€” `tests/backend/`  with unit tests
- `docs/` â€” process docs; includes:
  - `docs/commits/` â€” per-commit notes (`xYYMMDD_HHMM.txt`).
  - `docs/perspe/` â€” perspective files per implementation node.
  - `docs/implementation_tree.md` â€” source-of-truth implementation node plan.
  - `docs/context/` â€” context files per implementation step.
  - `docs/clarifications/` â€” ambiguity logs (`xYYMMDD_HHMM.txt`).
- `scripts/` â€” helpers (e.g., `run.sh`, `run.ps1`).


## Coding Style & Naming

- C#: 4 spaces; `PascalCase` for types; `camelCase` for members/locals.
- JSON/JS: 2 spaces; lowerCamelCase keys; keep files small and focused.
- If possible always use Typescript

## Commit & Pull Request Guidelines

- Commit message must start with: `xYYMMDD_HHMM [node:<ID>] <short summary>`.
- Body must include: per-file change notes, assumptions, and problems since last commit.
- On each commit, add:
  - `docs/commits/xYYMMDD_HHMM.txt` â€” must include:
    - Header with: `Stamp: xYYMMDD_HHMM`, `Node: N###`, `Message: <commit subject>`, and `This file: docs/commits/xYYMMDD_HHMM.txt`.
    - Changed files list (one relative path per line).
    - Per-file change notes, assumptions, and problems since last commit.
  - `docs/perspe/<node-ID>.md` â€” perspectives: QA, Dev, Junior Dev, Dreamer Dev, Typical Client.
- Keep PRs focused; link issues and include repro and test notes.
 - Reference any clarifications used (e.g., `clarify001`) in PR descriptions.

## Security & Configuration

- Do not commit secrets; use `.env`. Provide `.env.example` updates when adding vars.
- Optional run scripts: add both `scripts/run.sh` (bash) and `scripts/run.ps1` (PowerShell).

## Agent (Codex) Instructions

- Always write code, comments, identifiers, and repository files in English.
- You may communicate with maintainers in Polish or English; persist artifacts in English.
- Use fast search (`rg`) and mirror `backend/` and `frontend/` structure in `tests/`.
- Keep changes minimal; explain rationale in PRs; never commit secrets.
- Try to use design patterns
- Try to cover code with unittests

