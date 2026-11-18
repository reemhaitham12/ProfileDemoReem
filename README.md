# Personal Profile – Reem Haitham

A single-page personal developer profile built with **HTML5, CSS3, Vanilla JavaScript, Bootstrap 5 and Bootstrap Icons**.
The CV opens inside a responsive PDF.js viewer with scroll, zoom and a **Download** button in its toolbar.

## Run it in VS Code
1. Open the `personal-profile` folder in VS Code.
2. Install the **Live Server** extension (Ritwick Dey).
3. Right-click `index.html` → **Open with Live Server**.

> The PDF viewer needs a local web server (Live Server). Opening `index.html` by double-click (`file://`) blocks the PDF from loading.
> An internet connection is needed for the CDN files (Bootstrap, Bootstrap Icons, PDF.js, Inter font).

## Replace your files
| What | File | Notes |
|---|---|---|
| Cover banner | `assets/cover-banner.png` | **1584 × 396 px (4:1)**, the LinkedIn cover size. Keep important content toward the right/centre so it survives cropping on phones. |
| Profile photo | `assets/profile-photo.jpg` | Any size. It is cropped to a square with `object-fit: cover`. |
| CV | `assets/cv.pdf` | Your original PDF. It is displayed as-is, and the toolbar Download button saves this same file (name kept, e.g. `cv.pdf`; rename the file to change the downloaded name). |

The files currently in `assets/` are **placeholders** cropped from your reference screenshot. Replace all three.

## Add your links
Open `js/script.js` and edit `profileLinks` at the top:

```js
const profileLinks = {
  linkedin:  "https://www.linkedin.com/in/your-name",
  github:    "https://github.com/your-username",
  portfolio: "https://your-portfolio.com",
  whatsapp:  "201001234567",          // country code + number, digits only
  email:     "you@example.com"
};
```
- Leave a value as `""` to hide its button.
- Values starting with `YOUR_` are placeholders: the button shows but does nothing.
- External links open in a new tab with `rel="noopener noreferrer"`; email uses `mailto:`.

## Notes
- The **QR Code** button (from your reference) shows a QR for the page's current address. Once the site is deployed, it will encode your live URL.
- The download icon exists only inside the CV viewer toolbar, not on the main page.
- Structure: `index.html`, `css/style.css`, `js/script.js`, `assets/`.
