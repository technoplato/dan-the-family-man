# AI Developer Agent Guidelines (website.agents.md)

This file contains strict instructions for subsequent AI coding assistants working on "Dan the Family Man's" website. It guarantees that the visual quality, clean vanilla structure, performance, SEO, lead generation context, and page builder APIs remain extremely coherent and follow the approved design system.

---

## 🛠 Architectural Rules

### 1. No JavaScript Frameworks
* Do **NOT** install React, Next.js, Vue, Angular, Svelte, or TailwindCSS.
* Keep the code strictly **Vanilla HTML5**, **Vanilla CSS3**, and **Vanilla ES6+ JavaScript**.
* CSS must use native variables (`--primary-blue`, etc.) and modern CSS features (like Grid, Flexbox, Aspect-Ratio, and Container Queries).

### 2. File and Data Structure
* All project data (categories, details, before/after phases, and images) must be dynamically read from and written to `/public/data/projects.json`.
* Do **NOT** hardcode images or copy into HTML files. Keep layouts template-driven so that the admin page builder continues to work seamlessly.
* Images are stored strictly in `/public/images/`.

---

## 📸 Image and Portfolio Management

### 1. Performant Image Loading Checklist
* **Fetch Priority**: The primary hero or banner image at the top of a page must feature `fetchpriority="high"` and **never** be lazy loaded.
* **Lazy Loading**: All images below-the-fold (such as items inside the portfolio categories grids) must feature `loading="lazy"`.
* **Aspect Ratios**: Always set explicit `width` and `height` attributes on `<img>` nodes to prevent layout shifts (CLS issues).
* **Responsive Images**: Use `srcset` and `sizes` or the `<picture>` tag when displaying dense images, permitting the browser to fetch lower resolutions for mobile.

### 2. Auto-Overlaying Before & After Text
* Dan will upload raw pictures. The system superimposes the labels dynamically via absolute CSS layout boxes:
```html
<div class="project-phase-container">
  <div class="image-wrapper before-wrapper">
    <img src="/images/raw-upload-before.jpg" alt="Before Custom Shelf Build" loading="lazy">
    <span class="phase-badge before-badge">BEFORE</span>
  </div>
  <div class="image-wrapper after-wrapper">
    <img src="/images/raw-upload-after.jpg" alt="After Custom Shelf Build" loading="lazy">
    <span class="phase-badge after-badge">AFTER</span>
  </div>
</div>
```
* **CSS Badges**: Ensure `.phase-badge` features absolute positioning, a semi-transparent dark backdrop, clean white text, and woodworker-aligned sans-serif headings in the top/bottom corners.

---

## 📈 SEO & Semantics Guide

### 1. Heading Hierarchy
* Max **one** `<h1>` per page.
* Use logical nested tags (`<h2>`, `<h3>`) for project names and section divisions.
* Do not style random tags as headings. Maintain clear document maps.

### 2. Link SEO Architecture
* The Specialties menu in the footer must consist of raw anchor links (`<a>`) containing the exact target phrases to build organic Google keyword ranks:
  * `custom-woodworking`
  * `ceiling-fan-installation`
  * `structural-beam-installation`
  * `custom-cabinetry-shelving`
  * `built-in-farmhouse-bookshelves`
  * `custom-barn-door-installation`
  * `drop-and-stops-mudroom-lockers`

---

## 📥 Inquiry Hidden Parameter Tracking (No Cookies)

* **Cookies Prohibited**: Under no circumstances should browser cookies be used to store project click contexts.
* **Hidden Form Parameters**:
  * Extract query parameters (`project` and `link`) from URL parameters in `public/js/inquiry.js`.
  * URL-decode both parameters and dynamically pre-fill hidden form inputs:
    `<input type="hidden" name="project_title" id="project_title_field">`
    `<input type="hidden" name="project_link" id="project_link_field">`
  * Form submissions must pass these inputs directly within the URL-encoded POST request body to `/api/inquire`.

---

## 🛡 Security & Express Rate Limiting

* The Express server `/api/inquire` route must track client IP addresses.
* Limit client form submissions to a maximum of **5 submissions per hour per IP** using local caching.
* Exceeding limits must yield an HTTP `429 Too Many Requests` error with clean UI notifications.
* Sanitize all input fields on the backend by stripping HTML tags before logging or routing.
