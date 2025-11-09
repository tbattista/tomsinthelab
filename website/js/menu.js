// Global menu component
function loadMenu() {
  // Determine if we're in a subdirectory
  const isInSubdirectory = window.location.pathname.includes('/projects/');
  const basePath = isInSubdirectory ? '../' : '';
  
  const menuHTML = `
    <header id="header-nav" class="col-lg-2 position-fixed px-5 bg-white h-100">
      <div class="header-wrap d-flex flex-column justify-content-between h-100">
        <div class="navigation">
          <div class="site-logo mt-5">
            <a href="${basePath}index.html">
              <img src="${basePath}images/branding/main-logo.png" alt="logo" class="img-fluid">
            </a>
          </div>

          <nav id="one-page-menu" class="vertical-menu my-5">
            <ul class="menu-list list-unstyled">
              <li><a href="${basePath}index.html#home" class="nav-link">Home</a></li>
              <li><a href="${basePath}index.html#about" class="nav-link">About</a></li>
              <li><a href="${basePath}index.html#education" class="nav-link">Education & Experience</a></li>
              <li><a href="${basePath}index.html#interests" class="nav-link">Interests</a></li>
              <li>
                <a href="${basePath}index.html#portfolio" class="nav-link btn-toggle d-flex justify-content-between align-items-center collapsed"
                  data-bs-toggle="collapse" data-bs-target="#projects-collapse" aria-expanded="false">
                  Projects
                </a>
                <div id="projects-collapse" class="collapse">
                  <ul class="list-unstyled py-3">
                    <li><a href="${basePath}index.html#portfolio">My Picks</a></li>
                    <li><a href="${basePath}portfolio-masonry.html">All Projects</a></li>
                    <li><a href="${basePath}projects/wizards-wiffle-ball-club.html">Wizards Wiffle Ball Club</a></li>
                    <li><a href="${basePath}projects/gym-workout-logger.html">Gym Workout Logger</a></li>
                    <li><a href="${basePath}projects/para-notion-dashboard.html">PARA Notion Dashboard</a></li>
                    <li><a href="${basePath}projects/spicy-inventory-app.html">Spicy Inventory App</a></li>
                  </ul>
                </div>
              </li>
              <li><a href="${basePath}index.html#contact" class="nav-link">Contact</a></li>
            </ul>
          </nav>
        </div>
        <div class="mt-5">
          <div class="email-links">
            <a href="mailto:tbattista@gmail.com" class="py-3 my-3 border-bottom d-flex">tbattista@gmail.com</a>
          </div>
          <ul class="list-unstyled d-flex justify-content-start flex-wrap gap-3">
            <li>
              <a href="https://www.instagram.com/toms_inthelab" target="_blank" class="text-dark">
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <use xlink:href="#instagram"></use>
                </svg>
              </a>
            </li>
            <li>
              <a href="https://www.linkedin.com/in/thomasbattista" target="_blank" class="text-dark">
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <use xlink:href="#facebook"></use>
                </svg>
              </a>
            </li>
            <li>
              <a href="https://www.youtube.com/@MakersMadLab" target="_blank" class="text-dark">
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <use xlink:href="#youtube"></use>
                </svg>
              </a>
            </li>
          </ul>
          <div class="py-4 border-top">
            <p>&copy; 2025 Tom's in the Lab</p>
          </div>
        </div>
      </div>
    </header>
  `;
  
  document.getElementById('menu-placeholder').innerHTML = menuHTML;
}

// Enhanced navigation function for Projects button and Portfolio link
function handleProjectsClick(event) {
  // Check if we're on the index page
  const isOnIndexPage = window.location.pathname.endsWith('index.html') || 
                       window.location.pathname === '/' || 
                       window.location.pathname.endsWith('/');
  
  if (isOnIndexPage) {
    // We're already on index page, prevent default and handle navigation
    event.preventDefault();
    
    const accordion = document.getElementById('projects-collapse');
    const accordionButton = event.target.closest('[data-bs-target="#projects-collapse"]');
    
    // Scroll to portfolio section immediately
    const portfolioSection = document.getElementById('portfolio');
    if (portfolioSection) {
      portfolioSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      // Update URL hash
      history.pushState(null, null, '#portfolio');
    }
    
    // Also expand the accordion if it's not already open
    if (accordion && accordion.classList.contains('collapse') && !accordion.classList.contains('show')) {
      // Expand the accordion
      const bsCollapse = new bootstrap.Collapse(accordion, { show: true });
      
      // Update button state
      if (accordionButton) {
        accordionButton.classList.remove('collapsed');
        accordionButton.setAttribute('aria-expanded', 'true');
      }
    }
    
  } else {
    // We're on a different page, allow default navigation to index#portfolio
    // The href will handle the navigation
  }
}

// Function to setup enhanced navigation after menu loads
function setupEnhancedNavigation() {
  // Add click handler for main Projects button
  const projectsButton = document.querySelector('[data-bs-target="#projects-collapse"]');
  if (projectsButton) {
    projectsButton.addEventListener('click', handleProjectsClick);
  }
  
  // Add click handler for Portfolio link in dropdown
  const portfolioLinks = document.querySelectorAll('a[href*="#portfolio"]');
  portfolioLinks.forEach(link => {
    // Only add handler to the dropdown Portfolio link, not the main Projects button
    if (!link.hasAttribute('data-bs-toggle')) {
      link.addEventListener('click', handleProjectsClick);
    }
  });
  
  // If we're on index page and URL has #portfolio hash, expand accordion
  if ((window.location.pathname.endsWith('index.html') || 
       window.location.pathname === '/' || 
       window.location.pathname.endsWith('/')) && 
      window.location.hash === '#portfolio') {
    
    setTimeout(() => {
      const accordion = document.getElementById('projects-collapse');
      const accordionButton = document.querySelector('[data-bs-target="#projects-collapse"]');
      
      if (accordion && !accordion.classList.contains('show')) {
        const bsCollapse = new bootstrap.Collapse(accordion, { show: true });
        
        if (accordionButton) {
          accordionButton.classList.remove('collapsed');
          accordionButton.setAttribute('aria-expanded', 'true');
        }
      }
    }, 100);
  }
}

// Load menu when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  loadMenu();
  
  // Setup enhanced navigation after menu is loaded
  setTimeout(setupEnhancedNavigation, 100);
});
