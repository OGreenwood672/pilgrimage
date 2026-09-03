# Bryn Jones: Walking from South Heath to Rome

A responsive, single-page website detailing **Bryn Jones's 2,050 km charity walk from South Heath (Buckinghamshire, UK) to Rome (Italy)** along the historic Via Francigena.

Featuring:

- **Hero & Story Section**: Introduces Bryn, his personal story, and key expedition milestones.
- **Charities Section**: Interactive cards showcasing supported charities with logos, descriptions, and direct website links.
- **Scroll-Driven Map Experience**: A full-width interactive map where the walking route animates dynamically along the trail as the user scrolls, with synchronized story cards that fade in and out.
- **100% Free / No API Key Required**: Built with Leaflet and OpenStreetMap tiles — zero credit card requirements, tokens, or subscription traps.

---

## Getting Started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Customization Guide

### 1. Where to Replace Bryn's Photo

1. Place your photo of Bryn in the `public/images/` directory (e.g. `bryn-jones.jpg` or `bryn-jones.png`).
2. Open `app/components/HeroSection.tsx`.
3. Locate the `<Image>` component around line 74:
   ```tsx
   <Image
     src="/images/bryn-jones.svg" // <-- Change to "/images/bryn-jones.jpg"
     alt="Bryn Jones - Walking from South Heath to Rome"
     fill
     priority
     className="object-cover transition-transform duration-700 group-hover:scale-105"
   />
   ```

---

### 2. Where to Add Real Charity Data

Charities are data-driven and stored in **`data/charities.json`**.

```json
[
  {
    "id": "charity-1",
    "name": "Hope Hospice & Palliative Care",
    "category": "End of Life & Patient Care",
    "logo": "/images/charities/charity-1.svg",
    "description": "Provides specialist compassionate care...",
    "brynStory": "Supported Bryn's family through their most challenging season...",
    "website": "https://www.hospicecare.org.uk",
    "accentColor": "#2563eb"
  }
]
```

- **Logos**: Place official charity logos into `public/images/charities/`.
- **Links**: Update the `website` URL. Links automatically open in a new tab with `target="_blank"` and `rel="noopener noreferrer"`.
- You can add or remove charities by simply editing the array in `data/charities.json`.

---

### 3. How to Update the Live Money Raised Display

Fundraising statistics are managed in **`data/fundraising.json`** (mirrored in `public/data/fundraising.json`):

```json
{
  "currencySymbol": "£",
  "amountRaised": 14850,
  "targetAmount": 25000,
  "donorCount": 342
}
```

Updating `amountRaised` or `targetAmount` automatically updates:

- The prominent money counter in the Hero section
- The progress bar and percentage calculation
- The fundraising display on the dedicated `/charities` page

---

### 3. How to Plug in the Real Journey JSON

Journey stops are loaded from **`data/journey-segments.json`** (and mirrored in `public/data/journey-segments.json`).

The structure matches your exact specification:

```json
[
  {
    "id": "segment-1",
    "lat": 51.7105,
    "lng": -0.6865,
    "title": "Leaving South Heath: The First Step",
    "text": "From the quiet country lanes of South Heath...",
    "image": "/images/segments/segment-1.svg",
    "location": "South Heath, Buckinghamshire, UK",
    "distance": "0 km / 0 mi",
    "elevation": "170m"
  }
]
```

- **Coordinates**: Set `lat` and `lng` to decimal coordinates for each stop.
- **Images**: Add segment photos to `public/images/segments/` (supports `.jpg`, `.png`, `.webp`, `.svg`).
- **Text**: Enter title and journal story paragraph for each milestone.

---

### 4. How to Adjust Map Styling or Route

- **Map Tiles (No API Key)**:
  In `app/components/JourneyMapInner.tsx`, the base layer uses OpenStreetMap:
  ```ts
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 18,
  }).addTo(map);
  ```
- **Route Line Colors**:
  - The drawn active trail color can be customized in `JourneyMapInner.tsx`:
    ```ts
    const activePolyline = L.polyline([], {
      color: "#ea580c", // <-- change trail hex color
      weight: 5, // <-- stroke thickness
      opacity: 0.95,
    });
    ```
- **GPS Coordinates**:
  To add more intermediate GPS points or adjust the path curve, edit `data/route-coordinates.ts`.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Styling**: Tailwind CSS + Lucide Icons
- **Interactive Map**: Leaflet (optimized for 60fps scroll animation, zero API keys required)
- **Data**: Pure JSON files for simple plug-and-play maintenance
