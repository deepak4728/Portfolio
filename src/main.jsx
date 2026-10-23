import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import * as Dialog from "@radix-ui/react-dialog";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { field, imageUrl, loadPortfolio } from "./data.js";
const profileFallback = "/deepak-profile.png";
import { SegmentedControl } from "./components/ui/segmented-control.jsx";
import "../portfolio.css";

const safeTags = new Set(["P", "B", "STRONG", "EM", "I", "BR", "UL", "OL", "LI", "A"]);
function safeMarkup(markup = "") {
  const source = String(markup ?? "");
  const parsed = new DOMParser().parseFromString(source, "text/html");
  const root = document.createElement("div");
  const hasSupportedMarkup = /<\s*\/?\s*(?:p|b|strong|em|i|br|ul|ol|li|a)\b/i.test(source);
  if (!hasSupportedMarkup) {
    const lines = parsed.body.textContent.replace(/\r/g, "").split(/\n+/);
    lines.forEach((line, index) => {
      if (index) root.append(document.createElement("br"));
      root.append(document.createTextNode(line));
    });
    return { __html: root.innerHTML };
  }
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
function certificateImageUrl(url = "") {
  const source = String(url || "").replace(/\\([~_])/g, "$1").replace(/&amp;/gi, "&");
  const markdownTarget = source.match(/\]\((https?:\/\/[^)]+)\)/i)?.[1];
  const embeddedUrl = source.match(/https?:\/\/[^\s"'<>\\)]+/i)?.[0]?.replace(/[),.;]+$/, "");
  const value = externalUrl((markdownTarget || embeddedUrl || source).trim());
  if (!value) return "";
  return /(?:googleusercontent\.com|drive\.google\.com\/(?:file\/d\/|open\?id=)|s3\.amazonaws\.com\/|\.(?:png|jpe?g|webp|gif|avif|svg)(?:[?#]|$))/i.test(value)
    ? imageUrl(value)
    : "";
}
function certificateImageFor(item = {}) {
  const fields = Object.entries(item);
  const imageField = fields.find(([key, value]) => /image|preview|photo|scan/i.test(key) && certificateImageUrl(value));
  const anyImageField = fields.find(([, value]) => certificateImageUrl(value));
  return certificateImageUrl(imageField?.[1] || anyImageField?.[1] || "");
}
function certificateLinkFor(item = {}) {
  const fields = Object.entries(item);
  const candidates = [field(item, "verification_link", "verification link", "credential_link", "certificate_link", "link", "url"), ...fields.map(([, value]) => value)].filter(Boolean);
  return candidates.find((value) => !certificateImageUrl(value)) || candidates[0] || "";
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

function BrandMark({ initials = "DY" }) {
  const monogram = [...initials].slice(0, 2).join("") || "DY";
  return <span className="wordmark-mark" aria-hidden="true"><span className="wordmark-monogram">{monogram}</span><svg className="wordmark-signal" viewBox="0 0 28 9" fill="none"><path d="M1 6.5h5l3-4 4.2 4.2 4-5 3 3.1H27"/><circle cx="27" cy="4.8" r="1.1"/></svg></span>;
}

function Topbar({ name, activeSection, darkMode, onToggleTheme, isScrolled }) {
  const navRef = useRef(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const initials = initialsFor(name);
  const navItems = [["about", "About"], ["experience", "Experience"], ["projects", "Projects"], ["skills", "Toolkit"], ["leadership", "Leadership"]];
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
  return <div className="topbar-slot"><header className={`topbar${isScrolled ? " is-scrolled" : ""}`}><a className="wordmark" href="#home" aria-label={`${name} home`}><BrandMark initials={initials}/><span className="wordmark-name">{name}</span><span className="wordmark-status"><i aria-hidden="true"/>Available</span></a>
    <nav className="topnav" aria-label="Main navigation" ref={navRef} style={{ "--indicator-left": `${indicator.left}px`, "--indicator-width": `${indicator.width}px` }}>{navItems.map(([id, label]) => <a key={id} href={`#${id}`} aria-current={activeSection === id ? "location" : undefined}>{label}</a>)}<span className={`topnav-indicator${indicator.width ? " is-visible" : ""}`} aria-hidden="true"/></nav>
    <div className="topbar-actions"><button className="theme-toggle" onClick={onToggleTheme} type="button" aria-label={`Switch to ${darkMode ? "light" : "dark"} theme`} title={`Switch to ${darkMode ? "light" : "dark"} theme`}><span aria-hidden="true">{darkMode ? "☼" : "◐"}</span></button><a className="topbar-cta" href="#contact">Let’s talk</a></div>
  </header></div>;
}

function Hero({ detail }) {
  const [stage, setStage] = useState(0);
  const [autoPlay, setAutoPlay] = useState(() => !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const name = field(detail, "name") || "Deepak Yadav";
  const role = field(detail, "role", "designation") || "Machine Learning & Data Science Engineer";
  const status = field(detail, "status") || "Open to opportunities";
  const avatar = profileFallback;
  const resume = field(detail, "resume_link", "resume");
  const stages = [
    { label: "Data", detail: "Find the signal in the noise.", lead: "Building with", headline: "data & intention.", mark: "01" },
    { label: "Model", detail: "Choose a method that fits.", lead: "Building", headline: "models with care.", mark: "02" },
    { label: "Impact", detail: "Make the result useful.", lead: "Turning", headline: "ideas into action.", mark: "03" },
  ];
  useEffect(() => {
    if (!autoPlay) return undefined;
    const timer = window.setInterval(() => {
      if (document.visibilityState !== "hidden") {
        setStage((current) => (current + 1) % stages.length);
      }
    }, 4200);
    return () => window.clearInterval(timer);
  }, [autoPlay]);
  const moveSpotlight = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--pointer-x", `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty("--pointer-y", `${event.clientY - bounds.top}px`);
  };
  return <section className="hero" id="home" aria-labelledby="hero-title" onPointerMove={moveSpotlight}>
    <div className="hero-copy"><p className="eyebrow hero-eyebrow"><span className="eyebrow-rule"/> PORTFOLIO <span className="eyebrow-year">2026</span><span className="hand-note hero-meta-note" aria-hidden="true">field notes</span></p>
      <h1 id="hero-title">{stages[stage].lead}<br/><span key={stage} className="hero-headline-shift">{stages[stage].headline}</span></h1>
      <p className="hero-description">I’m <strong>{name}</strong>, a {role.toLowerCase()} focused on turning complex ideas into useful, thoughtful products.</p>
      <div className="hero-actions"><a className="button button--dark" href="#projects">Explore my work</a>{resume && <a className="text-link" href={externalUrl(resume)} target="_blank" rel="noreferrer">Download résumé</a>}</div>
      <div className="availability"><span className="availability-dot"/><span>{status}</span></div>
    </div>
    <div className="hero-visual"><div className="hero-orbit hero-orbit--one"/><div className="hero-orbit hero-orbit--two"/><div className="hero-portrait"><img src={avatar} alt={`${name}`} fetchPriority="high" onError={(event) => { event.currentTarget.src = profileFallback; }}/></div><div className="hero-tech-cloud" aria-label="Areas of focus"><span className="hero-tech-tile hero-tech-tile--ml"><b>ML</b><span>Machine learning</span></span><span className="hero-tech-tile hero-tech-tile--cv"><b>CV</b><span>Computer vision</span></span><span className="hero-tech-tile hero-tech-tile--data"><b>DS</b><span>Data science</span></span></div><span className="portrait-note portrait-note--top" aria-hidden="true">curious by nature</span><span className="portrait-note portrait-note--side" aria-hidden="true">find the signal</span><div className="hero-stamp"><span>THOUGHTFUL<br/>BY DESIGN</span><span className="stamp-star">✳</span></div><span className="hero-index">01 / 06</span>
      <div className="hero-lab" aria-label="Interactive machine learning workflow"><div className="hero-lab__top"><span><i/> THE BUILD LOOP</span><span className="hero-lab__tools"><span>ML / DS</span><button type="button" onClick={() => setAutoPlay((playing) => !playing)} aria-label={`${autoPlay ? "Pause" : "Play"} workflow animation`}>{autoPlay ? "Pause" : "Play"}</button></span></div><ToggleGroup.Root type="single" value={String(stage)} onValueChange={(value) => { if (value !== "") setStage(Number(value)); }} className="lab-steps" aria-label="Explore the build loop">{stages.map((item, index) => <React.Fragment key={item.mark}><ToggleGroup.Item value={String(index)} className="lab-step"><span>{item.mark}</span>{item.label}</ToggleGroup.Item>{index < stages.length - 1 && <span className="lab-connector" aria-hidden="true"/>}</React.Fragment>)}</ToggleGroup.Root><p key={stage} className="lab-caption" aria-live="polite"><span>0{stage + 1}</span> {stages[stage].detail}</p><div className="lab-wave" aria-hidden="true"><svg viewBox="0 0 300 36" preserveAspectRatio="none"><path d="M0 20 C20 20 24 7 42 8 S64 28 82 21 102 6 119 13 140 31 158 19 176 4 194 11 213 29 230 19 249 7 266 13 284 24 300 15"/><path d="M0 31 C25 29 30 22 48 23 S72 33 91 27 113 17 130 23 148 31 168 27 187 17 205 21 227 32 244 27 270 21 300 23"/></svg></div></div>
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

const projectTechnologies = ["Python", "TensorFlow", "PyTorch", "OpenCV", "Django", "ResNet50", "CNN", "Gemini", "Next.js", "Zustand", "ChromaDB", "SVM", "YOLO"];

function classifyProject(item) {
  const text = `${field(item, "title", "name")} ${field(item, "description", "desc")}`.toLowerCase();
  if (/computer vision|yoga pose|vegetable classification|entity value prediction|image-based/.test(text)) return "Computer vision";
  if (/bank management|account types|transaction ledger/.test(text)) return "Software engineering";
  return "AI & ML";
}

function ProjectDetailsDialog({ title, category, description, technologies, link }) {
  return <Dialog.Root>
    <Dialog.Trigger asChild><button className="project-info__trigger" type="button">Details</button></Dialog.Trigger>
    <Dialog.Portal container={document.querySelector(".app-shell") || undefined}>
      <Dialog.Overlay className="project-dialog-overlay" />
      <Dialog.Content className="project-dialog">
        <Dialog.Close className="project-dialog__close" type="button" aria-label="Close project details"><span aria-hidden="true">×</span></Dialog.Close>
        <p className="project-dialog__eyebrow">{category} · SELECTED WORK</p>
        <Dialog.Title asChild><RichText className="project-dialog__title" value={title} /></Dialog.Title>
        <Dialog.Description asChild><RichText className="project-dialog__description" value={description || "Project details are coming soon."} /></Dialog.Description>
        {technologies.length > 0 && <div className="project-dialog__technologies" aria-label="Technologies used">{technologies.map((technology) => <span key={technology}>{technology}</span>)}</div>}
        <div className="project-dialog__actions">
          {link && <a className="button button--dark" href={externalUrl(link)} target="_blank" rel="noreferrer">Open project</a>}
          <Dialog.Close asChild><button className="project-dialog__dismiss" type="button">Close details</button></Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}

function ProjectCard({ item, index }) {
  const title = field(item, "title", "name") || "Untitled project";
  const link = field(item, "link", "demo", "github");
  const image = field(item, "image");
  const description = field(item, "description", "desc");
  const category = classifyProject(item);
  const text = `${title} ${description}`;
  const technologies = projectTechnologies.filter((technology) => new RegExp(technology, "i").test(text)).slice(0, 4);

  return <article className="project-card">
    <div className={`project-art project-art--${index % 4}`}>
      <span className="project-number">0{String(index + 1).padStart(2, "0")}</span>
      {image ? <img src={image} alt="" loading="lazy"/> : <div className={`project-shape project-shape--${index % 3}`} aria-hidden="true"><svg viewBox="0 0 180 120"><path d="M12 92 C38 90 35 33 62 48 S83 104 103 70 125 22 146 44 159 78 168 28"/><circle cx="62" cy="48" r="3"/><circle cx="103" cy="70" r="3"/><circle cx="146" cy="44" r="3"/></svg><span>{category === "Computer vision" ? "VISION" : "MODEL"}</span></div>}
    </div>
    <div className="project-info">
      <div><p className="project-type">{category.toUpperCase()} · {String(index + 1).padStart(2, "0")}</p><RichText className="project-title" value={title}/></div>
      <ProjectDetailsDialog title={title} category={category} description={description} technologies={technologies} link={link}/>
    </div>
    <RichText className="project-description" value={description}/>
    {technologies.length > 0 && <div className="project-tech" aria-label="Technologies">{technologies.map((technology) => <span key={technology}>{technology}</span>)}</div>}
  </article>;
}

function Projects({ rows = [] }) {
  const [filter, setFilter] = useState("All work");
  const filters = ["All work", "AI & ML", "Computer vision", "Software engineering"];
  const visibleRows = rows.filter((item) => filter === "All work" || classifyProject(item) === filter);
  return <section className="content-section projects-section" id="projects"><SectionHeading number="03" eyebrow="SELECTED WORK" title="Projects." note="A few things I’ve made along the way."/>
    {rows.length ? <><div className="project-controls"><SegmentedControl className="project-filters" itemClassName="project-filters__item" label="Filter projects" value={filter} onValueChange={setFilter} items={filters.map((option) => ({ value: option, label: option }))}/><span className="project-count"><b>{String(visibleRows.length).padStart(2, "0")}</b> / {String(rows.length).padStart(2, "0")} CASES</span></div><div className="project-grid" aria-live="polite">{visibleRows.map((item) => <ProjectCard key={field(item, "title", "name") || item.id} item={item} index={rows.indexOf(item)}/>)}</div></> : <EmptyState/>}
  </section>;
}

function Certificates({ rows = [] }) {
  return <section className="content-section compact-section certificates-section" id="certificates"><SectionHeading number="04" eyebrow="ALWAYS LEARNING" title="Certificates." note="A few milestones along the way."/>
    {rows.length ? <><div className="certificate-archive-line" aria-label={`${rows.length} certificate records`}><span>LEARNING ARCHIVE</span><span>{String(rows.length).padStart(2, "0")} RECORDS</span></div><div className="certificate-grid">{rows.map((item, index) => {
      const title = field(item, "title", "name") || "Certificate";
      const issuer = field(item, "issuer", "provider") || "Professional learning";
      const image = certificateImageFor(item);
      const link = certificateLinkFor(item);
      return <CertificateCard key={`${title}-${index}`} title={title} issuer={issuer} date={field(item, "date")} link={link} image={image} index={index}/>;
    })}</div></> : <EmptyState/>}
  </section>;
}

function CertificateCard({ title, issuer, date, link, image, index }) {
  const [imageFailed, setImageFailed] = useState(false);
  const hasImage = Boolean(image) && !imageFailed;
  const issuerMark = issuer.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  return <article className="certificate-card">
    <div className={`certificate-card__visual${hasImage ? " has-image" : ""}`}>
      {hasImage ? <div className="certificate-card__image-frame"><img src={image} alt={`${title} certificate thumbnail`} loading="lazy" decoding="async" onError={() => setImageFailed(true)}/></div> : <div className="certificate-art" aria-hidden="true"><span className="certificate-art__kicker">PROFESSIONAL LEARNING</span><span className="certificate-art__seal">{issuerMark || "✳"}</span><span className="certificate-art__rule"/><span className="certificate-art__issuer">{issuer}</span><span className="certificate-art__serial">COURSE RECORD · {String(index + 1).padStart(2, "0")}</span></div>}
      <span className="certificate-card__index">{String(index + 1).padStart(2, "0")}</span>
    </div>
    <div className="certificate-card__body"><div className="certificate-card__meta"><p className="certificate-card__issuer">{issuer}</p>{date && <span className="certificate-card__date">{date}</span>}</div><RichText className="certificate-card__title" value={title}/><div className="certificate-card__footer"><span>{hasImage ? "LEARNING RECORD" : "COURSE RECORD"}</span>{link && !certificateImageUrl(link) && <a href={externalUrl(link)} target="_blank" rel="noreferrer">Verify credential <span aria-hidden="true">↗</span></a>}</div></div>
  </article>;
}

function Skills({ rows = [] }) {
  const [filter, setFilter] = useState("All skills");
  const categoryFor = (item) => field(item,"category","Category","skill category","Skill Category");
  const categories = [...new Set(rows.map(categoryFor).filter(Boolean))];
  const visibleRows = filter === "All skills" ? rows : rows.filter((item) => categoryFor(item) === filter);
  const grouped = visibleRows.reduce((groups, item) => { const group = categoryFor(item) || "Core toolkit"; (groups[group] ||= []).push(field(item,"name","Skill","tech") || "Skill"); return groups; }, {});
  return <section className="content-section skills-section" id="skills"><SectionHeading number="05" eyebrow="THINGS I WORK WITH" title="Skills & toolkit." note="The tools are only part of the craft."/>
    {rows.length ? <>{categories.length > 1 && <SegmentedControl className="project-filters skill-filters" itemClassName="project-filters__item" label="Filter skills by category" value={filter} onValueChange={setFilter} items={[{ value: "All skills", label: "All skills" }, ...categories.map((category) => ({ value: category, label: category }))]}/>}<div className="skill-groups">{Object.entries(grouped).map(([group, skills], groupIndex) => <article className="skill-group" key={group}><div className="skill-group__header"><span className="skill-group__index">{String(groupIndex + 1).padStart(2, "0")}</span><div><p className="skill-group__eyebrow">TOOLS IN PRACTICE</p><h3>{group}</h3></div><span className="skill-group__count">{String(skills.length).padStart(2, "0")} tools</span></div><div className="skill-tags">{skills.map((skill,index) => <span className="skill-tag" key={`${skill}-${index}`}>{skill}</span>)}</div></article>)}</div></> : <EmptyState/>}
  </section>;
}

function Education({ rows = [] }) {
  return <section className="content-section" id="education"><SectionHeading number="06" eyebrow="THE FOUNDATIONS" title="Education."/>
    {rows.length ? <div className="education-list">{rows.map((item,index) => <article className="education-item" key={`${field(item,"institution","college")}-${index}`}><span className="education-item__index">{String(index + 1).padStart(2, "0")}</span><div className="education-item__details"><h3>{field(item,"degree","qualification")}</h3><p className="education-item__institution">{field(item,"institution","college","school")}</p>{field(item,"specialization","branch") && <span className="education-item__focus">{field(item,"specialization","branch")}</span>}{field(item,"description","desc") && <p className="education-description">{field(item,"description","desc")}</p>}</div><div className="education-item__meta">{field(item,"duration","period","year") && <span className="date-chip">{field(item,"duration","period","year")}</span>}{field(item,"location","city","place") && <span className="education-item__location">{field(item,"location","city","place")}</span>}</div></article>)}</div> : <EmptyState/>}
  </section>;
}

function Leadership({ rows = [] }) {
  if (!rows.length) return null;
  return <section className="content-section compact-section" id="leadership"><SectionHeading number="07" eyebrow="BEYOND THE JOB TITLE" title="Community & leadership."/>
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
    const observedSections = new WeakSet();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) setActiveSection(entry.target.id); });
    }, { rootMargin: "-22% 0px -68% 0px" });
    const observeSections = () => document.querySelectorAll("#about, #experience, #projects, #skills, #leadership, #contact").forEach((section) => {
      if (!observedSections.has(section)) { observedSections.add(section); observer.observe(section); }
    });
    observeSections();
    const revealObserver = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { const index = [...entry.target.parentElement.children].indexOf(entry.target); entry.target.style.setProperty("--reveal-delay", `${Math.min(Math.max(index, 0), 5) * 65}ms`); entry.target.classList.add("in-view"); currentObserver.unobserve(entry.target); } });
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
      observeSections();
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
  return <div className={`app-shell ${darkMode ? "theme-dark" : ""}`}><div className="scroll-progress" aria-hidden="true"/><Topbar name={name} activeSection={activeSection} darkMode={darkMode} isScrolled={isScrolled} onToggleTheme={toggleTheme}/><main><Hero detail={detail}/><div className="page-content"><About rows={content.summary || []} socials={content.socialLinks || []}/><Experience rows={content.workExperience || []}/><Projects rows={content.projects || []}/><Certificates rows={content.certificates || []}/><Skills rows={content.skills || []}/><Education rows={content.education || []}/><Leadership rows={content.positions || []}/><Contact/></div></main><footer className="site-footer"><a className="wordmark" href="#home"><BrandMark initials={initialsFor(name)}/><span>{name}</span></a><span>DESIGNED WITH INTENTION · {new Date().getFullYear()}</span><a href="#home">BACK TO TOP</a></footer><nav className="mobile-nav" aria-label="Mobile navigation"><a href="#about" aria-current={activeSection === "about" ? "location" : undefined}>About</a><a href="#experience" aria-current={activeSection === "experience" ? "location" : undefined}>Experience</a><a href="#projects" aria-current={activeSection === "projects" ? "location" : undefined}>Work</a><a href="#leadership" aria-current={activeSection === "leadership" ? "location" : undefined}>Leadership</a></nav></div>;
}

createRoot(document.getElementById("root")).render(<React.StrictMode><App/></React.StrictMode>);
