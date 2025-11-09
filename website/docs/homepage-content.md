# Homepage Content Configuration

This file contains all the editable content for the homepage (index.html). Update the values here and I can apply them to the website.

## Site Metadata
```yaml
site_title: "Tom's in the Lab"
site_author: "Tom Battista"
site_description: "Sales Professional, Maker of all things, Lover of all technology. Showcasing projects in home automation, web development, and maker creations."
site_keywords: "maker, technology, home automation, DIY projects, portfolio, Tom Battista"
```

## Hero Section
```yaml
hero_tagline: "Maker of all things. Lover of all technology."
hero_name: "Tom Battista"
hero_image: "images/branding/banner-image.png"
hero_image_alt: "banner"
```


## Services/Coming Soon Boxes
```yaml
service_box_1:
  number: "01"
  title: "Project Support"
  description: ""

service_box_2:
  number: "02"
  title: "Technology Consulting"
  description: ""

service_box_3:
  number: "03"
  title: "Custom Solutions"
  description: "Need something unique? Let's design and build it together."
```

## About Section - Education
```yaml
about_section_title: "BIODATA"
education_title: "Education"

education_items:
  - date_range: "2007 - 20011"
    title: "Bachelor’s Degree in Engineering - Electronics"
    institution: "New England Institute of Technology"
```
## About Section - Experience
```yaml
experience_title: "Experiences"

experience_items:
  - date_range: "2014 - present"
    title: "Makers Mad Lab"
    description: "Documenting DIY builds and smart home integrations on YouTube. Projects range from woodwork to embedded systems."

```

## About Section - Interests
```yaml
interests_title: "Interests"

interests_items:
  - date_range: "Ongoing"
    title: "3D Printing & Electronics"
    description: "Designing and prototyping custom enclosures and sensor projects."

  - date_range: "Ongoing"
    title: "Smart Home Automation"
    description: "Creating locally controlled sensor networks using Home Assistant and ESPHome."
```

## About Section - References
```yaml
references_title: "References"

references_items:
  - date_range: "YouTube"
    title: "Makers Mad Lab Subscribers"
    description: "500K+ views and 2.7K+ subscribers — real feedback on real projects."

  - date_range: "Ongoing"
    title: "[Open slot for real client or collaborator name]"
    description: "[Add a short quote or attribution if available]"
```

## Experience Section
```yaml
experience_section:
  subtitle: "introduction"
  title: "Experienced Creative Mind"
  description: "From smart home integrations to full-stack web tools, I blend form, function, and fun in every project."
```

## Personal Information Table
```yaml
personal_info:
  residence: "United States"
  address: "Rhode Island, USA"
  email: "tbattista@gmail.com"
  phone: ""
```

## Skills Chart
```yaml
skills:
  - name: "ESPHome & Home Assistant"
    percentage: "85%"
    css_class: "eighty-five-percent"

  - name: "Python"
    percentage: "50%"
    css_class: "ninety-percent"

  - name: "3D Printing"
    percentage: "90%"
    css_class: "ninety-percent"

  - name: "DIY Electronics"
    percentage: "90%"
    css_class: "ninety-percent"

  - name: "Vibe Coding"
    percentage: "75%"
    css_class: "seventy-five-percent"

  - name: "Content Creation (YouTube, Video Editing)"
    percentage: "70%"
    css_class: "ninety-percent"
```

## Portfolio Section
```yaml
portfolio_section:
  subtitle: "some of my recent works"
  title: "Portfolio"
  description: "Smart devices, web apps, and creative problem-solving. Explore a few builds from the lab."
  view_all_button_text: "View All"
  view_all_button_link: "portfolio-masonry.html"
```

## Contact Section
```yaml
contact_section:
  subtitle: "Get In Touch"
  title: "Contact Me"
  description: "Have a project idea, a problem to solve, or just want to talk tech? Reach out and let’s create something awesome."
```

## FAQ Section
```yaml
faq_title: "Frequently Asked Questions"

faqs:
  - question: "Can you help automate something in my home?"
    answer: "Absolutely! I specialize in smart home automation using ESPHome, Home Assistant, and local-first tech. Custom dashboards, alerts, integrations — all tailored to your needs."
    expanded: true

  - question: "Can I hire you for a custom web or app project?"
    answer: "Yes! I build practical, lightweight solutions using Flask, Firebase, and FlutterFlow. I enjoy solving specific workflow problems with custom interfaces."
    expanded: false

  - question: "What platforms do you work with?"
    answer: "ESPHome, Home Assistant, Flask, Firebase, FlutterFlow, Arduino, Notion, Python scripts, APIs, and more."
    expanded: false

  - question: "Do you sell your creations?"
    answer: "Some projects are available as digital files, tutorials, or physical kits. Reach out with what you're interested in!"
    expanded: false

  - question: "Can I learn how to build something like this myself?"
    answer: "Definitely. I’m happy to share what I know and point you toward the right tools. Mentoring or walkthroughs available."
    expanded: false
```

## Contact Form
```yaml
contact_form:
  title: "Shoot me a note, idea, or challenge."
  name_placeholder: "Your Full Name"
  email_placeholder: "Your Email Address"
  message_placeholder: "Your Message"
  submit_button_text: "Send Message"
```

## Navigation Menu (from includes/menu.html)
```yaml
site_logo: "images/branding/main-logo.png"
site_logo_alt: "logo"

navigation_items:
  - text: "Home"
    link: "index.html#home"

  - text: "About"
    link: "index.html#about"

  - text: "Experience"
    link: "index.html#experience"

  - text: "Projects"
    type: "dropdown"
    items:
      - text: "All Projects"
        link: "portfolio-masonry.html"
      - text: "Spicy Inventory App"
        link: "projects/spicy-inventory-app.html"
      - text: "Remote Leveling Rig"
        link: "projects/remote-tilt-rig.html"
      - text: "Cornhole Board Build"
        link: "projects/cornhole-board.html"

  - text: "Contact"
    link: "index.html#contact"
```

## Footer/Contact Information
```yaml
footer_email: "tbattista@gmail.com"
footer_copyright: "© 2025 Tom's in the Lab"

social_links:
  - platform: "Instagram"
    url: "https://www.instagram.com/toms_inthelab"
    icon: "#instagram"

  - platform: "LinkedIn"
    url: "https://www.linkedin.com/in/thomasbattista"
    icon: "#facebook"

  - platform: "YouTube"
    url: "https://www.youtube.com/@MakersMadLab"
    icon: "#youtube"
```