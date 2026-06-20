# JSON Formatter & Validator

A free, high-performance, client-side React TypeScript web application to format, minify, validate, and inspect JSON structures instantly. Built with a VS Code-inspired dark theme, it highlights syntax, provides direct line numbers, calculates statistics, and offers collapsible tree views.

## Features

1.  **Dual Editor Panels**: 
    *   **Input Panel**: Large text input for raw JSON (supports line numbers, file drag-and-drop, and error highlighting).
    *   **Output Panel**: Highlighting, minification, tree-view rendering, and line numbers.
2.  **Formatter & Minifier**:
    *   **Format**: Beautifies JSON with custom indentation spacing (2 spaces, 4 spaces, or tabs).
    *   **Minify**: Compresses JSON into a single compact line, removing unnecessary whitespace.
    *   **Sort Keys**: Alphabetically sorts keys inside JSON objects during formatting.
3.  **Real-Time Validator Badge**:
    *   Evaluates JSON input dynamically.
    *   Displays a colored status badge: green pill for **Valid JSON**, red pill for **Invalid JSON** (including exact parser error details and line numbers), or grey for empty states.
    *   Highlights the invalid line in the input panel with a left red border.
4.  **No Library Syntax Highlighting**: Uses light, regex-based replacement tags to style elements cleanly:
    *   *Keys*: Blue (`#79B8FF`)
    *   *Strings*: Green (`#85E89D`)
    *   *Numbers*: Orange (`#F8AE54`)
    *   *Booleans*: Purple (`#B392F0`)
    *   *Null*: Red (`#F97583`)
5.  **Collapsible Tree View**: Toggle standard text layout into an interactive, recursive collapsible node tree (click arrows to expand or collapse nested objects and arrays).
6.  **URL JSON Import**: Enter any public REST API URL (e.g., jsonplaceholder) and fetch JSON directly into the input area. Includes CORS error handling.
7.  **Drag-and-Drop Loader**: Drag any `.json` file from your operating system and drop it over the input area to read it instantly using the FileReader API.
8.  **Stats Indicator**: Displays character counts and line counts for both inputs and outputs.
9.  **Clipboard Copy**: Copy formatted code instantly.

---

## Technical Details

*   **Framework**: [Vite](https://vite.dev/) + [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: Pure CSS editor themes matching VS Code's editor surface.
*   **Fonts**: `Space Grotesk` (chrome UI) and `JetBrains Mono` / Courier monospace (editor panels) loaded via Google Fonts.

---

## Local Setup

### Prerequisites
*   Node.js (v18+)
*   npm or yarn

### Installation
1. Navigate to the repository folder:
   ```bash
   cd JSON
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run local dev server:
   ```bash
   npm run dev
   ```
4. Compile for production:
   ```bash
   npm run build
   ```

---

## Deployment

Since this is a client-side static web application, it can be hosted directly on Vercel:
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New** → **Project**.
3. Import your GitHub repository `JSONformatter`.
4. Click **Deploy**.

---

## Submission Details
*   **Developer**: Phulkeshwar Mahto
*   **Email**: [phulkeshwarmahto@gmail.com](mailto:phulkeshwarmahto@gmail.com)
*   **Organization**: Built for Digital Heroes ([https://digitalheroesco.com](https://digitalheroesco.com))
