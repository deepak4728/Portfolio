# Deepak Yadav — Portfolio

A responsive portfolio for Deepak Yadav, a machine learning and data science engineer. It brings profile, experience, selected projects, certificates, skills, education, community work, and contact details into one page.

## Highlights

- Responsive layout with floating glass navigation and section-aware active states
- Interactive machine learning workflow and project filters
- Accessible project detail dialogs and workflow controls powered by Radix UI
- Scroll progress, section reveals, and motion that respects the reduced-motion preference
- Persistent light and dark themes, using a cool ink-blue and cyan palette with a small lime accent
- Profile content loaded from published Google Sheets tabs
- Contact form connected to Google Forms, with email and LinkedIn alternatives

## Tech stack

- React
- Vite
- Radix UI Dialog and Toggle Group
- CSS

## Run locally

Install dependencies and start the development server:

```sh
npm install
npm run dev
```

Create and preview a production build:

```sh
npm run build
npm run preview
```

Vite writes the static production site to `dist/`.

## Portfolio content

The published spreadsheet ID and tab IDs are configured in [`src/data.js`](src/data.js). The spreadsheet must be published to the web as CSV. The app requests each tab independently and keeps the rest of the page available when a tab cannot be loaded.

Configured tabs: Summary, Social Links, Projects, Certificates, Skills, Education, Work Experience, Details, and Positions of Responsibility.

## Deployment

The Vite build is configured for the repository's GitHub Pages path, `/Portfolio/`. The `Deploy portfolio to GitHub Pages` workflow builds and publishes on pushes to `main`. In the repository's Pages settings, set the publishing source to **GitHub Actions**. The Pages root redirects to the React portfolio on Vercel. The React build remains available at `/Portfolio/react/`, and the restored static version at `/Portfolio/legacy-portfolio/`.

The Vercel build keeps root-relative assets for its deployment domain. The GitHub Pages build uses the repository subpath and preserves any URL query string or hash during the redirect.
