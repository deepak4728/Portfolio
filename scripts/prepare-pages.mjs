import { mkdirSync, renameSync, writeFileSync } from "node:fs";

const appDirectory = new URL("../dist/react/", import.meta.url);
const appEntry = new URL("../dist/index.html", import.meta.url);
const redirectEntry = new URL("../dist/index.html", import.meta.url);
const vercelUrl = "https://deepak4728-portfolio.vercel.app/";

mkdirSync(appDirectory, { recursive: true });
renameSync(appEntry, new URL("../dist/react/index.html", import.meta.url));

writeFileSync(redirectEntry, `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="refresh" content="1;url=${vercelUrl}" />
    <link rel="canonical" href="${vercelUrl}" />
    <title>Opening Deepak Yadav’s portfolio…</title>
    <script>
      const destination = new URL(${JSON.stringify(vercelUrl)});
      destination.search = window.location.search;
      destination.hash = window.location.hash;
      window.location.replace(destination.href);
    </script>
  </head>
  <body>
    <p>Opening the portfolio. If you are not redirected, <a href="${vercelUrl}">continue to the Vercel portfolio</a>.</p>
  </body>
</html>
`);

console.log(`GitHub Pages root redirects to ${vercelUrl}`);
