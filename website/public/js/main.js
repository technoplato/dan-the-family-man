/* main.js - Core Vanilla JS Site Router & Layout Builder */

// 🔒 Global Premium Portfolio Password Gate
(function() {
  const saved = localStorage.getItem("dan_auth");
  const expectedHash = "dantheman";
  
  const cleanPass = (p) => p ? p.trim().toLowerCase().replace(/\s+/g, '') : '';
  
  if (cleanPass(saved) === expectedHash) {
    return; // Already authenticated, proceed normally
  }
  
  // Inject gating style immediately to prevent screen flash/scrolling
  const style = document.createElement("style");
  style.id = "gate-no-scroll";
  style.innerHTML = `
    body {
      overflow: hidden !important;
      height: 100vh !important;
    }
    @keyframes slideUpGate {
      from { opacity: 0; transform: translateY(24px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes shakeGate {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-6px); }
      40%, 80% { transform: translateX(6px); }
    }
  `;
  document.head.appendChild(style);
  
  // Render beautiful overlay once DOM is loaded
  document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.createElement("div");
    overlay.id = "password_gate_overlay";
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: #FAF9F6;
      z-index: 9999999;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 24px;
      font-family: 'Inter', -apple-system, sans-serif;
    `;
    
    overlay.innerHTML = `
      <div class="contact-form-card" style="max-width: 420px; width: 100%; text-align: center; border-top: 6px solid #8C5A3C; box-shadow: 0 20px 45px rgba(27, 59, 43, 0.15); animation: slideUpGate 0.6s cubic-bezier(0.25, 0.8, 0.25, 1); background: #ffffff;">
        <h1 style="font-size: 2.2rem; font-weight: 900; letter-spacing: -1.2px; text-transform: uppercase; color: #1A365D; margin-bottom: 8px;">
          DAN // <span style="color: #8C5A3C;">FAMILY MAN</span>
        </h1>
        <p style="font-size: 0.85rem; font-weight: 800; color: #1B3B2B; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 24px;">
          🛠️ Private Portfolio Portal
        </p>
        <p style="font-size: 0.95rem; color: #2D3748; margin-bottom: 24px; line-height: 1.6;">
          This craftsman carpentry and woodworking portfolio is password protected. Enter password to view.
        </p>
        
        <form id="gate_form">
          <div class="form-group" style="margin-bottom: 20px; text-align: left;">
            <label style="font-weight: 700; font-size: 0.8rem; letter-spacing: 0.5px; text-transform: uppercase; color: #2D3748; display: block; margin-bottom: 8px;">Portal Password</label>
            <input type="password" id="gate_password" class="form-control" placeholder="Enter password..." required style="height: 50px; font-size: 1.15rem; text-align: center; letter-spacing: 2px;">
          </div>
          <div id="gate_error" style="color: #c53030; font-size: 0.85rem; font-weight: 700; margin-top: -12px; margin-bottom: 16px; display: none;">
            ❌ Incorrect password. Try again.
          </div>
          <button type="submit" class="btn-primary" style="height: 50px; font-size: 1.05rem; display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%;">
            <span>Unlock Portal</span> 🔑
          </button>
        </form>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    const form = document.getElementById("gate_form");
    const input = document.getElementById("gate_password");
    const errorEl = document.getElementById("gate_error");
    
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const entered = input.value;
      if (cleanPass(entered) === expectedHash) {
        localStorage.setItem("dan_auth", "dantheman");
        
        // Smooth slide out and fade animation
        overlay.style.transition = "opacity 0.4s ease, transform 0.4s ease";
        overlay.style.opacity = "0";
        overlay.style.transform = "scale(1.04)";
        
        setTimeout(() => {
          overlay.remove();
          const gateStyle = document.getElementById("gate-no-scroll");
          if (gateStyle) gateStyle.remove();
        }, 400);
      } else {
        errorEl.style.display = "block";
        input.value = "";
        input.focus();
        
        // Apply shake error animation
        const card = overlay.querySelector(".contact-form-card");
        card.style.animation = "shakeGate 0.4s ease";
        setTimeout(() => {
          card.style.animation = "";
        }, 400);
      }
    });
  });
})();

document.addEventListener("DOMContentLoaded", () => {
  // Mobile Hamburger Toggle
  const hamburger = document.getElementById("hamburger_menu");
  const mobileDrawer = document.getElementById("mobile_drawer");
  const dimmer = document.getElementById("dimmer_overlay");

  if (hamburger && mobileDrawer && dimmer) {
    const toggleMenu = () => {
      mobileDrawer.classList.toggle("open");
      dimmer.style.display = mobileDrawer.classList.contains("open") ? "block" : "none";
    };

    hamburger.addEventListener("click", toggleMenu);
    dimmer.addEventListener("click", toggleMenu);
  }

  // Load and Render Portfolio Data
  loadPortfolioData();
});

// Dynamic URL Param Fetcher
function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Load dynamic data from projects.json
async function loadPortfolioData() {
  try {
    const response = await fetch("/api/projects");
    if (!response.ok) throw new Error("API failed, falling back to static path.");
    const data = await response.json();
    initializePage(data);
  } catch (error) {
    // Local fallback for client static testing
    try {
      const response = await fetch("/public/uploads/data/projects.json");
      const data = await response.json();
      initializePage(data);
    } catch (fallbackErr) {
      console.error("Error loading portfolio data:", fallbackErr);
    }
  }
}

