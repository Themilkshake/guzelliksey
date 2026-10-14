/* ==========================================================================
   guzelliksey — Ortak JS (site.js)
   Modüller: nav, akordeon, öncesi/sonrası, karusel, lightbox,
             telefon maskesi, form doğrulama, çerez bandı, hizmet verisi
   ========================================================================== */
"use strict";

/* ---------- Hizmet verisi (içerik planından; fiyatlar VARSAYIM — teyit gerekli) ---------- */
const SERVICES = [
  { id: "cilt-bakimi", cat: "cilt", name: "Cilt Bakımı", duration: 60, price: 1200,
    desc: "Kişiye özel cilt analiziyle uygulanan derinlemesine temizlik, nemlendirme ve canlandırma protokolü.",
    subs: ["Medikal cilt bakımı", "Peeling uygulaması", "Nem maskesi bakımı"] },
  { id: "lazer-epilasyon", cat: "lazer", name: "Lazer Epilasyon", duration: 30, price: 900,
    desc: "FDA onaylı lazer teknolojisiyle, uzman gözetiminde konforlu ve kalıcı sonuçlara yönelik uygulama.",
    subs: ["Tüm vücut", "Bölgesel (bacak, koltuk altı, bikini)", "Yüz bölgesi"] },
  { id: "makyaj", cat: "makyaj", name: "Makyaj", duration: 45, price: 1500,
    desc: "Düğün, nişan ve özel günler için profesyonel makyaj; isterseniz yerinde uygulama seçeneği.",
    subs: ["Gelin makyajı", "Gün makyajı", "Kapalı alan makyajı"] },
  { id: "saç", cat: "saç", name: "Saç Bakım & Şekillendirme", duration: 60, price: 800,
    desc: "Kesim, renk, balyaj ve keratin bakım ile saçınıza kişiye özel tasarım.",
    subs: ["Kesim & fön", "Renk / balyaj", "Keratin bakım"] },
  { id: "tirnak", cat: "tirnak", name: "Manikür & Pedikür", duration: 75, price: 650,
    desc: "Hijyenik ortamda klasik ve jel oje seçenekli el-ayak bakımı.",
    subs: ["Klasik manikür", "Jel oje", "Spa pedikür"] },
  { id: "bölgesel-incelme", cat: "spa", name: "Bölgesel İncelme & Masaj", duration: 60, price: 1100,
    desc: "Uzman eşliğinde bölgesel form uygulamaları ve rahatlatıcı masaj programları.",
    subs: ["Lenfatik drenaj", "Zayıflama masaji", "Aromaterapi masajı"] }
];

const CATEGORIES = [
  { id: "hepsi", label: "Tümü" },
  { id: "cilt", label: "Cilt Bakımı" },
  { id: "lazer", label: "Lazer Epilasyon" },
  { id: "makyaj", label: "Makyaj" },
  { id: "saç", label: "Saç" },
  { id: "tirnak", label: "Tırnak" },
  { id: "spa", label: "Masaj & Spa" }
];

const formatPrice = (n) => new Intl.NumberFormat("tr-TR").format(n) + " ₺";

/* ---------- Mobil navigasyon ---------- */
function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const drawer = document.querySelector(".nav-drawer");
  if (!toggle || !drawer) return;
  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    drawer.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  };
  toggle.addEventListener("click", () =>
    setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  drawer.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
}

/* ---------- Akordeon (SSS + hizmet listesi) ---------- */
function initAccordions(root = document) {
  root.querySelectorAll(".accordion__button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      const panel = document.getElementById(btn.getAttribute("aria-controls"));
      btn.setAttribute("aria-expanded", String(!expanded));
      if (panel) panel.style.maxHeight = expanded ? "0px" : panel.scrollHeight + "px";
    });
  });
}

