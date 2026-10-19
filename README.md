# Deepak Yadav — Portfolio

A responsive React portfolio that reads profile content from published Google Sheets tabs. The page includes an introduction, experience, projects, certificates, skills, education, leadership, and contact form.

The interface includes an interactive data-to-model-to-impact workflow, project filters by discipline, scroll-aware navigation, a reading progress indicator, and a saved light/dark theme preference. Motion respects the reduced-motion setting.

## Run locally

```sh
npm install
npm run dev
```

Create an optimized build with `npm run build`; preview it locally with `npm run preview`.

## Portfolio content

The sheet ID and tab IDs are configured in [`src/data.js`](src/data.js). The spreadsheet must be published to the web as CSV. The app loads each tab independently and keeps the rest of the page available if a tab cannot be reached.

The configured tabs are Summary, Social Links, Projects, Certificates, Skills, Education, Work Experience, Details, and Positions of Responsibility.

## Deployment

The Vite build outputs a static site in `dist/`, suitable for GitHub Pages or another static host. Configure the host to serve the built `index.html` and assets.
