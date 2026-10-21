/*
  Replace SHEET_ID with your Google Sheet id.
  Create separate sheets/tabs named: summary, projects, certs, tech
  Publish the sheet (File → Share → Publish to web) and use:
  https://docs.google.com/spreadsheets/d/SHEET_ID/export?format=csv&gid=GID
*/
// Extract only the Sheet ID from the URL
const SHEET_ID = "e/2PACX-1vQLeY6fIQXDqb54z4MEodLxEslW2_Bu5N_xfNVpmP8J9ie5IDjCo-eNyonx3TxMB6x1cn9QX02_ToKR";
const endpoints = {
  summary: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/pub?gid=0&output=csv`,
  socialLinks: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/pub?gid=546184029&output=csv`,
  projects: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/pub?gid=2043840442&output=csv`,
  certificates: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/pub?gid=682957323&output=csv`,
  skills: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/pub?gid=405041665&output=csv`,
  education: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/pub?gid=1434705904&output=csv`,
  workExperience: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/pub?gid=1922006196&output=csv`,
  details: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/pub?gid=851669658&single=true&output=csv`,
  positionsOfResponsibility: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/pub?gid=1487468481&output=csv`
};

let loadingComplete = false;
let dataLoaded = false;

// Loading screen manager
function initLoader() {
  const loader = document.getElementById('loadingScreen');
  const minLoadTime = 3000; // Minimum 3 seconds for animation
  const startTime = Date.now();

  function hideLoader() {
    const elapsed = Date.now() - startTime;
    const remainingTime = Math.max(0, minLoadTime - elapsed);
    
    setTimeout(() => {
      if (loader) {
        loader.classList.add('hidden');
        setTimeout(() => {
          loader.style.display = 'none';
        }, 500);
      }
    }, remainingTime);
  }

  // Listen for data load completion and hide loader
  window.addEventListener('dataLoaded', () => {
    hideLoader();
  });
}

function escapeHtml(s){ 
  return (s||"").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); 
}

function escapeAttr(s){ 
  return encodeURI(s||""); 
}

// Handle newlines: convert \n to <br> and preserve line breaks
function formatText(text) {
  if (!text) return '';
  // Escape HTML first
  const escaped = escapeHtml(text);
  // Convert \n, \r\n, and actual newlines to <br>
  return escaped.replace(/\\n|\\r\\n|\r\n|\n/g, '<br>');
}

async function fetchCSV(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Network error");
  const text = await res.text();
  return csvToObjects(text);
}

function csvToObjects(csv) {
  // Split by newline but handle quoted fields properly
  const rows = [];
  let currentRow = [];
  let currentField = "";
  let inQuotes = false;

  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    const nextChar = csv[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      currentRow.push(currentField.trim());
      currentField = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (currentField || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        if (currentRow.some(f => f)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = "";
      }
      if (char === "\r" && nextChar === "\n") i++;
    } else {
      currentField += char;
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(f => f)) {
      rows.push(currentRow);
    }
  }

  if (rows.length < 2) return [];
  
  const headers = rows[0].map(h => h.replace(/^"|"$/g, ""));
  return rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = (row[i] || "").replace(/^"|"$/g, "");
    });
    return obj;
  });
}

function asHTML(val = "") {
  const v = String(val).trim();
  return v.includes("<") ? v : escapeHtml(v);
}

// Summary Section
function renderSummary(rows) {
  const el = document.getElementById("summary");
  if (!el || !rows.length) return;
  el.innerHTML = asHTML(rows[0].summary || rows[0].about || "");
}

// Social Links Section
function renderSocialLinks(rows) {
  const container = document.getElementById("socialLink");
  if (!container) return;
  container.innerHTML = `<div class="social-links">` + rows.map(r => {
    const name = r.name || r.platform || "";
    const link = r.link || r.url || "";
    const icon = r.icon || r.image || "";
    return `
      <a href="${escapeAttr(link)}" target="_blank" rel="noopener" class="social-item" title="${escapeAttr(name)}">
        <img src="${escapeAttr(icon)}" alt="${escapeAttr(name)}" class="social-icon">
      </a>`;
  }).join("") + `</div>`;
}

// Projects Section
function renderProjects(rows) {
  const container = document.getElementById("projects");
  if (!container) return;

  const cards = rows.map(r => {
    const title = r.title || r.name || "";
    const desc = r.description || r.desc || "";
    const link = r.link || r.demo || r.github || "#";
    const img = r.image || "https://via.placeholder.com/640x360?text=Project";

    return `
      <div class="card project-card">
        <div class="project-media">
          <img src="${img}" alt="${escapeAttr(title)}" loading="lazy">
        </div>
        <div class="project-header">
          <h3>${asHTML(title)}</h3>
          ${link && link !== "#" ? `<a rel="noopener" target="_blank" href="${escapeAttr(link)}" class="btn project-link">View</a>` : ""}
        </div>
        <div class="project-desc">${asHTML(desc)}</div>
      </div>
    `;
  }).join("");

  container.innerHTML = `
    <div class="projects-grid">
      ${cards}
    </div>
  `;
}

// (Optional) keep initProjectsMarquee unused or remove its calls elsewhere
// Certificates Section
function renderCertificates(rows) {
  const container = document.getElementById("certificates");
  if (!container) return;
  container.innerHTML = rows.map(r => {
    const name = r.name || r.title || "";
    const issuer = r.issuer || r.provider || "";
    const link = r.link || "";
    const img = r.image;
    return `
      <div class="card cert-card">
        <img src="${escapeAttr(img)}" alt="${escapeAttr(name)}" class="cert-img" loading="lazy">
        <div class="cert-body">
          <strong>${escapeHtml(name)}</strong>
          ${issuer ? `<p class="issuer">${escapeHtml(issuer)}</p>` : ""}
          ${link ? `<a target="_blank" rel="noopener" href="${escapeAttr(link)}" class="cert-link">View →</a>` : ""}
        </div>
      </div>`;
  }).join("");
}

// Skills Section with Flip Card
function renderSkills(rows) {
  const container = document.getElementById("skills");
  if (!container) return;

  const renderItem = (r) => {
    const skill = r.Skill || r.tech || r.name || "Skill";
    const img = r.link || r.image || "";
    
    let frontHTML = '';
    if (img) {
      frontHTML = `<img src="${escapeAttr(img)}" alt="${escapeAttr(skill)}" loading="lazy" style="width:70%; height:70%; object-fit:contain;">`;
    } else {
      frontHTML = `<div style="font-weight:600; color:#333;">${escapeHtml(skill)}</div>`;
    }

    return `
      <div class="tech-card">
        <div class="tech-inner">
          <div class="tech-face tech-front">
            ${frontHTML}
          </div>
          <div class="tech-face tech-back">
            <div style="font-weight:700; color:#fff; font-size:0.95rem; text-align:center; padding:8px; word-wrap:break-word;">
              ${escapeHtml(skill)}
            </div>
          </div>
        </div>
      </div>`;
  };

  container.innerHTML = rows.map(renderItem).join("");
}

// Education Section
function renderEducation(rows) {
  const container = document.getElementById("education");
  if (!container) return;

  const logos = {
    jnv: "static/education/jnv.png",
    mbm: "static/education/mbm.gif",
  };

  const getLogo = (institution = "") => {
    const inst = institution.toLowerCase();
    if (inst.includes("jnv") || inst.includes("jawahar") || inst.includes("navodaya")) return logos.jnv;
    if (inst.includes("mbm")) return logos.mbm;
    return null;
  };

  container.innerHTML = rows.map(r => {
    const degree = r.degree || r.qualification || "";
    const institution = r.institution || r.college || r.school || "";
    const specialization = r.specialization || r.branch || r.stream || "";
    const location = r.location || "";
    const grade = r.grade || r.percentage || r.cgpa || "";
    const duration = r.duration || r.period || r.year || "";
    const description = r.description || r.desc || "";
    const logo = getLogo(institution);

    return `
      <div class="education-card">
        ${logo ? `<img src="${escapeAttr(logo)}" alt="${escapeAttr(institution)}" class="education-logo">` : ""}
        <div class="education-grid">
          <h3 class="edu-degree">${asHTML(degree)}</h3>
          <span class="duration-badge">${escapeHtml(duration)}</span>

          <p class="edu-institution">${asHTML(institution)}</p>
          ${location ? `<p class="edu-location">📍 ${asHTML(location)}</p>` : `<span class="edu-location"></span>`}

          ${specialization ? `<p class="edu-spec">${asHTML(specialization)}</p>` : `<span class="edu-spec"></span>`}
          ${grade ? `<p class="edu-grade">🎯 ${asHTML(grade)}</p>` : `<span class="edu-grade"></span>`}
        </div>
        ${description ? `<div class="edu-description">${asHTML(description)}</div>` : ""}
      </div>
    `;
  }).join("");
}

// Work Experience Section
function renderWorkExperience(rows) {
  const container = document.getElementById("workExperience");
  if (!container) return;
  container.innerHTML = rows.map(r => `
    <div class="work-item">
      <div class="work-header">
        <div class="work-info">
          <h3 class="work-title">${asHTML(r.title || "")}</h3>
          <p class="work-company">${asHTML(r.company || "")}</p>
          <p class="work-location">${asHTML(r.location || "")}</p>
        </div>
        <div class="work-duration">${escapeHtml(r.duration || "")}</div>
      </div>
      <div class="work-desc">${asHTML(r.description || r.desc || "")}</div>
    </div>
  `).join("");
}

// Positions of Responsibility Section
function renderPositionsOfResponsibility(rows) {
  const container = document.getElementById("positionsOfResponsibility");
  if (!container) return;
  
  container.innerHTML = rows.map(r => `
    <div class="work-item">
      <div class="work-header">
        <div class="work-info">
          <h3 class="work-title">${asHTML(r.position || "")}</h3>
          <p class="work-company">${asHTML(r.organisation || "")}</p>
        </div>
        <div class="work-duration">${escapeHtml(r.duration || "")}</div>
      </div>
      <div class="work-desc">${asHTML(r.description || "")}</div>
    </div>
  `).join("");
}

// Hero Header Section
function renderHero(rows) {
//   console.log("renderHero called with rows:", rows);
  
  const container = document.getElementById("hero");
//   console.log("Hero container:", container);
  
  if (!container || !rows.length) {
    console.log("No container or rows, returning");
    return;
  }
  
  const data = rows[0];
//   console.log("Hero data:", data);
  
  const name = data.name || "Deepak Yadav";
  const role = data.role || data.designation || "Machine Learning & Data Science Engineer";
  const status = data.status || "Open to work / Hiring engagements";
  let profileImg = data.profile_image || data.image || "https://via.placeholder.com/120?text=Profile";
  profileImg = convertGoogleDriveLink(profileImg);
  const resumeLink = data.resume_link || data.resume || "#";

//   console.log("Profile Image:", profileImg);

  const heroHTML = `
    <div class="hero-left">
      <div class="hero-avatar">
        <img src="${escapeAttr(profileImg)}" alt="Profile" loading="lazy">
      </div>
      <div class="hero-meta">
        <p class="hero-kicker">Hi, I'm</p>
        <h1 class="hero-name">${escapeHtml(name)}</h1>
        <p class="hero-role">${escapeHtml(role)}</p>
        <div class="hero-status">
          <span class="status-dot"></span>
          <span>${escapeHtml(status)}</span>
        </div>
        ${resumeLink !== "#" ? `<a href="${escapeAttr(resumeLink)}" target="_blank" rel="noopener" class="btn hero-btn">Download Resume</a>` : ""}
      </div>
    </div>
    <div class="hero-right">
      <h2 class="hero-heading">Have an idea? Let's Connect!</h2>
      <a href="#contact" class="animated-cta">
        <div class="cta-content">
          <span class="cta-text">BOOK A CALL</span>
        </div>
        <div class="cta-hover">
          <div class="circles-wrapper">
            <div class="circle circle-left">
              <img src="${escapeAttr(profileImg)}" alt="You" loading="lazy">
            </div>
            <div class="circle circle-right">
              <span>YOU</span>
            </div>
          </div>
          <span class="cta-hover-text">LET'S TALK!</span>
        </div>
      </a>
    </div>
  `;

  container.innerHTML = heroHTML;
//   console.log("Hero rendered successfully");

  setTimeout(() => updateNavbarCTA(profileImg), 100);
}

function updateNavbarCTA(profileImg) {
  const navCTA = document.querySelector(".nav-cta");
  if (!navCTA) return;

  navCTA.innerHTML = `Let's Connect`;
  navCTA.href = "#contact";
}

