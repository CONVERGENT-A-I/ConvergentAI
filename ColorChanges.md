# ConvergentAI.tech website color direction

This document outlines the color direction and style specifications for ConvergentAI.tech.

## General Color Rule
* **Navy/Dark Navy**: Structure & backgrounds
* **White/Gray-Blue**: Readability & text
* **Electric Blue**: Primary actions & CTAs
* **Teal**: Hover, focus, active, and live states
* **Violet**: AI & intelligence accents
* **Periwinkle**: Secondary support & secondary buttons

---

## 1. Page Backgrounds
* **Primary Background (`--bg-primary`)**: `#020817` (used for the main site background)
* **Secondary Background (`--bg-secondary`)**: `#061234` (used for large section backgrounds)
* **Elevated Background (`--bg-elevated`)**: `#0A1B3D` (used for elevated panels, dropdowns, and modals)
* **Card Background (`--bg-card`)**: `#0B1F45` (used for cards and inner panels)

*Note: Use dark navy instead of pure black.*

---

## 2. Text Colors
* **Primary Text (`--text-primary`)**: `#F8FAFC` (near-white for headlines and key copy)
* **Secondary Text (`--text-secondary`)**: `#CBD5E1` (soft blue-gray for body copy)
* **Muted Text (`--text-muted`)**: `#94A3B8` (labels, metadata, and captions)
* **Disabled Text (`--text-disabled`)**: `#64748B` (inactive controls)

*Note: Periwinkle is too low-contrast for body copy; do not use it there.*

---

## 3. Logo Usage
* **Default Theme**: White or light navy-reversed logo on dark backgrounds
* **AI Accent**: Keep "AI" in Electric Blue (`#2435F3`) if the logo version supports it
* **Hierarchy**: Use the full-color logo sparingly; the monochrome/reversed version is preferred on dark UI for a mature presentation.
* **Logo Colors**:
  * Main Logo (`--logo-main`): `#FFFFFF`
  * AI Accent Logo (`--logo-ai-accent`): `#2435F3`

---

## 4. Primary Buttons
Use Electric Blue for the main CTA.
* **Background (`--button-primary-bg`)**: `#2435F3` (Electric Blue)
* **Text (`--button-primary-text`)**: `#FFFFFF` (White)
* **Hover (`--button-primary-hover`)**: `#22C5CC` (Teal)
* **Active/Pressed (`--button-primary-active`)**: `#5F43D9` (Violet)

---

## 5. Secondary Buttons
Use transparent or dark-card buttons with a blue border.
* **Background (`--button-secondary-bg`)**: `transparent`
* **Border (`--button-secondary-border`)**: `#8C95F1` (Periwinkle)
* **Text (`--button-secondary-text`)**: `#F8FAFC` (Near-white)
* **Hover Background (`--button-secondary-hover-bg`)**: `rgba(36, 53, 243, 0.16)` (Electric Blue at 16% opacity)
* **Hover Border (`--button-secondary-hover-border`)**: `#22C5CC` (Teal)

*Usage: Use secondary buttons for "Learn more", "View demo", "Compare features", and "Contact sales" (when it is not the primary CTA).*

---

## 6. Links
* **Default Link (`--link-default`)**: `#8C95F1` (Periwinkle)
* **Hover Link (`--link-hover`)**: `#22C5CC` (Teal)
* **Active Link (`--link-active`)**: `#5F43D9` (Violet)

*Note: This prevents the page from becoming too electric-blue heavy.*

---

## 7. Hover States
Use teal hover/focus accents to keep interactive elements consistent and responsive.
* **Hover Accent (`--hover-accent`)**: `#22C5CC`
* **Hover Background (`--hover-bg`)**: `rgba(34, 197, 204, 0.12)`
* **Focus Ring (`--focus-ring`)**: `rgba(34, 197, 204, 0.45)`

*Usage: Primary nav hover, button hover, interactive cards, form focus glow, icon hover, and "live", "active", or "connected" states.*

---

