# Dynamic Portfolio Website

![Portfolio Screenshot](static/preview.png)

## Overview
A fully dynamic, Google Sheets-powered portfolio website that showcases skills, projects, work experience, and achievements. Built with vanilla JavaScript and modern CSS animations, this portfolio automatically updates content from Google Sheets without requiring code changes.

## ✨ Features

### 🎯 Core Sections
- **Hero Section**: Animated profile with status indicator and interactive "Let's Connect" button
- **About Me**: Dynamic summary fetched from Google Sheets
- **Projects**: Hover-expandable project cards with images and descriptions
- **Work Experience**: Timeline of professional roles and responsibilities
- **Positions of Responsibility**: Leadership and volunteer positions
- **Education**: Academic background and qualifications
- **Skills**: Interactive skill tags with proficiency levels
- **Certificates**: Showcase of certifications and achievements
- **Contact**: Social links and call-to-action buttons

### 🚀 Dynamic Features
- **Google Sheets Integration**: All content managed via spreadsheet (no code edits needed)
- **Animated CTA Button**: Two-stage hover animation with rotating circles and text transition
- **Pulsing Status Indicator**: Live availability status with spreading shadow effect
- **Responsive Design**: Mobile-first approach with breakpoints for all devices
- **Smooth Animations**: CSS transitions and keyframe animations throughout
- **HTML Support**: Rich text formatting support in sheet cells

### 🎨 UI/UX Highlights
- Modern gradient backgrounds
- Glassmorphism effects
- Hover state interactions
- Smooth scroll navigation
- Optimized image loading (lazy load)
- Accessibility-friendly markup

## 🛠️ Tech Stack

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Custom properties, Grid, Flexbox, animations
- **Vanilla JavaScript**: ES6+, async/await, Fetch API

### Data Source
- **Google Sheets**: Backend-as-a-Service for content management
- **CSV Export**: Real-time data fetching via published sheet URLs

### Hosting
- **GitHub Pages**: Fast, free static hosting
- **Custom Domain**: Optional custom domain support

## 📋 Google Sheets Structure

The portfolio fetches data from 9 sheets with specific GIDs:

| Sheet Name | GID | Columns |
|------------|-----|---------|
| Summary | 0 | `summary` |
| Social Links | 546184029 | `platform`, `url`, `icon` |
| Projects | 2043840442 | `title`, `description`, `link`, `image` |
| Certificates | 682957323 | `title`, `issuer`, `date`, `link`, `image` |
| Skills | 405041665 | `name`, `category`, `level` |
| Education | 1434705904 | `degree`, `institution`, `duration`, `description` |
| Work Experience | 1922006196 | `title`, `company`, `location`, `duration`, `description` |
| Details | 851669658 | `name`, `role`, `status`, `profile_image`, `resume_link` |
| Positions of Responsibility | 1487468481 | `position`, `organisation`, `duration`, `description` |

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/deepak4728/Portfolio.git
cd Portfolio
```

### 2. Set Up Google Sheets
1. Create a Google Sheet with the tabs listed above
2. Publish the sheet: **File > Share > Publish to web > CSV**
3. Copy the sheet ID from the URL
4. Update `SHEET_ID` in `app.js`:
   ```javascript
   const SHEET_ID = "YOUR_SHEET_ID_HERE";
   ```

### 3. Configure Content
- Fill your Google Sheets with your content
- For profile images, use Google Drive links converted to:
  ```
  https://lh3.googleusercontent.com/d/FILE_ID=w400
  ```

### 4. Deploy
#### GitHub Pages (Recommended)
1. Push to GitHub
2. Go to **Settings > Pages**
3. Select branch: `main`, folder: `/root`
4. Save and visit `https://yourusername.github.io/Portfolio`

#### Local Development
```bash
# Use a local server (required for CORS)
python -m http.server 8000
# or
npx serve
```

Visit `http://localhost:8000`

## 📁 Project Structure
```
Portfolio/
├── index.html          # Main HTML structure
├── portfolio.css       # Styles and animations
├── app.js             # Dynamic data fetching and rendering
├── static/
│   └── profile.jpg    # Fallback profile image
├── README.md          # Documentation
└── .gitignore
```

## 🎨 Customization

### Colors
Edit CSS custom properties in `portfolio.css`:
```css
:root {
  --primary: #007bff;
  --secondary: #0056b3;
  --text: #0f172a;
  --bg: #f7f9fc;
}
```

### Animations
Adjust timing in keyframes:
```css
@keyframes circle-left-move {
  /* Customize duration, easing */
}
```

### Layout
Modify responsive breakpoints:
```css
@media (max-width: 768px) { /* ... */ }
```

## 🔧 Troubleshooting

### Images Not Loading
- Ensure Google Drive links use `lh3.googleusercontent.com` format
- Check file sharing permissions (Anyone with link can view)

### Data Not Updating
- Verify sheet is published as CSV
- Check Console (F12) for fetch errors
- Confirm GID matches sheet tab

### CORS Issues
- Must use a web server (not `file://`)
- Use GitHub Pages or local server

## 🤝 Contributing
Contributions welcome! 

1. Fork the repo
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push: `git push origin feature/AmazingFeature`
5. Open a Pull Request

## 📄 License
This project is open source and available under the [MIT License](LICENSE).

## 📧 Contact
- **Portfolio**: [Your Live Site URL]
- **Email**: dy19363@gmail.com 
- **LinkedIn**: 
- **GitHub**: [@deepak4728](https://github.com/deepak4728)

## 🙏 Acknowledgments
- Google Sheets API for backend-as-a-service
- GitHub Pages for hosting
- Inspiration from modern portfolio designs

---

**Made with ❤️ and ☕ | Last Updated: January 2026**

⭐ Star this repo if you find it helpful!
