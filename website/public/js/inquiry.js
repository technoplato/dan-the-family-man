/* inquiry.js - Secure Cookie-Free Inquiry Parameter Routing */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("lead_inquiry_form");
  if (!form) return;

  // Extract link and title URL arguments
  const urlParams = new URLSearchParams(window.location.search);
  const projectTitle = urlParams.get("project");
  const projectLink = urlParams.get("link");

  const titleField = document.getElementById("project_title_field");
  const linkField = document.getElementById("project_link_field");
  const formCard = document.querySelector(".contact-form-card");

  if (projectTitle && projectLink && titleField && linkField) {
    // URL-decode the pre-filled parameters securely
    const decodedTitle = decodeURIComponent(projectTitle);
    const decodedLink = decodeURIComponent(projectLink);

    // Pre-fill hidden inputs
    titleField.value = decodedTitle;
    linkField.value = decodedLink;

    // Create a beautiful premium green inquiry badge at the top of the form
    const badge = document.createElement("div");
    badge.className = "inquiry-badge";
    badge.innerHTML = `
      <span>Inquiring about a project similar to: <strong>${decodedTitle}</strong></span>
      <button type="button" id="clear_inquiry_btn" aria-label="Clear Inquiry Context">✕</button>
    `;

    // Insert badge before form elements
    form.insertBefore(badge, form.firstChild);

    // Setup clear badge event
    const clearBtn = document.getElementById("clear_inquiry_btn");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        titleField.value = "";
        linkField.value = "";
        badge.remove();
        // Remove url params cleanly without refreshing
        window.history.replaceState({}, document.title, window.location.pathname);
      });
    }
  }

  // Handle Secure Form Submission & Validation
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("client_name").value.trim();
    const contact = document.getElementById("client_contact").value.trim();
    const city = document.getElementById("client_city").value.trim();
    const description = document.getElementById("job_description").value.trim();

    // Simple robust form validation
    if (!name || !contact || !city || !description) {
      alert("Please fill in all fields before submitting.");
      return;
    }

    // Prepare JSON payload
    const payload = {
      name,
      contact,
      city,
      description,
      project_title: titleField ? titleField.value : "",
      project_link: linkField ? linkField.value : ""
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerText = "Sending Request...";
    }

    try {
      const response = await fetch("/api/inquire", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 429) {
        alert("Too many requests! You have exceeded the contact rate limit. Please try again in an hour.");
        return;
      }

      if (!response.ok) {
        throw new Error("Form submission failed.");
      }

      const result = await response.json();
      
      // Render success screen in-place
      formCard.innerHTML = `
        <div style="text-align: center; padding: 24px 0;">
          <div style="font-size: 4rem; margin-bottom: 16px;">🛠</div>
          <h3 style="color: var(--secondary-green); font-size: 2rem; margin-bottom: 8px;">Request Sent!</h3>
          <p style="font-size: 1.1rem; color: var(--text-slate); margin-bottom: 24px;">
            Thank you, <strong>${name}</strong>. Dan has received your project details and will review it shortly.
          </p>
          <a href="index.html" class="btn-primary" style="display: inline-block; width: auto; padding: 12px 24px;">Return Home</a>
        </div>
      `;
    } catch (err) {
      console.error(err);
      alert("Submission error. Please try again.");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = "Submit Request";
      }
    }
  });
});
