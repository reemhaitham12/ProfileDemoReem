/* ==========================================================
   Personal Profile – Reem Haitham
   1) Centralized links config   2) Link buttons
   3) PDF.js CV viewer (scroll, zoom, download)   4) QR code
   ========================================================== */

/* ----------------------------------------------------------
   1) CENTRALIZED CONFIGURATION – edit ONLY this block
   - linkedin / github / portfolio : full URL (https://...)
   - whatsapp : number with country code, digits only (e.g. "201001234567")
   - email    : email address
   - Leave a value as "" to hide that button.
   - Values starting with "YOUR_" are placeholders: the button shows,
     but does nothing until you replace the value.
   ---------------------------------------------------------- */
const profileLinks = {
  linkedin:  "https://www.linkedin.com/in/reem-haitham/",
  github:    "https://github.com/reemhaitham12",
  portfolio: "https://portfolio-reem-haitham.vercel.app/",
  whatsapp:  "+20 12 20978902",
  email:     "reemhaitham69@gmail.com"
};

/* Path of your CV (shown in the modal and used by the toolbar download button) */
const CV_PATH = "assets/ReemHaitham_CV.pdf";

/* Display settings for each button (order = display order) */
const linkDefinitions = [
  { key: "linkedin",  label: "LinkedIn",      icon: "bi-linkedin",     build: (v) => v },
  { key: "github",    label: "GitHub",        icon: "bi-github",       build: (v) => v },
  { key: "portfolio", label: "Portfolio",     icon: "bi-briefcase",    build: (v) => v },
  { key: "whatsapp",  label: "WhatsApp",      icon: "bi-whatsapp",     build: (v) => "https://wa.me/" + String(v).replace(/\D/g, "") },
  { key: "email",     label: "Contact Email", icon: "bi-envelope",     build: (v) => "mailto:" + v, internal: true }
];

const isPlaceholder = (v) => /^YOUR_/i.test(v);

/* ----------------------------------------------------------
   2) Build the link buttons
   ---------------------------------------------------------- */
function renderLinks() {
  const list = document.getElementById("linksList");
  if (!list) return;

  linkDefinitions.forEach((def) => {
    const value = (profileLinks[def.key] || "").trim();
    if (!value) return; // empty -> hide the button

    const a = document.createElement("a");
    a.className = "link-btn";
    a.innerHTML =
      '<i class="bi ' + def.icon + ' link-btn__icon" aria-hidden="true"></i>' +
      '<span class="link-btn__label">' + def.label + "</span>" +
      '<i class="bi bi-box-arrow-up-right link-btn__ext" aria-hidden="true"></i>';

    if (isPlaceholder(value)) {
      // Not configured yet: keep the button but make it inert
      a.href = "#";
      a.setAttribute("aria-disabled", "true");
      a.title = "Add your " + def.label + " in js/script.js (profileLinks)";
      a.addEventListener("click", (e) => e.preventDefault());
    } else {
      a.href = def.build(value);
      if (!def.internal) { // mailto opens the mail app, others open a new tab
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      }
      a.setAttribute("aria-label", def.label + (def.internal ? "" : " (opens in a new tab)"));
    }
    list.appendChild(a);
  });
}

/* ----------------------------------------------------------
   3) PDF viewer (PDF.js) – view only, no download / print UI
   ---------------------------------------------------------- */
const PDFJS_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const viewer = {
  pdf: null,
  zoom: 1,            // multiplier on top of "fit to width"
  min: 0.5,
  max: 3,
  step: 0.25,
  loading: false,
  renderId: 0         // cancels outdated renders
};