// Navbar toggle
document.addEventListener("DOMContentLoaded", () => {
  initLoader(); // Start loader animation

  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.querySelectorAll(".nav-link, .navbar-link");
  
  // Navbar toggle
  if (navToggle) {
    navToggle.addEventListener("click", () => {
      navMenu?.classList.toggle("active");
      navToggle.classList.toggle("active");
    });
  }

  // Hamburger menu
  if (hamburger) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      navMenu?.classList.toggle("active");
    });
  }

  // Close menu on link click
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      navMenu?.classList.remove("active");
      navToggle?.classList.remove("active");
      hamburger?.classList.remove("active");
    });
  });

  // Handle window resize
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      hamburger?.classList.remove("active");
      navMenu?.classList.remove("active");
    }
  });

  // Initialize portfolio data
  init();
});


// Initialize all sections
async function init() {
  try {
    const data = await Promise.all([
      fetchCSV(endpoints.details).catch(e => { console.error("Details fetch error:", e); return []; }),
      fetchCSV(endpoints.summary).catch(e => { console.error("Summary fetch error:", e); return []; }),
      fetchCSV(endpoints.socialLinks).catch(e => { console.error("Social links fetch error:", e); return []; }),
      fetchCSV(endpoints.projects).catch(e => { console.error("Projects fetch error:", e); return []; }),
      fetchCSV(endpoints.certificates).catch(e => { console.error("Certificates fetch error:", e); return []; }),
      fetchCSV(endpoints.skills).catch(e => { console.error("Skills fetch error:", e); return []; }),
      fetchCSV(endpoints.education).catch(e => { console.error("Education fetch error:", e); return []; }),
      fetchCSV(endpoints.workExperience).catch(e => { console.error("Work experience fetch error:", e); return []; }),
      fetchCSV(endpoints.positionsOfResponsibility).catch(e => { console.error("Positions fetch error:", e); return []; })
    ]);
    
    renderHero(data[0]);
    renderSummary(data[1]);
    renderSocialLinks(data[2]);
    renderProjects(data[3]);
    renderCertificates(data[4]);
    renderSkills(data[5]);
    renderEducation(data[6]);
    renderWorkExperience(data[7]);
    renderPositionsOfResponsibility(data[8]);

    // Dispatch data loaded event
    window.dispatchEvent(new Event('dataLoaded'));
  } catch (e) {
    console.error("Init error:", e);
    // Still hide loader on error after min time
    setTimeout(() => {
      window.dispatchEvent(new Event('dataLoaded'));
    }, 2000);
  }
}

function convertGoogleDriveLink(url) {
  if (!url || !url.includes("drive.google.com")) return url;
  const fileIdMatch = url.match(/[?&]id=([a-zA-Z0-9-_]+)/);
  if (fileIdMatch) {
    return `https://lh3.googleusercontent.com/d/${fileIdMatch[1]}=w400`;
  }
  return url;
}

// Show/hide floating CTA based on screen size
function toggleFloatingCTA() {
  const floatingCTA = document.querySelector('.nav-cta-floating');
  if (!floatingCTA) return;
  
  if (window.innerWidth <= 768) {
    floatingCTA.style.display = 'block';
  } else {
    floatingCTA.style.display = 'none';
  }
}



document.addEventListener("DOMContentLoaded", () => {
  toggleFloatingCTA();
  window.addEventListener('resize', toggleFloatingCTA);
});

