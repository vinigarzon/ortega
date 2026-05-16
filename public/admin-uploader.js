/**
 * /admin-uploader.js — convierte inputs de imagen en un picker con preview.
 *
 * Para cualquier <input> de tipo text cuyo `name` contenga "image", "photo",
 * "logo", "favicon", "featuredImage", "backgroundImage", "ogImage",
 * "teamImage" (o que tenga `data-upload="1"`), reemplaza la UI por:
 *
 *   ┌─────────────────────────────────────┐
 *   │  [ thumbnail 96x96 ]   [ Subir ]    │
 *   │                       [ Pegar URL ] │
 *   │   /uploads/team/foto.jpg            │   ← solo si hay valor
 *   └─────────────────────────────────────┘
 *
 * El <input> queda oculto pero conserva su `name` y `value` para que el
 * formulario lo envíe. Cambiar el valor (via subida o pegado) dispara
 * `input` + `change` para que cualquier listener reaccione.
 */
(function () {
  const NAME_HINTS = ["image", "photo", "logo", "favicon", "featuredimage", "backgroundimage", "ogimage", "teamimage"];

  function shouldEnhance(el) {
    if (!(el instanceof HTMLInputElement)) return false;
    // el.type devuelve "text" cuando no hay atributo type — eso está bien.
    const t = el.type;
    if (t !== "text" && t !== "url" && t !== "") return false;
    if (el.dataset.uploadInited === "1") return false;
    if (el.dataset.upload === "0") return false;
    if (el.dataset.upload === "1") return true;
    const hay = ((el.name || "") + "|" + (el.id || "") + "|" + (el.dataset.path || "")).toLowerCase();
    return NAME_HINTS.some((h) => hay.includes(h));
  }

  function enhance(input) {
    input.dataset.uploadInited = "1";

    // Wrapper sustituye al input visualmente.
    const wrap = document.createElement("div");
    wrap.className = "u-picker";
    wrap.innerHTML = `
      <div class="u-thumb"><div class="u-placeholder">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
        </svg>
      </div></div>
      <div class="u-body">
        <div class="u-actions">
          <button type="button" class="u-btn u-upload">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Subir imagen
          </button>
          <button type="button" class="u-btn u-secondary u-url">URL</button>
          <button type="button" class="u-btn u-ghost u-clear" title="Quitar imagen">✕</button>
        </div>
        <div class="u-meta"></div>
      </div>
    `;

    input.parentNode.insertBefore(wrap, input);
    input.style.display = "none";
    wrap.appendChild(input);

    const thumb = wrap.querySelector(".u-thumb");
    const meta = wrap.querySelector(".u-meta");

    function setMeta(val) {
      if (!val) {
        thumb.innerHTML = `<div class="u-placeholder">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
          </svg>
        </div>`;
        meta.innerHTML = `<span class="u-empty">Sin imagen</span>`;
      } else {
        thumb.innerHTML = `<img src="${val}" alt="">`;
        const short = val.length > 50 ? "…" + val.slice(-50) : val;
        meta.innerHTML = `<code title="${val}">${short}</code>`;
      }
    }
    setMeta(input.value);

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.style.display = "none";
    wrap.appendChild(fileInput);

    wrap.querySelector(".u-upload").addEventListener("click", () => fileInput.click());

    wrap.querySelector(".u-url").addEventListener("click", () => {
      const v = prompt("Pega la URL de la imagen:", input.value || "");
      if (v === null) return;
      input.value = v.trim();
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      setMeta(input.value);
    });

    wrap.querySelector(".u-clear").addEventListener("click", () => {
      if (!input.value) return;
      input.value = "";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      setMeta("");
    });

    fileInput.addEventListener("change", async () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      const btn = wrap.querySelector(".u-upload");
      const origHtml = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = "<span>Subiendo…</span>";

      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) { alert("Error: " + (data.error || "no se pudo subir")); return; }
        input.value = data.url;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
        setMeta(input.value);
      } catch {
        alert("Error de red al subir el archivo.");
      } finally {
        btn.disabled = false;
        btn.innerHTML = origHtml;
        fileInput.value = "";
      }
    });

    // Drag & drop sobre el thumb
    thumb.addEventListener("dragover", (e) => { e.preventDefault(); thumb.classList.add("drag"); });
    thumb.addEventListener("dragleave", () => thumb.classList.remove("drag"));
    thumb.addEventListener("drop", (e) => {
      e.preventDefault(); thumb.classList.remove("drag");
      const f = e.dataTransfer?.files?.[0]; if (f) { fileInput.files = e.dataTransfer.files; fileInput.dispatchEvent(new Event("change")); }
    });

    // Sincronizar si el input cambia por otro código (e.g. auto-fill desde YouTube)
    input.addEventListener("input", () => setMeta(input.value));
    input.addEventListener("change", () => setMeta(input.value));
    const obs = new MutationObserver(() => setMeta(input.value));
    obs.observe(input, { attributes: true, attributeFilter: ["value"] });
  }

  function scan(root) {
    // Query *todos* los inputs y filtramos en JS — `input[type="text"]` no matchea
    // cuando el atributo type no está escrito explícitamente (default-text).
    (root || document).querySelectorAll("input").forEach((el) => {
      if (shouldEnhance(el)) enhance(el);
    });
  }

  // CSS inyectado para que no dependa del layout
  const css = `
    .u-picker {
      display: flex; gap: 12px; align-items: flex-start;
      background: #fafaf7; border: 1px solid #e7e7e0; border-radius: 10px;
      padding: 10px; margin: 4px 0;
    }
    .u-thumb {
      width: 92px; height: 92px; border-radius: 8px; overflow: hidden;
      background: #eef0f9; flex-shrink: 0; position: relative;
      border: 2px solid transparent; transition: border-color .15s;
    }
    .u-thumb.drag { border-color: #434c8c; background: #dde1f1; }
    .u-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .u-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #9ba0b0; }
    .u-placeholder svg { width: 28px; height: 28px; }
    .u-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px; }
    .u-actions { display: flex; gap: 6px; flex-wrap: wrap; }
    .u-btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 8px 14px; border-radius: 7px; font-size: 13px; font-weight: 500;
      font-family: inherit; cursor: pointer; border: 1px solid transparent;
      background: #434c8c; color: #fff; transition: all .12s;
    }
    .u-btn:hover { background: #363d70; }
    .u-btn:disabled { opacity: .55; cursor: wait; }
    .u-btn svg { width: 15px; height: 15px; }
    .u-secondary { background: #fff; color: #434c8c; border-color: #e7e7e0; }
    .u-secondary:hover { background: #fafaf7; }
    .u-ghost { background: transparent; color: #9ba0b0; padding: 8px 10px; }
    .u-ghost:hover { background: #fee2e2; color: #b91c1c; }
    .u-meta code { font-size: 11px; color: #6b7081; background: transparent; padding: 0; }
    .u-meta .u-empty { font-size: 12px; color: #9ba0b0; font-style: italic; }
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => scan());
  } else {
    scan();
  }
  const mo = new MutationObserver((mutations) => {
    for (const m of mutations) m.addedNodes.forEach((n) => { if (n.nodeType === 1) scan(n); });
  });
  mo.observe(document.body, { childList: true, subtree: true });
})();