// Page Routing & Initialization
function initializePage(data) {
  const path = window.location.pathname;
  
  if (path.endsWith("index.html") || path === "/") {
    renderHomepage(data);
  } else if (path.endsWith("category.html")) {
    renderCategoryPage(data);
  } else if (path.endsWith("project.html")) {
    renderProjectPage(data);
  }
}

// 1. Homepage Renderer
function renderHomepage(data) {
  const grid = document.getElementById("categories_grid");
  if (!grid) return;

  grid.innerHTML = data.categories.map(cat => `
    <article class="category-card">
      <a href="category.html?id=${cat.id}">
        <img class="category-img" src="${cat.image}" alt="${cat.name}" loading="lazy">
        <div class="category-info">
          <h3>${cat.name}</h3>
          <p>Explore dynamic options & phases</p>
        </div>
      </a>
    </article>
  `).join("");
}

// 2. Category Page Renderer
function renderCategoryPage(data) {
  const categoryId = getQueryParam("id");
  const category = data.categories.find(c => c.id === categoryId);
  if (!category) return;

  // Title & Header setup
  const title = document.getElementById("category_title");
  if (title) title.innerText = category.name;

  const projectList = document.getElementById("category_projects_list");
  if (!projectList) return;

  // Filter projects belonging to this category
  const filtered = data.projects.filter(p => p.categoryId === categoryId);

  if (filtered.length === 0) {
    projectList.innerHTML = `<p>No projects uploaded for this category yet. Check back soon!</p>`;
    return;
  }

  projectList.innerHTML = filtered.map(proj => `
    <article class="category-card">
      <a href="project.html?id=${proj.id}">
        <img class="category-img" src="${proj.after}" alt="${proj.title}" loading="lazy">
        <div class="category-info">
          <h3>${proj.title}</h3>
          <p>View before/after and phases</p>
        </div>
      </a>
    </article>
  `).join("");
}

// 3. Project Details Page Renderer
function renderProjectPage(data) {
  const projectId = getQueryParam("id");
  const project = data.projects.find(p => p.id === projectId);
  if (!project) return;

  // Render Title and Description
  const titleEl = document.getElementById("project_title");
  const descEl = document.getElementById("project_description");
  if (titleEl) titleEl.innerText = project.title;
  if (descEl) descEl.innerText = project.description;

  // Before & After Absolute Layout
  const baContainer = document.getElementById("before_after_container");
  if (baContainer && project.before && project.after) {
    baContainer.innerHTML = `
      <div class="ba-image-wrapper">
        <img src="${project.before}" alt="Before view of ${project.title}" fetchpriority="high">
        <span class="ba-badge">BEFORE</span>
      </div>
      <div class="ba-image-wrapper">
        <img src="${project.after}" alt="After view of ${project.title}" fetchpriority="high">
        <span class="ba-badge after">AFTER</span>
      </div>
    `;
  }

  // Set up the Inquire Button Link Payload (strictly secure URL parameters)
  const inquireBtn = document.getElementById("inquire_btn");
  if (inquireBtn) {
    inquireBtn.innerText = `Inquire about a project similar to ${project.title}`;
    
    // URL-encode the link and title to guarantee it isn't tampered with
    const encodedTitle = encodeURIComponent(project.title);
    const encodedLink = encodeURIComponent(window.location.href);
    
    inquireBtn.addEventListener("click", () => {
      window.location.href = `contact.html?project=${encodedTitle}&link=${encodedLink}`;
    });
  }

  // Render Step-by-Step Build Phases
  const phasesGrid = document.getElementById("phases_grid");
  if (phasesGrid) {
    if (project.phases && project.phases.length > 0) {
      phasesGrid.innerHTML = project.phases.map(phase => `
        <div class="phase-card">
          <div class="phase-img-wrapper">
            <img src="${phase.image}" alt="${phase.name}" loading="lazy">
          </div>
          <div class="phase-info">
            <h4>${phase.name}</h4>
            <p>${phase.description}</p>
          </div>
        </div>
      `).join("");
    } else {
      document.querySelector(".phases-section").style.display = "none";
    }
  }

  // Render Sidebar "More Projects Like This"
  const sidebarGrid = document.getElementById("sidebar_more_grid");
  if (sidebarGrid) {
    const related = data.projects.filter(p => p.categoryId === project.categoryId && p.id !== project.id);
    if (related.length > 0) {
      sidebarGrid.innerHTML = related.map(rel => `
        <a href="project.html?id=${rel.id}" class="sidebar-item">
          <img class="sidebar-item-img" src="${rel.after}" alt="${rel.title}" loading="lazy">
          <div class="sidebar-item-info">
            <h5>${rel.title}</h5>
            <span>Explore build 🛠</span>
          </div>
        </a>
      `).join("");
    } else {
      // If no related projects in the same category, show random other categories
      sidebarGrid.innerHTML = data.categories.slice(0, 3).map(cat => `
        <a href="category.html?id=${cat.id}" class="sidebar-item">
          <img class="sidebar-item-img" src="${cat.image}" alt="${cat.name}" loading="lazy">
          <div class="sidebar-item-info">
            <h5>${cat.name}</h5>
            <span>View category 🔗</span>
          </div>
        </a>
      `).join("");
    }
  }
}
