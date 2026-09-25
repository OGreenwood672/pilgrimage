# Website Content & Data Guide for Editors

This folder (`data/`) contains all the text and numbers displayed on the website. You do not need to touch any code files to update website text, photos, charity information, or fundraising numbers.

---

## Files Overview

| File | What it controls |
| :--- | :--- |
| **`site-content.json`** | All main website text: headline titles, story paragraphs, quotes, button labels, stats, badges, and footer. |
| **`fundraising.json`** | Live money raised amount, target goal, donor count, and currency. |
| **`charities.json`** | Charity names, categories, descriptions, personal story blurbs, website links, and logos. |
| **`journey-segments.json`** | Each stage along the route map (title, town/location, distance, elevation, coordinates, and stage description). |

---

## Quick Rules for Editing JSON Files

JSON is very simple, but follows a few formatting rules:

1. **Always wrap text in double quotes**:
   ```json
   "badge": "The 2,000 km Via Francigena Expedition"
   ```
2. **Numbers do not need quotes**:
   ```json
   "amountRaised": 15000,
   "targetAmount": 25000
   ```
3. **Commas between items**:
   Every item in a list or block must end with a comma `,` **except the last one** in that block.
4. **Quotes inside quotes**:
   If you want quotation marks inside your text, use curly quotes `“like this”` or put a backslash before it `\"like this\"`.

---

## How to Update Specific Content

### 1. Changing the Hero Headline & Story
Open `data/site-content.json` and look under `"hero"`:
- `"paragraphs"`: Each item in the square brackets `[ ... ]` is a paragraph of the story. Any handle like `@home2rome2028` automatically links to your Instagram URL!
- `"instagramUrl"`: The link to your Instagram profile (e.g. `https://www.instagram.com/home2rome2028?stkn=...`).
- `"stats"`: The 4 statistics displayed below the photo (distance, steps, countries, elevation).

### 2. Updating Fundraising Progress
Open `data/fundraising.json`:
```json
{
  "currencySymbol": "£",
  "amountRaised": 14850,
  "targetAmount": 25000,
  "donorCount": 342,
  "lastUpdated": "Recently updated"
}
```
Change `amountRaised` or `donorCount`. The progress bar and percentage on the website will update automatically!

### 3. Adding or Editing a Charity
Open `data/charities.json`:
Each charity has:
- `"name"`: Organization name
- `"category"`: Subtitle/tag (e.g. "Emergency & Trauma Medicine")
- `"description"`: Summary of what the charity does
- `"brynStory"`: Why Bryn personally supports them
- `"website"`: Link to their donation page

### 4. Editing Journey Route Stops
Open `data/journey-segments.json`:
Each stop has:
- `"title"`: Headline for the stage
- `"location"`: Town / region name
- `"distance"`: Cumulative distance
- `"text"`: The story for that stage of the walk

