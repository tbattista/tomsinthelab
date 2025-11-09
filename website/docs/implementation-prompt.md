# Website Content Update Implementation Prompt

Use this prompt to implement all the content changes from `docs/homepage-content.md` to the website files.

## Files to Update:

### 1. **index.html** - Main Homepage
### 2. **includes/menu.html** - Navigation Menu

---

## Implementation Instructions:

Please update the website with the following content changes from the `docs/homepage-content.md` file:

### **Site Metadata Updates (index.html):**
- Update page title to: "Tom's in the Lab"
- Update meta description to: "Sales Professional, Maker of all things, Lover of all technology. Showcasing projects in home automation, web development, and maker creations."
- Update meta keywords to: "maker, technology, home automation, DIY projects, portfolio, Tom Battista"

### **Hero Section Updates (index.html):**
- Keep hero tagline as: "Maker of all things. Lover of all technology."
- Keep hero name as: "Tom Battista"

### **Services/Coming Soon Boxes (index.html):**
- **Box 1**: Title: "Project Support", Description: "" (empty)
- **Box 2**: Title: "Technology Consulting", Description: "" (empty)  
- **Box 3**: Title: "Custom Solutions", Description: "Need something unique? Let's design and build it together."
- **Remove Box 4** entirely (the "View All Work" button)

### **About Section - Education (index.html):**
- **Single education item**:
  - Date: "2007 - 20011" (keep the typo as written)
  - Title: "Bachelor's Degree in Engineering - Electronics"
  - Institution: "New England Institute of Technology"

### **About Section - Experience (index.html):**
- **Single experience item**:
  - Date: "2014 - present"
  - Title: "Makers Mad Lab"
  - Description: "Documenting DIY builds and smart home integrations on YouTube. Projects range from woodwork to embedded systems."

### **About Section - Interests (index.html):**
- **Item 1**:
  - Date: "Ongoing"
  - Title: "3D Printing & Electronics"
  - Description: "Designing and prototyping custom enclosures and sensor projects."
- **Item 2**:
  - Date: "Ongoing"
  - Title: "Smart Home Automation"
  - Description: "Creating locally controlled sensor networks using Home Assistant and ESPHome."

### **About Section - References (index.html):**
- **Item 1**:
  - Date: "YouTube"
  - Title: "Makers Mad Lab Subscribers"
  - Description: "500K+ views and 2.7K+ subscribers — real feedback on real projects."
- **Item 2**:
  - Date: "Ongoing"
  - Title: "[Open slot for real client or collaborator name]"
  - Description: "[Add a short quote or attribution if available]"

### **Experience Section (index.html):**
- Subtitle: "introduction"
- Title: "Experienced Creative Mind"
- Description: "From smart home integrations to full-stack web tools, I blend form, function, and fun in every project."

### **Personal Information Table (index.html):**
- **Remove age row entirely**
- Residence: "United States"
- Address: "Rhode Island, USA"
- Email: "tbattista@gmail.com"
- **Remove phone row entirely**

### **Skills Chart (index.html):**
Replace all existing skills with these 6 skills:
1. **ESPHome & Home Assistant**: 85%, css_class: "eighty-five-percent"
2. **Python**: 50%, css_class: "ninety-percent" (note: percentage doesn't match class)
3. **3D Printing**: 90%, css_class: "ninety-percent"
4. **DIY Electronics**: 90%, css_class: "ninety-percent"
5. **Vibe Coding**: 75%, css_class: "seventy-five-percent"
6. **Content Creation (YouTube, Video Editing)**: 70%, css_class: "ninety-percent" (note: percentage doesn't match class)

### **Portfolio Section (index.html):**
- Subtitle: "some of my recent works"
- Title: "Portfolio"
- Description: "Smart devices, web apps, and creative problem-solving. Explore a few builds from the lab."
- Button text: "View All"
- Button link: "portfolio-masonry.html"

### **Contact Section (index.html):**
- Subtitle: "Get In Touch"
- Title: "Contact Me"
- Description: "Have a project idea, a problem to solve, or just want to talk tech? Reach out and let's create something awesome."

### **FAQ Section (index.html):**
- Title: "Frequently Asked Questions"
- **FAQ 1** (expanded: true):
  - Q: "Can you help automate something in my home?"
  - A: "Absolutely! I specialize in smart home automation using ESPHome, Home Assistant, and local-first tech. Custom dashboards, alerts, integrations — all tailored to your needs."
- **FAQ 2** (expanded: false):
  - Q: "Can I hire you for a custom web or app project?"
  - A: "Yes! I build practical, lightweight solutions using Flask, Firebase, and FlutterFlow. I enjoy solving specific workflow problems with custom interfaces."
- **FAQ 3** (expanded: false):
  - Q: "What platforms do you work with?"
  - A: "ESPHome, Home Assistant, Flask, Firebase, FlutterFlow, Arduino, Notion, Python scripts, APIs, and more."
- **FAQ 4** (expanded: false):
  - Q: "Do you sell your creations?"
  - A: "Some projects are available as digital files, tutorials, or physical kits. Reach out with what you're interested in!"
- **FAQ 5** (expanded: false):
  - Q: "Can I learn how to build something like this myself?"
  - A: "Definitely. I'm happy to share what I know and point you toward the right tools. Mentoring or walkthroughs available."

### **Contact Form (index.html):**
- Form title: "Shoot me a note, idea, or challenge."
- Name placeholder: "Your Full Name"
- Email placeholder: "Your Email Address"
- Message placeholder: "Your Message"
- Submit button: "Send Message"

### **Navigation Menu Updates (includes/menu.html):**
- **Projects dropdown** - Replace existing items with:
  - "All Projects" → portfolio-masonry.html
  - "Spicy Inventory App" → projects/spicy-inventory-app.html
  - "Remote Leveling Rig" → projects/remote-tilt-rig.html
  - "Cornhole Board Build" → projects/cornhole-board.html

### **Footer Updates (includes/menu.html):**
- Email: "tbattista@gmail.com"
- Copyright: "© 2025 Tom's in the Lab"
- **Social Links**:
  - Instagram: https://www.instagram.com/toms_inthelab (use #instagram icon)
  - LinkedIn: https://www.linkedin.com/in/thomasbattista (use #facebook icon)
  - YouTube: https://www.youtube.com/@MakersMadLab (use #youtube icon)

---

## Special Notes:

1. **Skills Chart CSS Classes**: Some percentages don't match CSS class names - implement exactly as specified above
2. **Education Date Typo**: Keep "2007 - 20011" as written (appears to be intentional)
3. **Service Boxes**: Only 3 boxes now, remove the 4th "View All Work" button entirely
4. **Personal Info**: Remove age and phone rows from the table
5. **Social Icons**: YouTube replaces GitHub, LinkedIn uses Facebook icon, Instagram uses Instagram icon

## Validation:

After implementation, verify:
- [ ] All text content matches the specifications above
- [ ] Navigation dropdown has the correct 4 project links
- [ ] Personal info table has only 3 rows (residence, address, email)
- [ ] Skills chart shows exactly 6 skills with specified percentages
- [ ] Service section has only 3 boxes
- [ ] Social media links point to correct URLs
- [ ] FAQ section has 5 questions with correct expand states