/* ---------- Öncesi / Sonrası karşılaştırma ---------- */
function initBASliders() {
  document.querySelectorAll(".ba-slider").forEach((slider) => {
    const handle = slider.querySelector(".ba-slider__handle");
    if (!handle) return;
    let dragging = false;
    const setPos = (clientX) => {
      const rect = slider.getBoundingClientRect();
      const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
      slider.style.setProperty("--ba-pos", pct + "%");
      handle.setAttribute("aria-valuenow", String(Math.round(pct)));
    };
    slider.addEventListener("pointerdown", (e) => { dragging = true; slider.setPointerCapture(e.pointerId); setPos(e.clientX); });
    slider.addEventListener("pointermove", (e) => { if (dragging) setPos(e.clientX); });
    ["pointerup", "pointercancel"].forEach((ev) => slider.addEventListener(ev, () => (dragging = false)));
    handle.addEventListener("keydown", (e) => {
      const cur = parseFloat(getComputedStyle(slider).getPropertyValue("--ba-pos")) || 50;
      if (e.key === "ArrowLeft") slider.style.setProperty("--ba-pos", Math.max(0, cur - 5) + "%");
      if (e.key === "ArrowRight") slider.style.setProperty("--ba-pos", Math.min(100, cur + 5) + "%");
    });
  });
}

/* ---------- Galeri lightbox ---------- */
function initLightbox() {
  const box = document.querySelector(".lightbox");
  if (!box) return;
  const cap = box.querySelector(".lightbox__caption");
  const close = () => { box.classList.remove("is-open"); };
  document.querySelectorAll("[data-lightbox]").forEach((item) =>
    item.addEventListener("click", () => {
      if (cap) cap.textContent = item.dataset.lightbox;
      box.classList.add("is-open");
    }));
  box.addEventListener("click", (e) => { if (e.target === box || e.target.closest(".lightbox__close")) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
}

/* ---------- Telefon maskesi: +90 ___ ___ __ __ ---------- */
function maskPhone(value) {
  const d = value.replace(/\D/g, "").replace(/^90/, "").slice(0, 10);
  let out = "+90";
  if (d.length) out += " " + d.slice(0, 3);
  if (d.length > 3) out += " " + d.slice(3, 6);
  if (d.length > 6) out += " " + d.slice(6, 8);
  if (d.length > 8) out += " " + d.slice(8, 10);
  return out;
}
function initPhoneMasks(scope = document) {
  scope.querySelectorAll('input[type="tel"]').forEach((input) => {
    input.addEventListener("input", () => { input.value = maskPhone(input.value); });
    input.addEventListener("focus", () => { if (!input.value) input.value = "+90 "; });
  });
}

/* ---------- Form doğrulama ---------- */
function validateField(field) {
  const errEl = field.parentElement.querySelector(".field__error");
  let ok = true;
  if (field.hasAttribute("required") && !field.value.trim()) ok = false;
  if (ok && field.type === "tel" && field.value.trim())
    ok = field.value.replace(/\D/g, "").length >= 12;
  if (ok && field.type === "email" && field.value.trim())
    ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
  if (ok && field.type === "checkbox" && field.hasAttribute("required"))
    ok = field.checked;
  field.setAttribute("aria-invalid", String(!ok));
  if (errEl) { errEl.classList.toggle("is-visible", !ok); }
  return ok;
}
function initForms() {
  document.querySelectorAll("form[data-validate]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fields = form.querySelectorAll("input, select, textarea");
      let allOk = true;
      fields.forEach((f) => { if (!validateField(f)) allOk = false; });
      if (!allOk) {
        const firstBad = form.querySelector('[aria-invalid="true"]');
        if (firstBad) firstBad.focus();
        return;
      }
      const success = form.parentElement.querySelector(".form-success");
      form.style.display = "none";
      if (success) { success.classList.add("is-visible"); success.focus(); }
    });
    form.querySelectorAll("input, select, textarea").forEach((f) =>
      f.addEventListener("blur", () => { if (f.value || f.getAttribute("aria-invalid") === "true") validateField(f); }));
  });
}

/* ---------- Çerez bandı ---------- */
function initCookieBar() {
  const bar = document.querySelector(".cookie-bar");
  if (!bar) return;
  try {
    if (!localStorage.getItem("gs-cookie-consent")) bar.classList.add("is-visible");
  } catch (_) { bar.classList.add("is-visible"); }
  bar.querySelectorAll("[data-cookie-choice]").forEach((btn) =>
    btn.addEventListener("click", () => {
      try { localStorage.setItem("gs-cookie-consent", btn.dataset.cookieChoice); } catch (_) {}
      bar.classList.remove("is-visible");
    }));
}

/* ---------- Başlat ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initAccordions();
  initBASliders();
  initLightbox();
  initPhoneMasks();
  initForms();
  initCookieBar();
});
