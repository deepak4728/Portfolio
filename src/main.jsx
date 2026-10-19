import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { field, imageUrl, loadPortfolio } from "./data.js";
import profileFallback from "../static/dee.png";
import "../portfolio.css";

const safeTags = new Set(["P", "B", "STRONG", "EM", "I", "BR", "UL", "OL", "LI", "A"]);
function safeMarkup(markup = "") {
  const parsed = new DOMParser().parseFromString(String(markup), "text/html");
  const clean = (node) => {
    if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.textContent);
    if (node.nodeType !== Node.ELEMENT_NODE) return document.createDocumentFragment();
    if (!safeTags.has(node.tagName)) {
      const fragment = document.createDocumentFragment();
      [...node.childNodes].forEach((child) => fragment.append(clean(child)));
      return fragment;
    }
    const element = document.createElement(node.tagName.toLowerCase());
    if (node.tagName === "A") {
      const href = node.getAttribute("href") || "";
      if (/^(https?:|mailto:)/i.test(href)) {
        element.setAttribute("href", href);
        element.setAttribute("target", "_blank");
        element.setAttribute("rel", "noreferrer");
      }
    }
    [...node.childNodes].forEach((child) => element.append(clean(child)));
    return element;
  };
  const root = document.createElement("div");
  [...parsed.body.childNodes].forEach((child) => root.append(clean(child)));
  return { __html: root.innerHTML };
}
function RichText({ value, className }) {
  return <div className={className} dangerouslySetInnerHTML={safeMarkup(value)} />;
}
function externalUrl(url = "") {
  const value = url.trim();
  return value && !/^(https?:|mailto:|tel:|#)/i.test(value) ? `https://${value}` : value;
}
const iconFor = (name = "") => ({
  github: "GH", linkedin: "in", email: "✉", portfolio: "◎", instagram: "◎", twitter: "𝕏", x: "𝕏",
}[name.toLowerCase()] || "•");
const initialsFor = (name = "") => name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => [...part][0]).join("").toUpperCase() || "DY";

function SectionHeading({ number, eyebrow, title, note }) {
  return <div className="section-heading">
    <span className="section-number">{number}</span>
    <div className="section-heading__copy"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>
    {note && <p className="section-note">{note}</p>}
  </div>;
}

function EmptyState({ children = "New details will appear here soon." }) {
  return <p className="empty-state">{children}</p>;
}

function Topbar({ name, activeSection, darkMode, onToggleTheme, isScrolled }) {
  const navRef = useRef(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const initials = initialsFor(name);
  const navItems = [["about", "About"], ["experience", "Experience"], ["projects", "Projects"], ["skills", "Toolkit"], ["contact", "Contact"]];
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return undefined;
    const syncIndicator = () => {
      const selected = nav.querySelector('[aria-current="location"]');
      setIndicator(selected ? { left: selected.offsetLeft, width: selected.offsetWidth } : { left: 0, width: 0 });
    };
    syncIndicator();
    const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(syncIndicator) : null;
    resizeObserver?.observe(nav);
    window.addEventListener("resize", syncIndicator);
    return () => { resizeObserver?.disconnect(); window.removeEventListener("resize", syncIndicator); };
  }, [activeSection]);
  return <div className="topbar-slot"><header className={`topbar${isScrolled ? " is-scrolled" : ""}`}><a className="wordmark" href="#home" aria-label={`${name} home`}><span className="wordmark-mark" aria-hidden="true">{initials}</span><span>{name}</span></a>
    <nav className="topnav" aria-label="Main navigation" ref={navRef} style={{ "--indicator-left": `${indicator.left}px`, "--indicator-width": `${indicator.width}px` }}>{navItems.map(([id, label]) => <a key={id} href={`#${id}`} aria-current={activeSection === id ? "location" : undefined}>{label}</a>)}<span className={`topnav-indicator${indicator.width ? " is-visible" : ""}`} aria-hidden="true"/></nav>
    <div className="topbar-actions"><button className="theme-toggle" onClick={onToggleTheme} type="button" aria-label={`Switch to ${darkMode ? "light" : "dark"} theme`} title={`Switch to ${darkMode ? "light" : "dark"} theme`}><span aria-hidden="true">{darkMode ? "☼" : "◐"}</span></button><a className="topbar-cta" href="#contact">Let’s talk</a></div>
  </header></div>;
}

