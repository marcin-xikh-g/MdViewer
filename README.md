# MdViewer

MdViewer converts Markdown documents into styled HTML pages and opens them in the default browser. The tool is implemented in TypeScript and can be packaged into a Windows `.exe` for drag-and-drop use.

## Features

- Converts `.md` files to HTML using a lightweight built-in Markdown renderer.
- Writes the HTML file alongside the source Markdown (or a custom path via `--out`).
- Launches the generated HTML in the system default browser (Windows `cmd /c start`, macOS `open`, Linux `xdg-open`).
- Includes opinionated styling with inline CSS for an attractive reading experience.
- Supports theme customization via a `mdviewer.config.json` file placed beside the executable.
- Provides automated regression tests with the Node.js test runner.
- Optional packaging via [`pkg`](https://github.com/vercel/pkg) to produce a standalone Windows executable.

## Getting Started

```bash
cd backend
npm install   # requires access to npm registry (typescript download)
npm run build
node dist/cli.js path/to/file.md
```

### CLI Usage

```
mdviewer <file.md> [--out <file.html>] [--no-open]
```

- `--out <file.html>`: specify a custom output file.
- `--no-open`: skip launching the default browser after conversion.

## Configuration

`MdViewer` automatically loads `mdviewer.config.json` located next to the running executable (or the compiled script during development).
This repository ships with a sample configuration at the project root so the packaged `.exe` immediately uses the custom theme.

### Style Options

| Option                | Type            | Description                                                                 |
|-----------------------|-----------------|-----------------------------------------------------------------------------|
| `accentColor`         | string          | Anchor color used for links and interactive highlights.                     |
| `backgroundColor`     | string          | Background color applied to the `<html>` root element.                      |
| `backgroundGradient`  | string          | Gradient or color fill for the page background behind the container.       |
| `baseFontFamily`      | string          | Font stack applied to the entire document.                                  |
| `codeBlockBackground` | string          | Background color for fenced code blocks.                                    |
| `codeBlockText`       | string          | Foreground color for code block text.                                       |
| `containerMaxWidth`   | string or number| Maximum width of the content container (numbers gain a `px` suffix).        |
| `customCss`           | string          | Extra CSS appended after the base styles for advanced tweaks.               |

Leave any option out to fall back to the built-in defaults.

### Packaging to `.exe`

1. Ensure [`pkg`](https://github.com/vercel/pkg) is installed (`npm install -g pkg`) or available via `npx`.
2. Build the TypeScript sources:
   ```bash
   npm run build
   ```
3. Package the executable:
   ```bash
   npm run build:exe
   ```
   The script copies `mdviewer.config.json` into the `dist/` folder so the executable and config sit side-by-side.
4. The resulting binary (`dist/MdViewer.exe`) accepts Markdown files as CLI arguments or drag-and-drop payloads.

## Running Tests

```bash
cd backend
npm install   # requires registry access
npm test
```

The test suite validates the Markdown renderer and the file conversion workflow.

## Notes on Offline Environments

This repository avoids runtime dependencies, but building and testing still require downloading `typescript` (and optionally `pkg`). If registry access is restricted, install those packages manually in an allowed environment or vendor the compiled output.
