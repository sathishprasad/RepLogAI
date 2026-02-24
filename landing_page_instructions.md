## 1. Project Summary

We are building a high-converting marketing landing page for **FieldNote AI**, a voice-powered CRM assistant for sales reps. The core value proposition is that reps can speak a short post-meeting update, and the system automatically transcribes, structures, and pushes clean data into the CRM — updating stages, creating tasks, and generating summaries without manual typing.

Visually, success looks like a premium, AI-forward SaaS website with a dark hero section, subtle glow effects, modern gradients, clean typography, and structured content sections below. The aesthetic should feel intelligent, efficient, and minimal — similar to a modern AI SaaS platform.

---

## 2. Design System

### Color Palette

* Primary (Electric Blue): `#4F7CFF`
* Primary Hover: `#3B66E0`
* Accent (Soft Purple Glow): `#8B9CFF`
* Background Dark (Hero): `#0B0F17`
* Background Light: `#F6F7FB`
* Surface (Cards): `#FFFFFF`
* Muted Surface: `#F1F3F9`
* Text Primary: `#0F172A`
* Text Light: `#E5E7EB`
* Muted Text: `#6B7280`
* Border: `#E5E7EB`

### Typography

Font: **Plus Jakarta Sans** (fallback: Inter, sans-serif)

* H1: 48px / 56px line height / 700 weight
* H2: 36px / 44px / 600 weight
* H3: 24px / 32px / 600 weight
* Body Large: 18px / 28px / 400 weight
* Body: 16px / 24px / 400 weight
* Caption: 14px / 20px / 500 weight

Use tight letter spacing for headings (-0.5px). Clean and modern.

### Spacing and Layout Rules

* Max width: 1200px
* Section vertical padding: 96px desktop, 64px tablet, 48px mobile
* Container horizontal padding: 24px mobile, 32px tablet, 40px desktop
* Grid: 12-column layout on desktop, 1 column mobile, 2 column tablet
* Gap between major columns: 48px desktop, 32px tablet
* Cards internal padding: 24px to 32px

Breakpoints:

* Mobile: < 768px
* Tablet: 768px – 1024px
* Desktop: 1024px+

### Borders and Radius

* Standard radius: 12px
* Large radius (hero cards, pricing highlight): 16px
* Buttons: 9999px (pill style)
* Border: 1px solid `#E5E7EB`
* Dark section subtle borders: 1px solid rgba(255,255,255,0.08)

### Shadows and Effects

* Soft card shadow: `0 10px 30px rgba(15, 23, 42, 0.08)`
* Hero glow effect: radial gradient background with subtle blue glow
* Hover on cards: translateY(-4px) + stronger shadow
* Button hover: darken primary + subtle scale (1.02)

Keep effects subtle and premium.

---

## 3. Page Structure

### 1. Navbar (Dark Background)

* Left: FieldNote AI logo (simple wordmark + minimal icon)
* Center: Links (Product, How It Works, Integrations, Pricing)
* Right: “Log in” (ghost button) + “Start Free” (primary button)
* Sticky with slight blur background on scroll

---

### 2. Hero Section (Dark, AI-Focused)

Layout:

* Centered content
* Large H1 headline:
  “Turn 60 Seconds of Voice Into Clean CRM Data”
* Subheading explaining speaking updates and automatic CRM sync
* Primary CTA: “Start Free”
* Secondary CTA: “See How It Works”

Below headline:

* Large visual mockup:

  * Center floating card with microphone icon
  * Surrounding subtle animated nodes representing CRM, tasks, notes
  * Radial blue glow background

---

### 3. Social Proof

Light background section.

* Text: “Trusted by modern sales teams”
* Row of grayscale logo placeholders (use realistic SaaS-style brand names, not fake lorem)
* Center aligned

---

### 4. Problem + Solution Section

Two-column layout.

Left:

* Mock CRM card UI showing:

  * “Meeting with Dr. Smith”
  * Structured fields auto-filled
  * Opportunity stage updated
  * Follow-up task created

Right:

* H2: “Eliminate CRM Admin. Improve Data Quality.”
* 3 bullet points with icons:

  * Speak your update in seconds
  * Automatic transcription + structured extraction
  * CRM updates, tasks, and summaries instantly created

---

### 5. How It Works (Dark Section)

Three cards in a row (stack on mobile).

1. Capture

   * Voice note example
2. Structure

   * AI extracts key fields (contact, deal stage, objections, next step)
3. Sync

   * CRM updated automatically

Each card:

* Icon at top
* Title
* Short description
* Subtle glow background

---

### 6. Benefits Section

Light background.

Two-column layout.

Left:

* 3 benefit blocks with icons:

  * Save 5+ hours per week
  * Never miss follow-ups
  * Accurate pipeline visibility

Right:

* Floating analytics dashboard mockup card

  * Clean charts
  * “Forecast Accuracy +18%”
  * “Follow-up completion 92%”

---

### 7. Integrations Section

Grid of recognizable integration logos:

* Salesforce
* HubSpot
* Pipedrive
* Slack
* Gmail
* Notion

Headline:
“One Assistant. Every CRM.”

CTA button below grid: “View Integrations”

---

### 8. Pricing Section

Three pricing cards:

* Starter – $29/month
* Pro – $79/month (Highlighted)
* Enterprise – Custom

Each card includes:

* Feature list
* Voice minutes included
* CRM integrations
* Team support

Highlight Pro with:

* Slightly larger scale
* Primary border
* “Most Popular” badge

---

### 9. Final CTA (Dark Section)

Centered content.

Headline:
“Start Updating Your CRM by Voice Today”

Subtext:
“No typing. No admin work. Just sell.”

Primary CTA: “Start Free”
Secondary CTA: “Book a Demo”

---

### 10. Footer

4-column layout:

* Company
* Product
* Resources
* Legal

Minimal, clean, light background.

---

## 4. Component Specs (shadcn/ui)

Use:

* Button (default, secondary, outline, ghost)
* Card
* Badge (for “Most Popular”)
* Tabs (if needed for pricing monthly/annual toggle)
* Input (email capture if added)
* Separator
* Avatar (if testimonials added)
* Dialog (for demo modal)
* Accordion (for FAQ if included)

Button variants:

* Primary: bg-primary text-white rounded-full px-6 py-3
* Outline: border-primary text-primary
* Ghost: text-muted-foreground

Cards:

* Rounded-xl
* Shadow-sm default
* Hover shadow-lg + -translate-y-1

Ensure consistency in radius and padding across all cards.

---

## 5. Interactions and Motion

* Smooth scroll
* Fade-up animation on section entry (subtle, 200–300ms)
* Hover scale on buttons (1.02)
* Card hover elevation
* No heavy animation
* Subtle glowing pulse around hero microphone icon

Premium and restrained.

---

## 6. Images and Icons

* Use relevant Unsplash images (sales meeting, sales rep with phone, analytics dashboard setups).
* CRM mockups should be clean UI-style components, not generic photos.
* Use Lucide icons (Mic, Database, CheckCircle, BarChart3, Zap, Shield, Calendar, Link).
* Use realistic avatar images if testimonials are added.

Use relevant Unsplash images instead of image placeholders.

---

## 7. Implementation Notes

* Mobile-first layout.
* Stack all columns on mobile.
* Maintain strong contrast in dark sections.
* Visible focus states for accessibility.
* Buttons must be keyboard navigable.
* Use semantic HTML structure.
* Do not leave empty placeholders. Use real dummy content that matches the sales CRM niche.
* Keep layout faithful to the described structure. Do not redesign or simplify sections.

Use relevant Unsplash images instead of image placeholders.