function Hero({ detail }) {
  const [stage, setStage] = useState(0);
  const name = field(detail, "name") || "Deepak Yadav";
  const role = field(detail, "role", "designation") || "Machine Learning & Data Science Engineer";
  const status = field(detail, "status") || "Open to opportunities";
  const avatar = imageUrl(field(detail, "profile_image", "image")) || profileFallback;
  const resume = field(detail, "resume_link", "resume");
  const stages = [
    { label: "Data", detail: "Find the signal in the noise.", mark: "01" },
    { label: "Model", detail: "Choose a method that fits.", mark: "02" },
    { label: "Impact", detail: "Make the result useful.", mark: "03" },
  ];
  const moveSpotlight = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--pointer-x", `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty("--pointer-y", `${event.clientY - bounds.top}px`);
  };
  return <section className="hero" id="home" aria-labelledby="hero-title" onPointerMove={moveSpotlight}>
    <div className="hero-copy"><p className="eyebrow hero-eyebrow"><span className="eyebrow-rule"/> PORTFOLIO <span className="eyebrow-year">2026</span></p>
      <h1 id="hero-title">Building with<br/><span>data & intention.</span></h1>
      <p className="hero-description">I’m <strong>{name}</strong>, a {role.toLowerCase()} focused on turning complex ideas into useful, thoughtful products.</p>
      <div className="hero-actions"><a className="button button--dark" href="#projects">Explore my work</a>{resume && <a className="text-link" href={externalUrl(resume)} target="_blank" rel="noreferrer">Download résumé</a>}</div>
      <div className="availability"><span className="availability-dot"/><span>{status}</span></div>
    </div>
    <div className="hero-visual"><div className="hero-orbit hero-orbit--one"/><div className="hero-orbit hero-orbit--two"/><div className="hero-portrait"><img src={avatar} alt={`${name}`} fetchPriority="high" onError={(event) => { event.currentTarget.src = profileFallback; }}/></div><div className="hero-stamp"><span>THOUGHTFUL<br/>BY DESIGN</span><span className="stamp-star">✳</span></div><span className="hero-index">01 / 06</span>
      <div className="hero-lab" aria-label="Interactive machine learning workflow"><div className="hero-lab__top"><span><i/> THE BUILD LOOP</span><span>ML / DS</span></div><div className="lab-steps" role="group" aria-label="Explore the build loop">{stages.map((item, index) => <React.Fragment key={item.mark}><button type="button" className={`lab-step ${stage === index ? "is-active" : ""}`} aria-pressed={stage === index} onClick={() => setStage(index)}><span>{item.mark}</span>{item.label}</button>{index < stages.length - 1 && <span className="lab-connector" aria-hidden="true"/>}</React.Fragment>)}</div><p key={stage} className="lab-caption"><span>0{stage + 1}</span> {stages[stage].detail}</p><div className="lab-wave" aria-hidden="true"><svg viewBox="0 0 300 36" preserveAspectRatio="none"><path d="M0 20 C20 20 24 7 42 8 S64 28 82 21 102 6 119 13 140 31 158 19 176 4 194 11 213 29 230 19 249 7 266 13 284 24 300 15"/><path d="M0 31 C25 29 30 22 48 23 S72 33 91 27 113 17 130 23 148 31 168 27 187 17 205 21 227 32 244 27 270 21 300 23"/></svg></div></div>
    </div>
    <div className="hero-bottom"><span>SCROLL TO EXPLORE</span><span className="scroll-line"/><span>JODHPUR, INDIA · IST</span></div>
  </section>;
}

