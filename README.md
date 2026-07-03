# Dylan Skinner | Personal Website & Blog

A modular, single-page personal website and academic blog showcasing research in data science, topology, and Bayesian predictive analytics (e.g. NHL Win Predictors).

---

## 🚀 Tech Stack

*   **Core**: React 19, TypeScript, Vite 8 (SPA)
*   **Styling**: Tailwind CSS v4, HeroUI v3 (React Aria-based)
*   **Routing**: React Router DOM v7
*   **Formatting & Linting**: Biome
*   **Math Rendering**: KaTeX (for mathematical equations and markdown directives)
*   **Web Server / Deployment**: Caddy 2 (rootless container) deployed via Podman to a Raspberry Pi homelab

---

## 📁 Project Structure

```text
├── src/
│   ├── components/       # Custom React components (e.g., CodeTabs, ContentParser, LiveNhlDashboard)
│   ├── content/          # Content Source (Markdown + Frontmatter)
│   │   ├── blog/         # Blog posts (.md format)
│   │   └── projects/     # Project summaries (.md format)
│   ├── data/             # Static game data and configuration (.json)
│   ├── hooks/            # Custom hooks (ThemeContext, useContent, useSearch)
│   │   └── useContent.ts # Vite import.meta.glob loader for Markdown
│   ├── pages/            # Page templates (Home, Blog, Projects, Live NHL)
│   ├── types/            # TypeScript interface definitions
│   ├── App.tsx           # Router layout and entry point
│   └── index.css         # Styling system & prose overrides
├── public/               # Public assets (PDFs, images, videos) served at root path
├── Caddyfile             # Server routing configuration
├── Containerfile         # Dockerfile for Caddy build
└── deploy.sh             # Automation script to compile, package, and deploy to Raspberry Pi
```

---

## 🛠️ Local Development

### 1. Installation
Install project dependencies:
```bash
npm install
```

### 2. Run Development Server
Spin up the Vite local dev server with HMR:
```bash
npm run dev
```

### 3. Build Production Bundle
Compile TypeScript and bundle assets to the `dist/` directory:
```bash
npm run build
```

### 4. Code Quality & Formatting (Biome)
Verify code formatting and linting rules (includes negative pattern ignore rules for build and asset directories):
```bash
# Check files
npm run lint

# Format and autofix lint errors
npm run lint:fix
```

## 🌐 Deployment Pipeline

The website is locally hosted on a Raspberry Pi using Podman for containerization and Cloudflare for secure networking and routing.

To view the live site, visit **[dylanskinner.dev](https://dylanskinner.dev)**.

### Deployment Steps:
1.  **Build & Package**: Run the local `deploy.sh` script:
    ```bash
    ./deploy.sh
    ```
    This script compiles the Vite production bundle, packages it with the `Caddyfile` and `Containerfile` into `deploy.tar.gz`, and transfers it to the Raspberry Pi.
2.  **Containerize**: The script SSHs into the Pi, extracts the files, builds a container image named `personal-website` using rootless Podman, and launches the container inside a dedicated Pod (`website-pod`) mapped to port `8080`.
