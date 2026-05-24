# Dan the Family Man 🛠️

[![Build & Smoke Test Status](https://github.com/technoplato/dan-the-family-man/actions/workflows/build-status.yml/badge.svg)](https://github.com/technoplato/dan-the-family-man/actions)
[![Render Live](https://img.shields.io/badge/Render-Live_Hobby-1B3B2B?logo=render&style=flat-square&logoColor=white)](https://dan-the-family-man.onrender.com/)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/technoplato/dan-the-family-man)

A premium, framework-free dynamic handyman and custom carpentry website built with **Vanilla HTML5, CSS3, and Node/Express**. 

* **Live Deployment:** [dan-the-family-man.onrender.com](https://dan-the-family-man.onrender.com/)
* **Local Workspace Port:** `http://localhost:3000`

---

## 🎨 Premium Visual Design System

Designed around a cozy lumberjack craftsman theme, utilizing:
* **Primary Navy/Slate Blue (`#1A365D`)**
* **Secondary Forest Green (`#1B3B2B`)**
* **Accent Wood (`#8C5A3C`)**
* **Cozy Off-White/Beige Background (`#FAF9F6`)**
* **Bold Slab Typography**

---

## ⚡ Core Features

* **High-Converting Landing (TLDR Form):** Puts the contact form upfront so high-intent older or mobile users can reach Dan in one screen.
* **8 Illustrated portfolio Categories:** Instagram-style card grids displaying: *Bookshelves, Beams, Fan Installs, Cabinet Installs, Bar Installs, Childproofing, Barn Doors, and Custom Builds*.
* **Dynamic Before & After Overlays:** Clean relative parent container rendering absolute text badges (`BEFORE` and `AFTER`) over raw uploads without needing graphic design edits.
* **Programmatic Lead Parameter Routing:** Completely cookie-free. Form-based inquiry links (e.g. *Inquire about a project similar to Amelia Island Bookshelves*) URL-encode payloads, pre-fill hidden form inputs, and highlight the exact product details on the contact page.
* **🛡️ Security & IP Rate Limiting:** Implements Express memory-cache rate limits restricting submissions to **max 5 per hour per IP address** and sanitizes all inputs to prevent XSS.

---

## 📂 Repository Layout

```
dan-the-family-man/
├── mock-ups/             # Design boards & responsive layouts (Desktop, Tablet, Mobile)
├── documentation/
│   ├── progress.md       # Human-datestamped project progress log
│   └── website/
│       ├── website.plan.md   # Architectural & layout technical plan
│       └── website.agents.md # Instructions guide for AI Developer Agents
└── website/
    ├── public/
    │   └── uploads/      # Persistent dynamic data store (projects.json, leads, images)
    ├── server.js         # Core Express web server, API routes, and rate-limiting
    └── package.json
```

---

## 🛠️ Dynamic Admin Page Builder & Git-Ops

To support **100% free hosting ($0/mo)** on the Hobby plan without paid database subscriptions:
* **Locally:** You can run `node server.js` and use the built-in admin dashboard (`/api/projects/add`) to dynamically add categories, upload images, and save them permanently to your disk using your Cloudflare Tunnel (`nofi.com`).
* **In the Cloud:** To add photos to the live Render cloud site for free, drop your images into `/website/public/uploads/images/`, append your details to `projects.json`, and commit/push to GitHub. Render automatically catches the push and rebuilds the site statically!

---

## 🚀 Deployment & Build Verification

* **Automated CI Build Status:** The status badge at the top of this repository verifies that the web app and Node/Express server compile and launch successfully on GitHub Actions.
* **Render CD Integration:** Render is directly connected to our GitHub repository. On every push to the `main` branch, Render's Hobby plan automatically pulls the latest changes, builds the app, and rolls out the update to [dan-the-family-man.onrender.com](https://dan-the-family-man.onrender.com/).
* **Commit Deploy Status:** You can see exactly which commit corresponds to the active live build by looking at the **Environments** or **Deployments** panel on the right sidebar of our GitHub repository page.