function About({ rows, socials }) {
  const summary = field(rows[0], "summary", "about") || "I’m a machine learning and data science engineer interested in building practical, human-centered technology. I enjoy moving from an open-ended problem to a clear idea, then shaping that idea into a product people can use.";
  const links = socials.filter((item) => field(item, "url", "link"));
  return <section className="content-section about-section" id="about"><SectionHeading number="01" eyebrow="A LITTLE ABOUT ME" title="Curiosity, made useful." note="The person behind the pixels and prototypes."/>
    <div className="about-grid"><p className="about-lede">Good work starts with<br/><em>asking better questions.</em></p><div className="about-copy"><RichText value={summary}/><div className="social-row">{links.length ? links.map((item, index) => { const label = field(item, "name", "platform") || "Social"; const url = field(item, "url", "link"); return <a className="social-link" key={`${label}-${index}`} href={externalUrl(url)} target="_blank" rel="noreferrer"><span>{iconFor(label)}</span>{label}</a>; }) : <a className="social-link" href="https://github.com/deepak4728" target="_blank" rel="noreferrer"><span>GH</span>GitHub</a>}
        <a className="social-link" href="mailto:dy19363@gmail.com"><span>✉</span>Email</a></div></div></div>
  </section>;
}

function Experience({ rows = [] }) {
  return <section className="content-section" id="experience"><SectionHeading number="02" eyebrow="WHERE I’VE BEEN" title="Experience." note="Learning by doing, and doing it with good people."/>
    {rows.length ? <div className="experience-list">{rows.map((item, index) => <article className="experience-item" key={`${field(item,"company")}-${index}`}><span className="timeline-marker"/><div className="experience-main"><RichText className="experience-company" value={field(item,"company") || "Experience"}/><RichText className="experience-title" value={field(item,"title")}/>{field(item,"location") && <p className="muted">{field(item,"location")}</p>}<RichText className="experience-description" value={field(item,"description","desc")}/></div><span className="date-chip">{field(item,"duration")}</span></article>)}</div> : <EmptyState/>}
  </section>;
}

function Projects({ rows = [] }) {
  const [filter, setFilter] = useState("All work");
  const filters = ["All work", "AI & ML", "Computer vision", "Software engineering"];
  const classify = (item) => {
    const text = `${field(item, "title", "name")} ${field(item, "description", "desc")}`.toLowerCase();
    if (/computer vision|yoga pose|vegetable classification|entity value prediction|image-based/.test(text)) return "Computer vision";
    if (/bank management|account types|transaction ledger/.test(text)) return "Software engineering";
    return "AI & ML";
  };
  const visibleRows = rows.filter((item) => filter === "All work" || classify(item) === filter);
  return <section className="content-section projects-section" id="projects"><SectionHeading number="03" eyebrow="SELECTED WORK" title="Projects." note="A few things I’ve made along the way."/>
    {rows.length ? <><div className="project-controls"><div className="project-filters" role="group" aria-label="Filter projects">{filters.map((option) => <button key={option} className={filter === option ? "is-selected" : ""} type="button" aria-pressed={filter === option} onClick={() => setFilter(option)}>{option}</button>)}</div><span className="project-count"><b>{String(visibleRows.length).padStart(2,"0")}</b> / {String(rows.length).padStart(2,"0")} CASES</span></div><div className="project-grid" aria-live="polite">{visibleRows.map((item) => { const sourceIndex = rows.indexOf(item); const title = field(item,"title","name") || "Untitled project"; const link = field(item,"link","demo","github"); const image = field(item,"image"); const description = field(item,"description","desc"); const text = `${title} ${description}`; const technologies = ["Python", "TensorFlow", "PyTorch", "OpenCV", "Django", "ResNet50", "CNN", "Gemini", "Next.js", "Zustand", "ChromaDB", "SVM", "YOLO"].filter((technology) => new RegExp(technology, "i").test(text)).slice(0, 4); return <article className="project-card" key={title}><div className={`project-art project-art--${sourceIndex % 4}`}><span className="project-number">0{String(sourceIndex + 1).padStart(2,"0")}</span>{image ? <img src={image} alt="" loading="lazy"/> : <div className={`project-shape project-shape--${sourceIndex % 3}`} aria-hidden="true"><svg viewBox="0 0 180 120"><path d="M12 92 C38 90 35 33 62 48 S83 104 103 70 125 22 146 44 159 78 168 28"/><circle cx="62" cy="48" r="3"/><circle cx="103" cy="70" r="3"/><circle cx="146" cy="44" r="3"/></svg><span>{classify(item) === "Computer vision" ? "VISION" : classify(item) === "AI products" ? "SYSTEM" : "MODEL"}</span></div>}</div><div className="project-info"><div><p className="project-type">{classify(item).toUpperCase()} · {String(sourceIndex + 1).padStart(2,"0")}</p><RichText className="project-title" value={title}/></div>{link && <a href={externalUrl(link)} target="_blank" rel="noreferrer" aria-label={`View ${title.replace(/<[^>]*>/g, "")}`}>View project</a>}</div><RichText className="project-description" value={description}/>{technologies.length > 0 && <div className="project-tech" aria-label="Technologies">{technologies.map((technology) => <span key={technology}>{technology}</span>)}</div>}</article>; })}</div></> : <EmptyState/>}
  </section>;
}

