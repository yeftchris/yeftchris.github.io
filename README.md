# Yefta Christian Nathaniel — Portfolio

Dark & techy personal portfolio website built from scratch.

## 📁 Structure

```
portfolio/
├── index.html              ← Main HTML (entry point)
├── css/
│   └── style.css           ← All styles + design tokens
├── js/
│   └── main.js             ← Cursor, typewriter, scroll reveal, modal, projects loader
├── data/
│   └── projects.json       ← Project data (edit here to add/update projects)
├── docs/
│   └── CV_Yefta_Christian_Nathaniel.pdf   ← Put your CV here!
└── assets/
    ├── images/
    │   ├── profile.jpg             ← Your photo (recommended 400×500px)
    │   ├── project-mmps.jpg        ← Project thumbnails
    │   ├── project-humidity.jpg
    │   ├── project-scada.jpg
    │   ├── project-rfid.jpg
    │   └── project-ldr.jpg
    └── icons/
        └── favicon.svg
```

## 🚀 Quickstart

1. **Just open `index.html`** in your browser — no build tool needed.
2. For GitHub Pages: push the whole folder to your `gh-pages` branch or root of a repo named `yeftchrs.github.io`.

## ✏️ Customizing

### Add your photo
Put `profile.jpg` in `assets/images/` (recommended: 4:5 ratio, min 400×500px).

### Update projects
Edit `data/projects.json`. Each project has:
- `title`, `subtitle`, `category`, `tags`, `year`, `status`
- `summary` (short, shown on card)
- `description` (long, shown in modal)
- `highlights` (bullet list in modal)
- `github` and `demo` links (leave `""` to hide the button)

Categories available (for filter buttons):
- `"PLC & Automation"`
- `"Embedded Systems"`
- `"Web & SCADA"`
- `"Circuit Design"`

### Add your CV
Place your PDF as `docs/CV_Yefta_Christian_Nathaniel.pdf`.

### Update contact info
Search for `yeftachrs@gmail.com` in `index.html` and replace with your actual email.

## 🎨 Design Tokens (css/style.css)

| Token | Value | Usage |
|-------|-------|-------|
| `--cyan` | `#00e5ff` | Primary accent |
| `--violet` | `#7b61ff` | Gradient secondary |
| `--bg-base` | `#090d14` | Page background |
| `--bg-card` | `#121929` | Card background |
| `--font-display` | Space Mono | Headings, labels |
| `--font-body` | Space Grotesk | Body text |

## 📱 Responsive

- Desktop: full layout with sidebar, grid
- Tablet (≤900px): stacked about section, contact
- Mobile (≤700px): hamburger nav, single-column grid
