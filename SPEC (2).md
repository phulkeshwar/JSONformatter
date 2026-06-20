# Tool 4 — JSON Formatter + Validator
### Digital Heroes Trial | Vibe Coding Spec for Antigravity + Claude

---

## What to Build
A free, instant JSON formatter, validator, and minifier. Paste raw JSON → get it beautified, validated, and navigable in one click. Developer essential — no signup, no paste limits, no ads.

**Personal use case to mention in submission:**
> "Every time I was debugging API responses in my UptoSkills backend internship or testing Postman calls, I'd paste JSON into an online formatter — but they were either slow, had ads, or had a character limit. I wanted a clean, instant one I could host myself."

---

## Prompt to Paste into Antigravity (Claude Sonnet 4.6)

```
Build a single-file HTML/CSS/JS JSON Formatter + Validator web app. No frameworks, no build step — one index.html file deployable directly on Vercel.

CORE FEATURES:
1. Large textarea on the left for raw JSON input
2. Output panel on the right showing formatted/highlighted JSON
3. Four action buttons: Format (beautify), Minify, Validate, Clear
4. Real-time validation indicator — show green "Valid JSON" or red "Invalid JSON" badge as user types, with the exact error message and line number
5. Syntax highlighting in the output panel:
   - Keys: blue (#79B8FF)
   - String values: green (#85E89D)
   - Numbers: orange (#F8AE54)
   - Booleans (true/false): purple (#B392F0)
   - null: red (#F97583)
   - Brackets/braces: white
   (implement with regex-based replace — no external library)
6. Line numbers on both input and output panels
7. Copy output button (copies formatted JSON to clipboard)
8. Character count + line count shown below each panel
9. Indentation selector: 2 spaces / 4 spaces / tabs
10. "Sort Keys" toggle — when enabled, object keys are sorted alphabetically
11. Tree view toggle — collapse/expand the output as an interactive tree (click arrow to expand/collapse nested objects/arrays)
12. URL import: a small input where user pastes a URL and clicks "Fetch" — fetches JSON from that URL using fetch() and loads it into the input panel
13. Drag and drop a .json file onto the input panel to load it
14. Error highlighting — when JSON is invalid, highlight the approximate line in the input textarea with a red left border
15. "Built for Digital Heroes" button linking to https://digitalheroesco.com — label must be EXACT
16. Show name "Phulkeshwar Mahto" and email "phulkeshwarmahto@gmail.com" on the page

LAYOUT:
- Full-width two-panel split: input left, output right
- Fixed header bar with tool name, action buttons, and status badge
- Fixed footer with name, email, and "Built for Digital Heroes" button
- Panels fill remaining viewport height (100vh minus header and footer)
- Both panels scroll independently
- Mobile: stack vertically, input on top, output below, buttons wrap

DESIGN:
- Dark code-editor theme: background #1E1E1E (VS Code dark), panels #252526, header #333333
- Accent: #007ACC (VS Code blue)
- Monospace font: 'JetBrains Mono' from Google Fonts (fallback: 'Courier New')
- Status badge: green pill for valid, red pill for invalid, grey for empty
- Action buttons: flat, subtle — not big CTA buttons, more like an editor toolbar
- Line numbers: muted grey (#858585), right-aligned, fixed width column

SAMPLE JSON to pre-load on page load (so output panel is not blank):
{
  "tool": "JSON Formatter",
  "built_by": "Phulkeshwar Mahto",
  "email": "phulkeshwarmahto@gmail.com",
  "features": ["format", "minify", "validate", "tree-view"],
  "version": 1.0,
  "free": true,
  "built_for": "Digital Heroes"
}

TECH CONSTRAINTS:
- Single index.html (HTML + CSS + JS inline)
- No external JS libraries (no Monaco, no CodeMirror, no JSONView)
- Syntax highlighting: pure regex on the formatted string, wrap in <span> tags with color classes
- Tree view: recursive JS function that builds HTML from parsed JSON object
- fetch() for URL import with proper error handling (catch CORS errors, show message)
- FileReader API for drag-and-drop .json file loading
- JSON.parse() for validation — catch the error and extract line/column from the error message

MANDATORY:
- Button labeled EXACTLY "Built for Digital Heroes" → href="https://digitalheroesco.com"
- Name: Phulkeshwar Mahto visible on page
- Email: phulkeshwarmahto@gmail.com visible on page (mailto: link)
- Works on real JSON input — format, minify, validate must all produce correct output
- No paid APIs or external JS libraries
```

---

## Required Output Checklist (verify before deploying)