function initPdfViewer() {
  const modalEl = document.getElementById("cvModal");
  const container = document.getElementById("pdfContainer");
  const pagesEl = document.getElementById("pdfPages");
  const statusEl = document.getElementById("pdfStatus");
  const zoomInBtn = document.getElementById("zoomIn");
  const zoomOutBtn = document.getElementById("zoomOut");
  const zoomLabel = document.getElementById("zoomLevel");
  if (!modalEl || typeof pdfjsLib === "undefined") {
    if (statusEl) { statusEl.textContent = "The PDF viewer could not be loaded. Check your internet connection."; statusEl.classList.add("error"); }
    return;
  }
  pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;

  const setStatus = (msg, isError) => {
    statusEl.textContent = msg || "";
    statusEl.hidden = !msg;
    statusEl.classList.toggle("error", !!isError);
  };

  const updateZoomUi = () => {
    zoomLabel.textContent = Math.round(viewer.zoom * 100) + "%";
    zoomOutBtn.disabled = viewer.zoom <= viewer.min;
    zoomInBtn.disabled = viewer.zoom >= viewer.max;
  };

  // Render every page as a canvas, sized to the modal width * zoom
  async function renderAll() {
    if (!viewer.pdf) return;
    const id = ++viewer.renderId;
    const available = container.clientWidth - parseFloat(getComputedStyle(container).paddingLeft) * 2;
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const frag = document.createDocumentFragment();

    for (let n = 1; n <= viewer.pdf.numPages; n++) {
      const page = await viewer.pdf.getPage(n);
      if (id !== viewer.renderId) return;

      const base = page.getViewport({ scale: 1 });
      const cssScale = (available / base.width) * viewer.zoom;
      const vp = page.getViewport({ scale: cssScale * dpr });

      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(vp.width);
      canvas.height = Math.floor(vp.height);
      canvas.style.width = Math.floor(vp.width / dpr) + "px";
      canvas.style.height = Math.floor(vp.height / dpr) + "px";
      canvas.setAttribute("role", "img");
      canvas.setAttribute("aria-label", "CV page " + n + " of " + viewer.pdf.numPages);

      const wrap = document.createElement("div");
      wrap.className = "pdf-page";
      wrap.appendChild(canvas);
      frag.appendChild(wrap);

      await page.render({ canvasContext: canvas.getContext("2d"), viewport: vp }).promise;
      if (id !== viewer.renderId) return;
    }
    if (id === viewer.renderId) { pagesEl.replaceChildren(frag); setStatus(""); }
  }

  async function loadPdf() {
    if (viewer.pdf || viewer.loading) return;
    viewer.loading = true;
    setStatus("Loading CV…");
    try {
      viewer.pdf = await pdfjsLib.getDocument(CV_PATH).promise;
      await renderAll();
    } catch (err) {
      console.warn("CV could not be loaded:", err);
      setStatus("The CV could not be loaded. Make sure assets/cv.pdf exists and the site is served from a web server (e.g. VS Code Live Server).", true);
    } finally {
      viewer.loading = false;
    }
  }

  const changeZoom = (delta) => {
    const next = Math.min(viewer.max, Math.max(viewer.min, Math.round((viewer.zoom + delta) * 100) / 100));
    if (next === viewer.zoom) return;
    viewer.zoom = next;
    updateZoomUi();
    renderAll();
  };

  zoomInBtn.addEventListener("click", () => changeZoom(viewer.step));
  zoomOutBtn.addEventListener("click", () => changeZoom(-viewer.step));

  // Load the first time the modal opens; reset zoom each time
  modalEl.addEventListener("shown.bs.modal", () => {
    viewer.zoom = 1; updateZoomUi(); container.scrollTop = 0;
    viewer.pdf ? renderAll() : loadPdf();
  });

  // Re-fit when the window is resized / rotated while open
  let t;
  window.addEventListener("resize", () => {
    if (!modalEl.classList.contains("show")) return;
    clearTimeout(t); t = setTimeout(renderAll, 200);
  });

  // Download button: serves the ORIGINAL file untouched, keeping its filename
  const downloadBtn = document.getElementById("downloadCv");
  if (downloadBtn) {
    downloadBtn.href = CV_PATH;
    downloadBtn.setAttribute("download", CV_PATH.split("/").pop());
  }

  updateZoomUi();
}

/* ----------------------------------------------------------
   4) QR code (encodes the current page address)
   ---------------------------------------------------------- */
function initQr() {
  const modalEl = document.getElementById("qrModal");
  const btn = document.getElementById("qrBtn");
  const box = document.getElementById("qrCode");
  if (!modalEl || typeof QRCode === "undefined") { if (btn) btn.hidden = true; return; }

  let built = false;
  modalEl.addEventListener("shown.bs.modal", () => {
    if (built) return;
    new QRCode(box, { text: window.location.href.split("#")[0], width: 200, height: 200, correctLevel: QRCode.CorrectLevel.M });
    built = true;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderLinks();
  initPdfViewer();
  initQr();
});
