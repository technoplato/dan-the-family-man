# Technical Design & Website Plan: Dan the Family Man

This document serves as the master blueprint for building a responsive, high-performance website for **"Dan the Family Man"** (handyman, woodworker, and custom builder). It aligns with all user requirements, focusing on a premium look, vanilla HTML/JS, high performance, local data storage, secure rate-limited leads, and contextual form-based tracking.

---

## 🎨 Design System & Color Palette

The color system is extracted directly from the approved **Option 3 Mobile Homepage** and the premium wood worker elements in **Option 7 & 8**:

### Theme Colors
* **Primary Navy/Slate Blue**: `#1A365D` (Rich dark slate blue for hero backgrounds, header bars, and primary buttons).
* **Secondary Forest Green**: `#1B3B2B` (Deep forest green for secondary CTAs, "Inquire" buttons, and success states).
* **Accent Walnut/Maple Wood**: `#8C5A3C` (Warm craftsman wood tone for framing borders, headers, and highlights).
* **Background Cozy Off-White/Beige**: `#FAF9F6` (Extremely premium warm canvas to replace cold sterile white).
* **Typography Slate/Charcoal**: `#2D3748` (Slate dark gray for readable, modern typography).

### Fonts & Typography
* **Primary Headings**: Use Google Fonts `'Outfit', sans-serif` for high-impact bold typography. Font sizes are set large by default using responsive units (`rem`/`vw`) to scale seamlessly.
* **Body & UI Elements**: `'Inter', sans-serif` or native modern system font fallbacks.

---

## 🌐 Site Structure (Framework-Free Multi-Page Site)

To guarantee a **100 Lighthouse score**, high SEO indexability, and clean code, the site is implemented using pure **HTML5**, **CSS3**, and **Vanilla JavaScript** (no heavy frameworks like React/Vue/Angular).

```
website/
├── public/
│   ├── css/
│   │   └── style.css            # Single premium stylesheet with CSS custom properties
│   ├── js/
│   │   ├── main.js              # Dynamic categories, photo grids loading, and nav
│   │   └── inquiry.js           # Form parameter mapping and hidden tracking fields
│   ├── data/
│   │   └── projects.json        # Dynamic local projects data file (JSON)
│   ├── images/                  # Photo uploads and portfolio assets
│   ├── index.html               # Main landing page (8-categories grid & top TLDR form)
│   ├── category.html            # Category projects index (dynamic list view)
│   ├── project.html             # Individual project details page (dynamic details view)
│   ├── about.html               # Custom craftsmanship story
│   └── contact.html             # Centralized context-aware inquiry form
├── server.js                    # Simple Node/Express web server, API builder & rate-limiter
└── package.json                 # Node package configuration
```

---

## 📸 Key Layouts & Portfolio Features

### 1. Main Homepage (`index.html`)
* **Top Contact Form (TLDR)**: Form positioned prominently at the top right/center so older or high-intent clients can contact Dan immediately without scrolling. Copy: *"Need a hand? Let Dan handle it."*
* **8 Project Categories Grid**: Beautiful Instagram-style grid displaying the 8 categories: `Bookshelves`, `Beams`, `Fan Installs`, `Cabinet Installs`, `Bar Installs`, `Childproofing`, `Barn Doors`, and `Custom Builds`.

### 2. Category Details (`category.html`)
* Clicking a homepage category displays all projects inside that category. It features a list grid of completed projects, each linking to its respective project details view.

### 3. Individual Project View (`project.html`)
* **Step-by-Step Phases Layout**: Displays three horizontal panels showing the distinct phases of a specific build (e.g. *Phase 1: Framing*, *Phase 2: Assembly*, *Phase 3: Crown & Lighting*).
* **Before & After Slide Transition**: A clean interactive toggle or slider layout that lets users instantly switch between `Before` and `After` views of a project with absolute overlays.
* **Inquire CTA & Sidebar**: Floating layout showing:
  * `"Inquire about a project similar to [Project Name]"` button.
  * `"More projects like this"` top-right sidebar grid listing three related builds.

---

## 📈 SEO Integration & Core Performance

### SEO Links (Footer/Specialties Bar)
To optimize SEO indexability without cluttering the editorial design, we implement a **Specialties Footer Navigation** containing anchor links targeting keyword-rich pages:
* Custom Woodworking
* Ceiling Fan Installation
* Structural Beam Installation
* Custom Cabinetry & Shelving
* Built-in Farmhouse Bookshelves
* Custom Barn Door Installation
* Drop & Stops (Mudroom Lockers & Storage Benches)

### Core Web Vitals Optimization
* **Fetch Priority**: The primary landing hero or page banner image gets `fetchpriority="high"` and is never lazy loaded.
* **Lazy Loading**: All portfolio cards and below-the-fold assets use native `loading="lazy"`.

---

## 📥 Inquire Link & Context Tracking (No Cookies)

We use a strictly cookie-free, URL-encoded parameter routing pipeline:

1. **CTA Interaction**: Clicking `"Inquire about a project similar to [Project Title]"` redirects the client to:
   `/contact.html?project=[Project%20Title]&link=[URL%20Encoded%20Project%20Page%20Link]`
2. **Hidden Fields Capture**:
   * The contact page JavaScript (`inquiry.js`) parses `project` and `link` from the URL parameters.
   * It displays a beautiful highlight badge in the form UI: *"Inquiring about a project similar to: [Project Title]"*.
   * It injects these values directly into two hidden form input fields:
     `<input type="hidden" name="project_title" id="project_title_field">`
     `<input type="hidden" name="project_link" id="project_link_field">`
   * The fields are fully URL-encoded in the POST form payload, preventing users from accidentally deleting them or cluttering their visible message text.

---

## 🛡 Express Server Security & Rate Limiting

### 1. Submissions Rate Limiting
To prevent lead submission spam and DDoS attacks, we implement a lightweight rate-limiting system on the backend `server.js` route `/api/inquire`:
* Submissions are tracked in a memory cache map using client IP addresses.
* Limit is set to **max 5 contact submissions per hour per IP address**. Submissions exceeding the limit return an HTTP `429 Too Many Requests` status.

### 2. Validation & Sanitation
* **Name & Contact Fields**: Strict email regex check, character length caps, and phone digit validation.
* **Payload Sanitation**: Every text field (including custom descriptions) is stripped of HTML tags and special script tags to prevent Cross-Site Scripting (XSS) and injection.
