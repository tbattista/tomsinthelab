# Tom's Portfolio Website - Project Plan

## Overview
Transform the Julia Creative Portfolio template into a personal portfolio website for Tom Battista, focusing on maker projects and technology solutions. The site will showcase 4 core projects with individual detailed pages.

## Project Goals
- Create a professional portfolio showcasing maker/tech projects
- Maintain clean, modern design without CSS/style changes
- Focus on project showcase with individual project pages
- Simple navigation and user experience

## Site Structure

### Pages to Keep & Customize
- **index.html** - Main homepage with personal branding
- **portfolio-masonry.html** - Projects grid view with filtering
- **contact.html** - Contact form and information
- **4 Individual Project Pages** - Detailed project showcases

### Pages to Remove/Hide
- blog.html (no build logs needed)
- team.html (not applicable for personal portfolio)
- single-post.html (no blog functionality)

## Content Customization Plan

### 1. Homepage (index.html)

#### Header/Navigation Updates
- Site title: "Toms in the lab"
- Logo: Replace with custom logo
- Navigation menu:
  - Home
  - About (anchor link)
  - Experience (anchor link)
  - Projects (link to portfolio-masonry.html)
  - Contact

#### Hero Section
- Replace "Julia Stiles" with "Tom Battista"
- Professional title: "Sales Professional"
- Tagline: "Maker of all things. Lover of all technology."
- Hero image: Replace with Tom's photo

#### Services Section (Icon Boxes)
Replace existing services with "Coming Soon" placeholders:
- Box 1: "Coming Soon" - Future service offering
- Box 2: "Coming Soon" - Future service offering  
- Box 3: "Coming Soon" - Future service offering
- Box 4: Keep "View All Work" button linking to projects

#### About Section
- **Education**: Update with Tom's background
- **Experience**: Update with relevant work history
- **Interests**: 
  - Home Automation: "I love designing self-sufficient smart systems using ESPHome, Home Assistant, and sensors for everything from lighting to leak detection."
  - DIY Projects & Tinkering: "Whether it's building a mini Fenway for wiffle ball or printing a custom tool, I always have a project on the bench."

#### Experience/Skills Section
- Personal info table:
  - Age: 30s
  - Residence: Rhode Island, USA
  - Address: New England
  - Email: tbattista@gmail.com
  - Phone: 401-286-5231
- Skills chart: Update with relevant technical skills

#### Contact Section
- FAQ section with Tom's custom Q&As:
  - Q1: Can you help automate something in my home?
  - Q2: Can I hire you for a custom web or app project?
  - Q3: What platforms do you work with?
  - Q4: Do you sell your creations?
  - Q5: Can I learn how to build something like this myself?

#### Footer/Social Links
- Email: tbattista@gmail.com
- Social media:
  - Instagram: @tomsinthelab
  - LinkedIn: tomsinthelab
  - GitHub: tbattista
  - Website: https://tomsinthelab.com/

### 2. Portfolio Grid (portfolio-masonry.html)

#### Header Section
- Title: "Portfolio"
- Subtitle: "Recent Projects"
- Description: Update with Tom's project philosophy

#### Project Categories/Filters
- Web App
- Community/Brand
- Mobile App
- Productivity

#### Project Grid Items
Replace template portfolio items with 4 projects:

1. **Gym Workout Logger**
   - Category: Web App
   - Thumbnail: gym-log-app.jpg
   - Link: projects/gym-workout-logger.html

2. **Wiffle Ball Club Website**
   - Category: Community/Brand
   - Thumbnail: wiffle-club-site.jpg
   - Link: projects/wiffle-ball-website.html

3. **Spicy - Spice Inventory App**
   - Category: Mobile App
   - Thumbnail: spicy-app.jpg
   - Link: projects/spicy-inventory-app.html

4. **PARA Notion Dashboard**
   - Category: Productivity
   - Thumbnail: para-dashboard.jpg
   - Link: projects/para-notion-dashboard.html

### 3. Individual Project Pages

Create 4 project pages using single-portfolio.html template:

#### projects/gym-workout-logger.html
- **Title**: Gym Workout Logger
- **Client**: Personal Project
- **Date**: [Project completion date]
- **Project Link**: [GitHub or live demo link]
- **Description**: Flask-based app to log workouts, print custom Word templates, and save data by session or user login.
- **Category**: Web App
- **File Formats**: .py, .docx
- **Images**: Multiple screenshots showing app interface
- **Technical Details**: Flask, Python, Word template generation

#### projects/wiffle-ball-website.html
- **Title**: Wiffle Ball Club Website
- **Client**: Wizards Wiffle Ball Club
- **Date**: [Project completion date]
- **Project Link**: https://wizardswiffleball.com/
- **Description**: Built a branding site and event tracker for Wizards Wiffle Ball Club, including field maps and invite manager.
- **Category**: Community/Brand
- **File Formats**: .html, .css
- **Images**: Website screenshots, field maps, branding elements

