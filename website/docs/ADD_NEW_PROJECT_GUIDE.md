# Adding New Projects to Tom's Portfolio Website

This guide provides step-by-step instructions for adding new projects to the portfolio website. Follow these steps to ensure the project appears in all necessary locations and maintains consistency with the existing design.

## Overview

When adding a new project, you need to update **5 key locations**:
1. Create the project detail page
2. Add project image
3. Update the portfolio grid page
4. Update the home page carousel
5. Update the navigation menu

---

## Step 1: Prepare Project Assets

### Project Image
- **Location**: `images/projects/`
- **Format**: JPG preferred
- **Dimensions**: Recommended 800x600px or similar aspect ratio
- **Naming**: Use kebab-case (e.g., `my-new-project.jpg`)
- **File size**: Optimize for web (under 500KB)

### Project Information Needed
- Project title
- Client/Organization name
- Date/Year
- Project URL (if applicable)
- Brief description (1-2 sentences)
- Detailed description (multiple paragraphs)
- Technologies used
- Key features
- Category (web-app, community, mobile-app, productivity)

---

## Step 2: Create Project Detail Page

### File Location
Create new file: `projects/your-project-name.html`

### Template Structure
Use the existing `projects/wizards-wiffle-ball-club.html` as a template and modify:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Your Project Name - Tom's Portfolio</title>
  <!-- Keep all existing meta tags and links -->
</head>
<body class="bg-body homepage post-template">
  <!-- Keep all existing SVG symbols -->
  
  <a class="menu-btn"><span></span></a>
  
  <div class="container-fluid">
    <!-- Include Menu -->
    <div id="menu-placeholder"></div>
    
    <main class="col-lg-10 offset-lg-2">
      <div class="container">
        <div class="justify-content-center px-1 mx-1 px-xl-5 mx-xl-5">
          
          <section id="about" class="my-5 py-5" data-aos="fade-up">
            <span class="text-muted text-uppercase">PROJECT DETAILS</span>
            <div class="row d-flex flex-wrap">
              <div class="col-lg-12 pb-5">
                <h1 class="display-4 txt-fx slide-up">Your Project Name</h1>
              </div>
            </div>
            
            <!-- Project metadata -->
            <div class="row">
              <div class="col-lg-6 pb-5">
                <div data-aos="fade-up" data-aos-delay="200">
                  <ul class="list-unstyled d-flex gap-2 gap-md-5 flex-column flex-md-row">
                    <li>
                      <h5>Client</h5>
                      <p>Client Name</p>
                    </li>
                    <li>
                      <h5>Date</h5>
                      <p>2024-2025</p>
                    </li>
                    <li>
                      <h5>Project link</h5>
                      <p><a href="https://yourproject.com/" target="_blank">https://yourproject.com/</a></p>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="col-lg-6 pb-5">
                <div class="fs-5" data-aos="fade-up" data-aos-delay="300">
                  <p>Brief project description goes here...</p>
                </div>
              </div>
            </div>

            <!-- Hero Image -->
            <div class="row">
              <div class="col-lg-12">
                <div class="portfolio-image py-5">
                  <figure>
                    <img src="../images/projects/your-project-image.jpg" alt="Your Project Name" class="img-fluid">
                  </figure>
                  <figcaption>Your Project Caption</figcaption>
                </div>
              </div>
            </div>

            <!-- Add your custom content sections here -->
            
          </section>
        </div>
      </div>
    </main>
  </div>

  <!-- Keep all existing scripts -->
  <script src="../js/jquery-1.11.0.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.bundle.min.js"></script>
  <script src="../js/plugins.js"></script>
  <script src="../js/menu.js"></script>
  <script src="../js/script.js"></script>
</body>
</html>
```

### Key Points for Project Detail Page:
- Use relative paths with `../` for assets (CSS, JS, images)
- Include the menu placeholder: `<div id="menu-placeholder"></div>`
- Include the menu.js script
- Use consistent class names and structure
- Add proper alt text for images

---

## Step 3: Update Portfolio Grid Page

### File Location
`portfolio-masonry.html`

### Add New Project Block
Add this block inside the `.grid` container, following the existing pattern:

```html
<!-- Your Project Name -->
<div class="col mb-4 portfolio-item [CATEGORY]">
  <a href="projects/your-project-name.html" class="project-link"
    title="Your Project Name - Brief description"><img src="images/projects/your-project-image.jpg"
      class="img-fluid" alt="Your Project Name"></a>
