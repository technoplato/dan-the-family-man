/* main.js - Core Vanilla JS Site Router & Layout Builder */

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
