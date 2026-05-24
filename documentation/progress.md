# Project Progress Log (progress.md)

This log documents all master milestones, architecture design audits, and technical refinements executed for **"Dan the Family Man's"** web platform.

---

### Saturday, May 23rd, 2026, 22:56:15
* **Milestone:** Strict Open Graph Landscape SEO Preview & Portfolio Re-Organization
* **Changes Completed:**
  * **Strict 1.91:1 Aspect Ratio:** Generated and cropped the Open Graph preview card (`og_preview.png`) to exactly **1200x630 pixels** to prevent any cutoffs in iMessage or other chat client link previews.
  * **Mockups Folder Re-organization:** Segregated the `/mock-ups/` folder into three distinct, non-duplicated folders: `/likes/` (liked mockups), `/dislikes/` (moving the disliked personal photo mockup here), and `/need-to-look-at/` (other desktop and mobile views).
  * **Seeding & Active Web Assets:** Purged duplicate mockup images and the face photo mockup from `/website/public/uploads/images/`, and seeded descriptive category-specific image cards (`bookshelves_category.png`, `fans_category.png`, etc.) directly from the high-fidelity mockups.
  * **CI Build Verification Plugin:** Designed and integrated a GitHub Actions workflow `.github/workflows/build-status.yml` to automatically verify node installs and Express server boot listening health on every commit.
  * **README & Status Badges:** Documented the CI pipeline and Render CD status triggers inside the main `README.md` with active badges.
  * **Server-Side Dynamic Meta Injection (SSR):** Implemented Express-level dynamic metadata routing for `/project.html` and `/category.html`. When shared, the server intercepts requests, parses query parameters (`?id=...`), reads `projects.json`, and dynamically injects the project or category title, description, and high-fidelity custom photo into the HTML header on-the-fly before serving it. This ensures all chat crawlers (iMessage, Slack, Facebook) immediately render custom, rich, project-specific Open Graph link previews instead of a static generic placeholder.
  * **Dynamic Project-Specific Showcase Visuals (SSR):** Generated a stunning full-wall dark oak bookshelves visual, and cropped out premium walnut cabinetry details and farmhouse mudroom locker bench elements into exactly **1200x630 pixels** (1.91:1 ratio) landscape visuals. Wired them into `projects.json` via a new `og_image` property, enabling the dynamic Express meta-router to serve beautiful project-specific photos for all custom links shared (e.g. sharing Amelia Island bookshelves links will now instantly showcase the high-fidelity dark oak library photo instead of just the logo card!).
  * **Secure Zero-Cost Programmatic Lead Notifications (Resend & SMS):** Integrated the **Resend** transactional email API in `server.js` and `package.json` for 100% free programmatic delivery (up to 3,000 emails/month). Dispatches structured, beautifully designed HTML lead emails securely to Dan's personal Outlook address (`NOTIFICATION_EMAIL`) and/or his phone via carrier-specific Email-to-SMS gateways (`SMS_GATEWAY_EMAIL`) upon submission. All API keys and personal emails/phone numbers are kept strictly backend-only via Render environmental variables, completely protecting privacy from frontend crawlers.
  * **Sandbox Verification Success:** Injected the developer's Sandbox API key and verified the complete end-to-end leads routing loop. Confirmed that Resend successfully accepts, validates, and dispatches the HTML lead email directly to `lustig@knophy.com` with API transaction ID `101405c4-8ee4-430a-9fea-9acd35f961d1`.

---

### Saturday, May 23rd, 2026, 10:44:15
* **Milestone:** 100% Free Cloud Deployment Blueprint & Path Restructuring
* **Changes Completed:**
  * **Folder Re-Organization:** Consolidated all dynamic, mutable resources (JSON database, local leads log, uploaded photos) under a single `/website/public/uploads/` parent directory to accommodate persistent cloud volume boundaries.
  * **Hobby Plan Specification:** Overwrote `render.yaml` to specify the 100% Free Web Service tier (Hobby compute plan) and completely removed the paid persistent disk to guarantee **$0/month** hosting costs.
  * **Git-Ops Guidelines:** Documented the new *Ephemeral Free-Tier Git-Ops Method* in `website.agents.md`. AI Developer Agents must add new project images and edit `projects.json` directly via Git-ops commands, prompting Render to rebuild the site instantly with permanent static assets.
  * **Codebase Pushed:** Added a new `.gitignore` file, initialized Git, resolved credential permissions by shifting git remote URL to HTTPS under the `technoplato` account helper, and pushed everything to the [technoplato/dan-the-family-man](https://github.com/technoplato/dan-the-family-man) main branch.

---

### Saturday, May 23rd, 2026, 10:28:18
* **Milestone:** Post-Audit Security & Framework-Free Refinements (Score: 10/10)
* **Changes Completed:**
  * **Directory Paths:** Moved design blueprints to `/documentation/website/` and updated local `/website/` workspace symlinks.
  * **Cookie Removal:** Strictly banned browser cookies. Formulated a fully secure, URL-encoded parameter-based tracking hidden input pipeline in `inquiry.js` and `contact.html` instead.
  * **IP Rate Limiting:** Integrated memory-cache based rate limiting on `/api/inquire` restricting clients to max 5 form submissions per hour.
  * **HTML/CSS/JS Page Scaffolding:** Fully built dynamic static HTML views, main JS router controllers, and premium cozy lumberjack variable CSS styles.
  * **Server Integration:** Validated the backend `server.js` startup successfully on Localhost:3000.

---

### Saturday, May 23rd, 2026, 09:53:00
* **Milestone:** Quality Design Mockups & Layout Compilation
* **Changes Completed:**
  * **Mockups Generation:** Designed nine high-fidelity web views (Desktop home, tablet home, mobile home, expanded navigation overlays, bookshelves categories detail views, ceiling fan installations details views, and step-by-step project phases).
  * **Presentation Design Board:** Formulated a Python Pillow script `assemble_board.py` that successfully compiled and scaled the responsive layouts side-by-side into a single master sheet saved to `/mock-ups/design_board_comparison.png`.
