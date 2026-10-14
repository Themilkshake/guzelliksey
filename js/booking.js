/* ==========================================================================
   guzelliksey — Randevu Sihirbazı (booking.js)
   3 adım: Hizmet & Süre → Tarih & Saat → Bilgiler & Onay
   Bağımlılık: site.js içindeki SERVICES, CATEGORIES, formatPrice, maskPhone
   ========================================================================== */
"use strict";

const booking = {
  step: 1,
  service: null,
  date: null,
  time: null,

  /* --- Adım göstergesi --- */
  render() {
    document.querySelectorAll(".wizard__step").forEach((el, i) =>
      el.classList.toggle("is-active", i + 1 === this.step));
    document.querySelectorAll(".wizard__dot").forEach((el, i) =>
      el.classList.toggle("is-active", i + 1 <= this.step));
    const back = document.getElementById("wiz-back");
    const next = document.getElementById("wiz-next");
    if (back) back.style.visibility = this.step === 1 ? "hidden" : "visible";
    if (next) next.textContent = this.step === 3 ? "Randevuyu Onayla" : "Devam Et →";
    if (this.step === 3) this.renderSummary();
  },

  /* --- Adım 1: kategori + hizmet --- */
  initServiceStep() {
    const catWrap = document.getElementById("wiz-cats");
    const svcWrap = document.getElementById("wiz-services");
    if (!catWrap || !svcWrap) return;

    CATEGORIES.forEach((c, i) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "chip"; b.textContent = c.label;
      b.setAttribute("aria-pressed", String(i === 0));
      b.addEventListener("click", () => {
        catWrap.querySelectorAll(".chip").forEach((x) => x.setAttribute("aria-pressed", "false"));
        b.setAttribute("aria-pressed", "true");
        this.renderServices(c.id, svcWrap);
      });
      catWrap.appendChild(b);
    });
    this.renderServices("hepsi", svcWrap);

    // ?hizmet= parametresi ile ön seçim (görselden dönüşüm akışı)
    const pre = new URLSearchParams(location.search).get("hizmet");
    if (pre) {
      const found = SERVICES.find((s) => s.id === pre);
      if (found) this.selectService(found, svcWrap);
    }
  },

  renderServices(catId, wrap) {
    wrap.innerHTML = "";
    const list = catId === "hepsi" ? SERVICES : SERVICES.filter((s) => s.cat === catId);
    list.forEach((s) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "slot"; b.style.minHeight = "56px";
      b.textContent = s.name;
      b.setAttribute("aria-pressed", String(this.service && this.service.id === s.id));
      b.addEventListener("click", () => this.selectService(s, wrap));
      wrap.appendChild(b);
    });
  },

  selectService(s, wrap) {
    this.service = s;
    if (wrap) wrap.querySelectorAll(".slot").forEach((x) =>
      x.setAttribute("aria-pressed", x.textContent === s.name ? "true" : "false"));
    const info = document.getElementById("wiz-svc-info");
    if (info) info.textContent = `${s.name} · ~${s.duration} dk · ${formatPrice(s.price)}`;
  },

  /* --- Adım 2: takvim + saat pilleri --- */
  initDateStep() {
    const cal = document.getElementById("wiz-dates");
    const slots = document.getElementById("wiz-times");
    if (!cal || !slots) return;

    const today = new Date();
    for (let i = 1; i <= 10; i++) { // 10 günlük pencere (Pazar kapalı varsayımı)
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const b = document.createElement("button");
      b.type = "button"; b.className = "slot";
      const closed = d.getDay() === 0;
      b.disabled = closed;
      b.textContent = d.toLocaleDateString("tr-TR", { day: "2-digit", month: "short", weekday: "short" });
      b.dataset.date = d.toISOString().slice(0, 10);
      if (!closed) b.addEventListener("click", () => {
        this.date = d;
        cal.querySelectorAll(".slot").forEach((x) => x.setAttribute("aria-pressed", "false"));
        b.setAttribute("aria-pressed", "true");
        this.renderTimes(slots);
      });
      cal.appendChild(b);
    }
    this.renderTimes(slots);
  },

  renderTimes(wrap) {
    wrap.innerHTML = "";
    const times = ["09:00", "10:30", "12:00", "13:30", "15:00", "16:30", "18:00"];
    times.forEach((t, idx) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "slot"; b.textContent = t;
      b.disabled = idx % 4 === 2; // örnek dolu saat simülasyonu (VARSAYIM: gerçek takvim entegrasyonu gerekir)
      b.setAttribute("aria-pressed", String(this.time === t));
      b.addEventListener("click", () => {
        this.time = t;
        wrap.querySelectorAll(".slot").forEach((x) => x.setAttribute("aria-pressed", "false"));
        b.setAttribute("aria-pressed", "true");
      });
      wrap.appendChild(b);
    });
  },

  /* --- Adım 3: özet + onay --- */
  renderSummary() {
    const box = document.getElementById("wiz-summary");
    if (!box || !this.service) return;
    box.innerHTML = `
      <h3>Randevu Özeti</h3>
      <dl>
        <dt>Hizmet</dt><dd>${this.service.name}</dd>
        <dt>Süre</dt><dd class="num">~${this.service.duration} dk</dd>
        <dt>Tahmini Fiyat</dt><dd class="num">${formatPrice(this.service.price)}</dd>
        <dt>Tarih</dt><dd>${this.date ? this.date.toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long" }) : "—"}</dd>
        <dt>Saat</dt><dd class="num">${this.time || "—"}</dd>
      </dl>`;
  },

  submit() {
    const form = document.getElementById("wiz-form");
    if (!this.service) { alert("Lütfen adım 1'den hizmet seçin."); this.step = 1; this.render(); return; }
    if (!this.date || !this.time) { alert("Lütfen tarih ve saat seçin."); this.step = 2; this.render(); return; }
    const fields = form.querySelectorAll("input");
    let ok = true;
    fields.forEach((f) => {
      if (f.type === "checkbox" && f.hasAttribute("required") && !f.checked) ok = false;
      if (f.type !== "checkbox" && f.hasAttribute("required") && !f.value.trim()) ok = false;
      if (f.type === "tel" && f.value.replace(/\D/g, "").length < 12) ok = false;
      const err = f.parentElement.querySelector(".field__error");
      if (err) err.classList.add("is-visible");
      f.setAttribute("aria-invalid", "true");
      if (ok) { f.setAttribute("aria-invalid", "false"); if (err) err.classList.remove("is-visible"); }
    });
    if (!ok) return;

    // Başarı ekranı + .ics indirme + WhatsApp onay linki
    document.getElementById("wiz-panel").style.display = "none";
    const done = document.getElementById("wiz-done");
    done.classList.add("is-visible");
    this.buildICS();
    const wa = document.getElementById("wiz-wa");
    if (wa) wa.href = "https://wa.me/905000000000?text=" + encodeURIComponent(
      `Randevu talebim: ${this.service.name} — ${this.date.toLocaleDateString("tr-TR")} ${this.time}. Ad: ${document.getElementById("w-name").value}`);
  },

  buildICS() {
    const link = document.getElementById("wiz-ics");
    if (!link || !this.service || !this.date) return;
    const start = this.date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const endD = new Date(this.date.getTime() + this.service.duration * 60000);
    const end = endD.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT",
      `SUMMARY:Güzelliksey — ${this.service.name}`, `DTSTART:${start}`, `DTEND:${end}`,
      "DESCRIPTION:Randevu hatırlatması", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    link.href = "data:text/calendar;charset=utf-8," + encodeURIComponent(ics);
    link.download = "guzelliksey-randevu.ics";
  },

  init() {
    const panel = document.getElementById("wiz-panel");
    if (!panel) return;
    this.initServiceStep();
    this.initDateStep();
    document.getElementById("wiz-next").addEventListener("click", () => {
      if (this.step < 3) { this.step += 1; this.render(); }
      else this.submit();
    });
    document.getElementById("wiz-back").addEventListener("click", () => {
      if (this.step > 1) { this.step -= 1; this.render(); } // geri gitmek seçimi korur
    });
    if (window.initPhoneMasks) window.initPhoneMasks(document.getElementById("wiz-form"));
    this.render();
  }
};

window.initPhoneMasks = typeof initPhoneMasks === "function" ? initPhoneMasks : window.initPhoneMasks;
document.addEventListener("DOMContentLoaded", () => booking.init());