</div>
```

### Categories Available:
- `web-app` - Web applications
- `community` - Community/Brand projects  
- `mobile-app` - Mobile applications
- `productivity` - Productivity tools

### Important Notes:
- Use `class="project-link"` (NOT `image-link` - this prevents lightbox interference)
- Follow the exact HTML structure
- Use descriptive title attributes
- Ensure image paths are correct

---

## Step 4: Update Home Page Carousel

### File Location
`index.html`

### Add New Slide
Find the `.swiper-wrapper` section and add a new slide:

```html
<div class="swiper-slide">
  <div class="image-holder">
    <a href="projects/your-project-name.html" title="Your Project Name"><img src="images/projects/your-project-image.jpg"
        alt="Your Project Name" class="img-fluid"></a>
  </div>
  <div class="caption d-flex justify-content-between align-items-center">
    <div class="title">Your Project Name</div>
    <a href="#" class="image-format bg-[COLOR]">[TYPE]</a>
  </div>
</div>
```

### Format Colors Available:
- `bg-green` for web projects
- `bg-blue` for app projects  
- `bg-orange` for notion/productivity projects
- `bg-red` for mobile app projects

### Format Types:
- `web` - Web applications
- `app` - Applications
- `notion` - Notion/productivity tools
- `mobile` - Mobile applications

---

## Step 5: Update Navigation Menu

### File Location
`includes/menu.html`

### Add Menu Item
Find the Projects dropdown section and add a new list item:

```html
<li><a href="projects/your-project-name.html">Your Project Name</a></li>
```

### Menu Structure Location:
Look for the `#projects-collapse` div and add your project to the list inside.

---

## Step 6: Testing Checklist

After adding your project, test these areas:

### Navigation Testing:
- [ ] Project appears in main navigation menu
- [ ] Menu link navigates to correct project page
- [ ] Project page loads without errors
- [ ] Project page menu navigation works

### Portfolio Grid Testing:
- [ ] Project appears in portfolio grid
- [ ] Clicking project image navigates to detail page (no lightbox)
- [ ] Project appears in correct category filter
- [ ] Image displays correctly

### Home Page Testing:
- [ ] Project appears in home page carousel
- [ ] Carousel slide links to correct project page
- [ ] Image and caption display correctly

### Project Page Testing:
- [ ] All images load correctly
- [ ] All links work (external project links)
- [ ] Page is responsive on mobile
- [ ] Navigation menu loads and works

---

## File Structure Reference

```
website/
├── images/
│   └── projects/
│       └── your-project-image.jpg          # New project image
├── projects/
│   └── your-project-name.html              # New project detail page
├── includes/
│   └── menu.html                           # Update: Add menu item
├── index.html                              # Update: Add carousel slide
├── portfolio-masonry.html                  # Update: Add grid item
└── docs/
    └── ADD_NEW_PROJECT_GUIDE.md           # This guide
```

---

## Common Mistakes to Avoid

1. **Using `image-link` class**: Always use `project-link` for portfolio grid items
2. **Incorrect image paths**: Use `../` prefix in project detail pages
3. **Missing menu.js script**: Project pages need this for navigation
4. **Inconsistent naming**: Use kebab-case for files and consistent titles
5. **Missing alt text**: Always include descriptive alt text for images
6. **Wrong category classes**: Use exact category names for filtering

---

## AI Assistant Instructions

When helping to add a new project, follow this exact sequence:

1. **Gather Information**: Ask for project name, description, category, and image
2. **Create Project Image**: Ensure image is placed in `images/projects/`
3. **Create Project Detail Page**: Use template structure with correct paths
4. **Update Portfolio Grid**: Add project block with correct category class
5. **Update Home Carousel**: Add swiper slide with appropriate format color
6. **Update Navigation Menu**: Add menu item to projects dropdown
7. **Test All Links**: Verify navigation works from all entry points

Always use the existing project files as templates and maintain consistency with the current design patterns.