## 8. Navigation
* **Background (`--nav-bg`)**: `#020817`
* **Link Default (`--nav-link`)**: `#CBD5E1` (soft gray-blue)
* **Link Hover (`--nav-link-hover`)**: `#22C5CC` (Teal)
* **Link Active (`--nav-link-active`)**: `#FFFFFF` (White)
* **Active Underline (`--nav-active-underline`)**: `#2435F3` (Electric Blue)

*Behavior: Avoid using violet for nav hover; teal will feel cleaner and more responsive.*

---

## 9. Cards and Panels
* **Background (`--card-bg`)**: `#0B1F45`
* **Border (`--card-border`)**: `rgba(140, 149, 241, 0.18)` (Periwinkle-tinted)
* **Hover Border (`--card-hover-border`)**: `rgba(34, 197, 204, 0.45)` (Teal-tinted)
* **Hover Background (`--card-hover-bg`)**: `#0D2654`

*Usage: Navy card backgrounds, periwinkle-tinted borders, teal border on hover, and Electric Blue or Violet for small icons inside cards.*

---

## 10. Forms
* **Input Background (`--input-bg`)**: `#061234`
* **Input Border (`--input-border`)**: `rgba(140, 149, 241, 0.35)`
* **Input Text (`--input-text`)**: `#F8FAFC`
* **Input Placeholder (`--input-placeholder`)**: `#94A3B8`
* **Focus Border (`--input-focus-border`)**: `#22C5CC` (Teal)
* **Focus Ring (`--input-focus-ring`)**: `rgba(34, 197, 204, 0.25)`
* **Error (`--input-error`)**: `#EF4444` (standard red)
* **Success (`--input-success`)**: `#22C5CC` (Teal)

*Usage: Use teal for focus and success states. Use standard red for errors rather than trying to force an error color from the brand palette.*

---

## 11. Icons
* **Primary Icon (`--icon-primary`)**: `#F8FAFC` (Main UI icons)
* **Secondary Icon (`--icon-secondary`)**: `#8C95F1` (Periwinkle)
* **Accent Icon (`--icon-accent`)**: `#2435F3` (Electric Blue for feature icons)
* **Hover Icon (`--icon-hover`)**: `#22C5CC` (Teal)

*Note: For AI-related icons, use Violet (`#5F43D9`) or a blue-to-violet gradient.*

---

## 12. Gradients
Gradients should support the brand, not dominate it.
* **AI Gradient (`--gradient-ai`)**: `linear-gradient(90deg, #2435F3 0%, #5F43D9 55%, #22C5CC 100%)`

*Usage: Hero accent line, small AI indicator, data-flow graphic, subtle background glow, and "AI" feature labels. Avoid using gradients for long text or large content blocks.*

---

## Suggested CSS Variables (Tailwind / Custom CSS configuration)

```css
:root {
  /* Brand Colors */
  --brand-navy: #001A5B;
  --brand-blue: #2435F3;
  --brand-violet: #5F43D9;
  --brand-periwinkle: #8C95F1;
  --brand-teal: #22C5CC;

  /* Dark Theme Backgrounds */
  --bg-primary: #020817;
  --bg-secondary: #061234;
  --bg-elevated: #0A1B3D;
  --bg-card: #0B1F45;

  /* Text Colors */
  --text-primary: #F8FAFC;
  --text-secondary: #CBD5E1;
  --text-muted: #94A3B8;
  --text-disabled: #64748B;

  /* Actions & Buttons */
  --button-primary-bg: var(--brand-blue);
  --button-primary-hover: var(--brand-teal);
  --button-primary-active: var(--brand-violet);

  /* Links */
  --link-default: var(--brand-periwinkle);
  --link-hover: var(--brand-teal);
  --link-active: var(--brand-violet);

  /* Borders & Focus Rings */
  --border-subtle: rgba(140, 149, 241, 0.18);
  --border-strong: rgba(140, 149, 241, 0.35);
  --focus-ring: rgba(34, 197, 204, 0.45);

  /* Gradients */
  --gradient-ai: linear-gradient(90deg, #2435F3 0%, #5F43D9 55%, #22C5CC 100%);
}
```