function Certificates({ rows = [] }) {
  return <section className="content-section compact-section" id="certificates"><SectionHeading number="04" eyebrow="ALWAYS LEARNING" title="Certificates."/>
    {rows.length ? <div className="certificate-list">{rows.map((item,index) => <article className="certificate-item" key={`${field(item,"title","name")}-${index}`}><span className="certificate-icon">✳</span><div><RichText className="certificate-title" value={field(item,"title","name")}/><p>{field(item,"issuer","provider")}{field(item,"date") ? ` · ${field(item,"date")}` : ""}</p></div>{field(item,"link") && <a href={externalUrl(field(item,"link"))} target="_blank" rel="noreferrer" aria-label="View certificate">View</a>}</article>)}</div> : <EmptyState/>}
  </section>;
}

function Skills({ rows = [] }) {
  const grouped = rows.reduce((groups, item) => { const group = field(item,"category") || "Core toolkit"; (groups[group] ||= []).push(field(item,"name","Skill","tech") || "Skill"); return groups; }, {});
  return <section className="content-section skills-section" id="skills"><SectionHeading number="05" eyebrow="THINGS I WORK WITH" title="Skills & toolkit." note="The tools are only part of the craft."/>
    {rows.length ? <div className="skill-groups">{Object.entries(grouped).map(([group, skills]) => <div className="skill-group" key={group}><h3>{group}</h3><div className="skill-tags">{skills.map((skill,index) => <span className="skill-tag" key={`${skill}-${index}`}>{skill}</span>)}</div></div>)}</div> : <EmptyState/>}
  </section>;
}

function Education({ rows = [] }) {
  return <section className="content-section" id="education"><SectionHeading number="06" eyebrow="THE FOUNDATIONS" title="Education."/>
    {rows.length ? <div className="education-list">{rows.map((item,index) => <article className="education-item" key={`${field(item,"institution","college")}-${index}`}><div><h3>{field(item,"degree","qualification")}</h3><p>{field(item,"institution","college","school")}{field(item,"specialization","branch") ? ` · ${field(item,"specialization","branch")}` : ""}</p>{field(item,"description","desc") && <p className="education-description">{field(item,"description","desc")}</p>}</div><span className="date-chip">{field(item,"duration","period","year")}</span></article>)}</div> : <EmptyState/>}
  </section>;
}

