/**
 * BUILDORA — Main Application Bootstrapper
 */

document.addEventListener("DOMContentLoaded", () => {
  // Check auth session
  const currentUser = window.auth ? window.auth.protectPage() : null;

  // Determine current active page from pathname or body data attribute
  const pageName = document.body.dataset.page || "dashboard";

  // Initialize shared layout if inside authenticated page
  if (window.ui && document.getElementById("app-sidebar")) {
    window.ui.initSharedLayout(pageName);
  }

  // If on Dashboard page, initialize dashboard controller
  if (pageName === "dashboard" && window.dashboard) {
    window.dashboard.init();
  }

  // Global close modal when clicking outside box
  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.classList.remove("active");
      }
    });
  });
});
