# Website Layout Investigation Prompt

## Current Issues Identified

Based on the screenshot provided, the Tom Battista website has several critical layout problems:

### 1. Missing Banner Title
- The "Tom Battista" main heading (h1.banner-title) is completely invisible
- Should appear prominently in the hero section next to the profile image
- Text animation system may be interfering with visibility

### 2. Education Section Layout Broken
- "Education" heading is severely misaligned and appears to be floating
- Content is not properly contained within its section
- Bootstrap grid system may be broken

### 3. Experience Section Issues
- Content appears to be flowing outside its intended containers
- Text alignment and spacing are incorrect
- Section boundaries are not respected

### 4. "My Current Focus" Section Problems
- Heading positioning is incorrect
- Skills chart/progress bars are misaligned
- Section appears to be overlapping with other content

### 5. General Layout Issues
- Overall spacing between sections is inconsistent
- Content appears to be breaking out of its containers
- Responsive grid system may be compromised

## Investigation Steps Needed

### Step 1: Verify File References
- [ ] Confirm index.html is loading the correct style.css file
- [ ] Check for any missing CSS files or broken links
- [ ] Verify Bootstrap CSS is loading properly

### Step 2: Examine HTML Structure
- [ ] Review the HTML structure for proper Bootstrap grid usage
- [ ] Check for missing or incorrectly nested div containers
- [ ] Verify all sections have proper class assignments

### Step 3: CSS Analysis
- [ ] Check for CSS conflicts between custom styles and Bootstrap
- [ ] Look for any CSS rules that might be breaking the layout
- [ ] Examine text animation CSS that might be hiding content

### Step 4: JavaScript Issues
- [ ] Check if JavaScript is interfering with layout
- [ ] Verify text animation scripts are working correctly
- [ ] Look for any JavaScript errors in console

### Step 5: Bootstrap Grid Issues
- [ ] Verify proper use of container, row, and col classes
- [ ] Check for any CSS that might be overriding Bootstrap grid
- [ ] Ensure responsive breakpoints are working correctly

## Specific Areas to Check

### Banner Title Issue
```html
<h1 class="banner-title display-3 lh-1 txt-fx slide-up d-flex justify-content-between align-items-center">
  <span>Tom&nbsp;Battista</span>
  <!-- SVG icon -->
</h1>
```
- Check if text animation CSS is hiding the text
- Verify the span element is visible
- Look for any CSS that might be setting opacity: 0 or visibility: hidden

### Section Layout Issues
```html
<section id="education" class="my-5 py-5 bg-text">
  <div class="row d-flex flex-wrap">
    <div class="col-lg-6 pb-5">
      <!-- Education content -->
    </div>
    <div class="col-lg-6 pb-5">
      <!-- Experience content -->
    </div>
  </div>
</section>
```
- Verify proper Bootstrap grid structure
- Check for missing container divs
- Look for CSS that might be breaking flexbox

### Skills Chart Issues
- Check if the skills chart CSS is properly defined
- Verify progress bar animations are not interfering with layout
- Look for any positioning issues with the chart container

## Recommended Fixes

### Immediate Actions
1. **Force Banner Title Visibility**: Add emergency CSS to make the title visible
2. **Reset Section Layouts**: Ensure all sections use proper Bootstrap grid
3. **Fix Container Issues**: Verify all content is properly contained
4. **Debug Text Animations**: Temporarily disable animations to see if they're causing issues

### CSS Debugging
```css
/* Emergency visibility fix for banner title */
h1.banner-title, h1.banner-title span {
  opacity: 1 !important;
  visibility: visible !important;
  transform: none !important;
}

/* Debug section layouts */
section {
  border: 1px solid red; /* Temporary - remove after debugging */
}

.row {
  border: 1px solid blue; /* Temporary - remove after debugging */
}

.col-lg-6 {
  border: 1px solid green; /* Temporary - remove after debugging */
}
```

### HTML Structure Verification
- Ensure each section has proper container > row > col structure
- Check for any unclosed divs or missing containers
- Verify all Bootstrap classes are spelled correctly

## Testing Checklist

- [ ] Banner title "Tom Battista" is visible and properly positioned
- [ ] Education section heading is aligned correctly
- [ ] Experience section content flows properly within its container
- [ ] "My Current Focus" section is properly positioned
- [ ] Skills chart displays correctly without overlapping
- [ ] All sections maintain proper spacing and alignment
- [ ] Layout is responsive across different screen sizes
- [ ] No content is breaking out of its intended containers

## Files to Examine
1. `index.html` - Main HTML structure
2. `style.css` - Custom CSS styles
3. `js/script.js` - JavaScript that might affect layout
4. `includes/menu.html` - Menu structure that might affect main content
5. Bootstrap CSS - Verify it's loading correctly

This investigation should help identify the root cause of the layout issues and provide a clear path to fixing them.