function Leadership({ rows = [] }) {
  if (!rows.length) return null;
  return <section className="content-section compact-section"><SectionHeading number="07" eyebrow="BEYOND THE JOB TITLE" title="Community & leadership."/>
    <div className="experience-list">{rows.map((item,index) => <article className="experience-item" key={`${field(item,"organisation")}-${index}`}><span className="timeline-marker"/><div className="experience-main"><RichText className="experience-company" value={field(item,"organisation")}/><RichText className="experience-title" value={field(item,"position")}/><RichText className="experience-description" value={field(item,"description")}/></div><span className="date-chip">{field(item,"duration")}</span></article>)}</div>
  </section>;
}

function Contact() {
  const [submitted, setSubmitted] = useState(false);
  return <section className="contact-section" id="contact"><div className="contact-orbit"/><div className="contact-content"><p className="eyebrow">HAVE SOMETHING IN MIND?</p><h2>Let’s make it<br/><em>mean something.</em></h2><p>Have a project, role, or collaboration in mind? I’d love to hear about it.</p><div className="contact-buttons"><a href="mailto:dy19363@gmail.com" className="button button--light">Start a conversation</a><a className="contact-secondary" href="https://www.linkedin.com/in/deepak4728" target="_blank" rel="noreferrer">Find me on LinkedIn</a></div></div>
      <form className="contact-form" action="https://docs.google.com/forms/d/e/1FAIpQLSdKpzZCRoPdtvGFdCX-iDPi5PD6J02-Hk9p01cGZTHLlINavQ/formResponse" method="POST" target="_blank" onSubmit={() => setSubmitted(true)}>
        <p className="form-title">Or leave a note <span>REPLY WITHIN 24H</span></p><div className="form-pair"><label>Your name<input name="entry.2005620554" type="text" placeholder="Jane Doe" required/></label><label>Email address<input name="entry.276605624" type="email" placeholder="jane@email.com" required/></label></div><label>Phone number<input name="entry.1166974658" type="tel" placeholder="+91" required/></label><label>Subject<input name="entry.2093224432" type="text" placeholder="A little about your note" required/></label><label>Message<textarea name="entry.839337160" rows="3" placeholder="Tell me what you’re thinking…" required/></label><button className="button button--light form-submit" type="submit">{submitted ? "Opening form…" : "Send a message"}</button>
      </form>
    </section>;
}

