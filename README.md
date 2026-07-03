# Dylan Skinner | Personal Website & Homelab

The code behind **[dylanskinner.dev](https://dylanskinner.dev)**—a personal portfolio and academic blog showcasing research in data science, topology, and predictive modeling (such as live NHL win probability widgets).

---

## 🛠️ Architecture & Hosting

This site is fully self-hosted, showcasing a lightweight, secure homelab deployment:

*   **Hosting Platform**: Hosted locally on a home Raspberry Pi server.
*   **Containerization**: Runs inside a rootless container using **Podman** for process isolation and security.
*   **Web Server**: Powered by **Caddy 2** for high-performance static asset serving.
*   **Networking**: Routed securely through **Cloudflare** for edge tunneling, caching, and SSL termination.

---

## 💻 Tech Stack

*   **Frontend**: React 19 (TypeScript)
*   **Bundler**: Vite 8
*   **Styling**: Tailwind CSS v4 + HeroUI v3
*   **Math Rendering**: KaTeX (for inline mathematical equations and academic articles)
*   **Content Loader**: Dynamic markdown-based blog posts and project logs loaded via Vite's `import.meta.glob`