#### projects/spicy-inventory-app.html
- **Title**: Spicy - Spice Inventory App
- **Client**: Personal Project
- **Date**: [Project completion date]
- **Project Link**: [App store or demo link]
- **Description**: Firebase-powered mobile app for tracking kitchen spices, featuring barcode search and inventory levels.
- **Category**: Mobile App
- **File Formats**: .json, .dart
- **Images**: Mobile app screenshots, UI mockups

#### projects/para-notion-dashboard.html
- **Title**: PARA Notion Dashboard
- **Client**: Personal Project
- **Date**: [Project completion date]
- **Project Link**: [Notion template or demo link]
- **Description**: Built a Notion dashboard for second-brain productivity using the PARA method, integrated with AI organization via n8n.
- **Category**: Productivity System
- **File Formats**: .notion, .json
- **Images**: Dashboard screenshots, workflow diagrams

### 4. Contact Page (contact.html)
- Update contact form with Tom's information
- Add FAQ section
- Include social media links
- Contact message: "Got a project in mind or just want to talk shop? Reach out using the form below and let's build something awesome."

## Technical Implementation Steps

### Phase 1: Content Updates
1. Update all text content in index.html
2. Replace placeholder images with Tom's photos and project images
3. Update navigation menus across all pages
4. Update meta tags and page titles

### Phase 2: Project Pages Creation
1. Create projects/ directory
2. Copy single-portfolio.html template 4 times
3. Customize each project page with specific content
4. Update navigation links to point to new project pages

### Phase 3: Portfolio Grid Updates
1. Update portfolio-masonry.html with new project items
2. Update filtering categories
3. Link portfolio items to individual project pages
4. Replace all portfolio images

### Phase 4: Contact & Social Integration
1. Update contact.html with Tom's information
2. Add social media links throughout site
3. Update FAQ section
4. Test contact form functionality

### Phase 5: Final Polish
1. Update all meta tags and SEO information
2. Test all internal links
3. Verify responsive design on all devices
4. Final content review and proofreading

## Image Requirements

### Homepage Images Needed
- **Hero/Banner Image**: Professional photo of Tom (banner-image.png)
- **Profile Photo**: Headshot for about section (author-image.jpg)
- **Logo**: "Toms in the lab" logo (main-logo.png, light-logo.png)

### Project Images Needed (for each project)
- **Thumbnail**: Square format for portfolio grid (400x400px recommended)
- **Large Images**: Multiple screenshots/photos for individual project pages
- **Hero Image**: Main project showcase image

### Specific Project Images
1. **Gym Workout Logger**: gym-log-app.jpg + additional screenshots
2. **Wiffle Ball Club**: wiffle-club-site.jpg + website screenshots
3. **Spicy App**: spicy-app.jpg + mobile app screenshots
4. **PARA Dashboard**: para-dashboard.jpg + dashboard screenshots

## Content Guidelines

### Writing Style
- Professional but approachable
- Focus on practical applications and problem-solving
- Highlight technical skills without being overly technical
- Emphasize maker/builder identity

### Project Descriptions
- Start with the problem being solved
- Explain the solution and approach
- Highlight key technologies used
- Include links to live demos or repositories when possible
- Show impact or results achieved

### Technical Details
- Include file formats and technologies used
- Mention key features and functionality
- Provide context for technical decisions
- Keep explanations accessible to non-technical audiences

## Future Enhancements

### Phase 2 Additions (Future)
- Add more projects as they're completed
- Implement blog/build log section if desired
- Add testimonials section
- Create detailed services pages when ready
- Add project filtering and search functionality

### Technical Improvements
- Add Google Analytics tracking
- Implement contact form backend
- Add newsletter signup functionality
- Optimize for SEO
- Add social media integration

## Success Metrics
- Professional appearance that reflects maker/tech identity
- Easy navigation to project details
- Clear demonstration of technical capabilities
- Effective contact and social media integration
- Mobile-responsive design
- Fast loading times

## Timeline Estimate
- **Phase 1** (Content Updates): 2-3 hours
- **Phase 2** (Project Pages): 3-4 hours
- **Phase 3** (Portfolio Grid): 1-2 hours
- **Phase 4** (Contact Integration): 1 hour
- **Phase 5** (Final Polish): 1-2 hours

**Total Estimated Time**: 8-12 hours

## Notes
- No CSS/styling changes required - template design is already professional
- Focus on content customization and project showcase
- Maintain template's responsive design and functionality
- All existing JavaScript and interactive features will be preserved