function App() {
  const [data, setData] = useState(null);
  const [activeSection, setActiveSection] = useState("");
  const [isScrolled, setIsScrolled] = useState(() => window.scrollY > 40);
  const [darkMode, setDarkMode] = useState(() => window.localStorage.getItem("portfolio-theme") === "dark");
  useEffect(() => { let active = true; loadPortfolio().then((result) => { if (active) setData(result); }); return () => { active = false; }; }, []);
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motionTargets = new Set();
    const observedForReveal = new WeakSet();
    const observedForMotion = new WeakSet();
    let motionFrame = 0;
    const updateProgress = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      document.documentElement.style.setProperty("--scroll-progress", `${progress * 100}%`);
      setIsScrolled((current) => {
        // Separate enter/exit thresholds prevent the header state from flickering
        // when smooth scrolling or browser scroll anchoring hovers near the top.
        const threshold = current ? 12 : 40;
        const compactHeader = window.scrollY > threshold;
        return current === compactHeader ? current : compactHeader;
      });
    };
    const updateMotion = () => {
      motionFrame = 0;
      if (reducedMotion.matches) return;
      const viewportCenter = window.innerHeight / 2;
      const maxShift = window.innerWidth <= 640 ? 7 : 14;
      motionTargets.forEach((target) => {
        const bounds = target.getBoundingClientRect();
        const elementCenter = bounds.top + bounds.height / 2;
        const offset = Math.max(-maxShift, Math.min(maxShift, ((viewportCenter - elementCenter) / window.innerHeight) * 24));
        target.style.setProperty("--scroll-shift", `${offset.toFixed(1)}px`);
      });
    };
    const scheduleMotionUpdate = () => {
      if (!motionFrame) motionFrame = window.requestAnimationFrame(updateMotion);
    };
    const handleScroll = () => { updateProgress(); scheduleMotionUpdate(); };
    updateProgress();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    const sections = document.querySelectorAll("#about, #experience, #projects, #skills, #contact");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) setActiveSection(entry.target.id); });
    }, { rootMargin: "-22% 0px -68% 0px" });
    sections.forEach((section) => observer.observe(section));
    const revealObserver = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("in-view"); currentObserver.unobserve(entry.target); } });
    }, { threshold: 0.08 });
    const motionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          motionTargets.add(entry.target);
          entry.target.classList.add("scroll-motion");
        } else {
          motionTargets.delete(entry.target);
          entry.target.classList.remove("scroll-motion");
          entry.target.style.removeProperty("--scroll-shift");
        }
      });
      scheduleMotionUpdate();
    }, { rootMargin: "12% 0px 12% 0px" });
    const observeContent = () => {
      document.querySelectorAll(".content-section, .contact-section, .section-heading, .project-card, .experience-item, .certificate-item, .skill-group, .education-item").forEach((element) => {
        if (!observedForReveal.has(element)) { observedForReveal.add(element); revealObserver.observe(element); }
      });
      document.querySelectorAll(".section-heading, .about-grid, .experience-item, .project-card, .certificate-item, .skill-group, .education-item, .contact-content, .contact-form").forEach((element) => {
        if (!observedForMotion.has(element)) { observedForMotion.add(element); motionObserver.observe(element); }
      });
    };
    observeContent();
    const contentObserver = new MutationObserver(observeContent);
    const main = document.querySelector("main");
    if (main) contentObserver.observe(main, { childList: true, subtree: true });
    scheduleMotionUpdate();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      window.cancelAnimationFrame(motionFrame);
      observer.disconnect();
      revealObserver.disconnect();
      motionObserver.disconnect();
      contentObserver.disconnect();
    };
  }, []);
  const toggleTheme = () => setDarkMode((current) => {
    const next = !current;
    window.localStorage.setItem("portfolio-theme", next ? "dark" : "light");
    return next;
  });
  const content = data || {};
  const detail = content.details?.[0] || {};
  const name = field(detail,"name") || "Deepak Yadav";
  return <div className={`app-shell ${darkMode ? "theme-dark" : ""}`}><div className="scroll-progress" aria-hidden="true"/><Topbar name={name} activeSection={activeSection} darkMode={darkMode} isScrolled={isScrolled} onToggleTheme={toggleTheme}/><main><Hero detail={detail}/><div className="page-content"><About rows={content.summary || []} socials={content.socialLinks || []}/><Experience rows={content.workExperience || []}/><Projects rows={content.projects || []}/><Certificates rows={content.certificates || []}/><Skills rows={content.skills || []}/><Education rows={content.education || []}/><Leadership rows={content.positions || []}/><Contact/></div></main><footer className="site-footer"><a className="wordmark" href="#home"><span className="wordmark-mark" aria-hidden="true">{initialsFor(name)}</span><span>{name}</span></a><span>DESIGNED WITH INTENTION · {new Date().getFullYear()}</span><a href="#home">BACK TO TOP</a></footer><nav className="mobile-nav" aria-label="Mobile navigation"><a href="#about" aria-current={activeSection === "about" ? "location" : undefined}>About</a><a href="#experience" aria-current={activeSection === "experience" ? "location" : undefined}>Experience</a><a href="#projects" aria-current={activeSection === "projects" ? "location" : undefined}>Work</a><a href="#contact" aria-current={activeSection === "contact" ? "location" : undefined}>Contact</a></nav></div>;
}

createRoot(document.getElementById("root")).render(<React.StrictMode><App/></React.StrictMode>);