- [ ] Paste valid JSON → Format button → beautified output with correct indentation
- [ ] Paste valid JSON → Minify button → single-line output, no whitespace
- [ ] Paste invalid JSON → red "Invalid JSON" badge → error message with line number shown
- [ ] Paste valid JSON → green "Valid JSON" badge appears
- [ ] Syntax highlighting works — keys are blue, strings green, numbers orange, booleans purple, null red
- [ ] Line numbers visible on both panels
- [ ] Copy button copies formatted output to clipboard → shows "Copied!" feedback
- [ ] Indent selector (2 / 4 / tab) changes output correctly
- [ ] Sort Keys toggle — toggle on → keys sorted alphabetically in output
- [ ] Tree view toggle — click → output switches to collapsible tree; click arrows → expand/collapse
- [ ] URL import — paste a public JSON URL (e.g. `https://jsonplaceholder.typicode.com/todos/1`) → Fetch → loads into input
- [ ] Drag and drop a .json file → loads content into input panel
- [ ] "Built for Digital Heroes" button with exact label → digitalheroesco.com
- [ ] Name and email visible in footer
- [ ] Mobile layout works (stacked, no overflow)
- [ ] Sample JSON pre-loaded on page open
- [ ] No console errors on load

---

## Test Cases (run these to verify correctness)

**Valid JSON test:**
```json
{"name":"Phulkeshwar","skills":["React","Node.js"],"cgpa":8.5,"active":true,"address":null}
```
Expected after Format (2-space indent):
```json
{
  "name": "Phulkeshwar",
  "skills": [
    "React",
    "Node.js"
  ],
  "cgpa": 8.5,
  "active": true,
  "address": null
}
```

**Invalid JSON test:**
```
{"name": "test", "age": 25,}
```
Expected: red badge, error like `Unexpected token } at line 1`

**URL fetch test:**
Paste `https://jsonplaceholder.typicode.com/users/1` → Fetch → should load a valid JSON user object

---

## GitHub → Vercel Deployment

### Step 1 — GitHub Repo
```bash
git init
git add index.html
git commit -m "feat: json formatter validator - Digital Heroes trial tool 4"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/json-formatter-tool.git
git push -u origin main
```

### Step 2 — Vercel Deploy
1. vercel.com → **Add New Project** → Import `json-formatter-tool`
2. Framework Preset: **Other**
3. Build Command: **blank**
4. Output Directory: **blank**
5. Click **Deploy** → copy live URL

### Step 3 — Verify Live
- Open live URL → paste valid JSON → click Format → output appears with syntax highlighting
- Paste invalid JSON → red badge + error message
- Fetch URL test: `https://jsonplaceholder.typicode.com/todos/1`
- Click "Built for Digital Heroes" → goes to digitalheroesco.com
- Test on mobile

---

## MCP / Tools to Use in Antigravity

| Tool | Why |
|------|-----|
| **Claude Sonnet 4.6** | Build the full index.html from the prompt |
| **Gemini** (backup) | Switch if Claude hits token limit — this file will be long |
| **Vercel MCP** (`https://mcp.vercel.com`) | Deploy directly from Antigravity after build |
| **GitHub MCP** | Push repo without terminal |

### Antigravity tip for this tool
This is the longest single file of the 5 tools — the tree view + syntax highlighting + drag-drop all add JS. If Claude stops mid-file say:
> *"Continue the JavaScript from where you stopped — do not restart from the top"*

---

## Submission Line (copy-paste ready)

> **Tool:** JSON Formatter + Validator
> **Personal use:** While debugging API responses during my backend internship at UptoSkills, I constantly needed to format raw JSON from Postman — online tools were slow or had ads. Built this so I always have a clean, instant one.
> **Live URL:** https://json-formatter-tool.vercel.app
> **GitHub:** https://github.com/phulkeshwarmahto/json-formatter-tool
> **Name:** Phulkeshwar Mahto
> **Email:** phulkeshwarmahto@gmail.com

---

## Antigravity Debug Hints

| Problem | Fix to tell Claude |
|---------|-------------------|
| Syntax highlighting not working | *"The highlight function should escape HTML first (replace < > & with entities), then apply regex color spans"* |
| Tree view arrows not toggling | *"Add click event delegation on the output panel — toggle a 'collapsed' class on the child ul/div when the arrow span is clicked"* |
| URL fetch failing with CORS | *"Wrap fetch in try/catch, show message: 'CORS blocked — paste the JSON manually instead'"* |
| Line numbers misaligned | *"Use a fixed-width pre element for line numbers, sync scroll position of line number column with the textarea using the scroll event"* |
| Drag and drop not working | *"Add dragover (preventDefault), drop (preventDefault, read dataTransfer.files[0] with FileReader.readAsText) on the input panel div"* |
