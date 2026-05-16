/**
 * /admin-ui.js — Helpers compartidos del admin: Toast + ConfirmDialog + Accordion.
 *
 * Carga desde AdminLayout. Expone:
 *   window.toast(kind, title, message?)
 *   window.confirmDialog(opts) -> Promise<boolean>
 */
(function () {
  // ===== TOAST =====
  function ensureRegion() {
    let r = document.getElementById("toast-region");
    if (!r) {
      r = document.createElement("div");
      r.id = "toast-region";
      document.body.appendChild(r);
    }
    return r;
  }
  window.toast = function (kind, title, message) {
    const region = ensureRegion();
    const el = document.createElement("div");
    el.className = "toast toast-" + (kind || "info");
    el.innerHTML = `
      <div style="flex:1; min-width:0">
        <strong>${escapeHTML(title || "")}</strong>
        ${message ? `<small>${escapeHTML(message)}</small>` : ""}
      </div>
    `;
    region.appendChild(el);
    const ttl = kind === "error" ? 5500 : 3000;
    setTimeout(() => { el.classList.add("is-hiding"); setTimeout(() => el.remove(), 250); }, ttl);
  };

  // ===== CONFIRM DIALOG =====
  window.confirmDialog = function (opts) {
    opts = opts || {};
    return new Promise((resolve) => {
      const back = document.createElement("div");
      back.className = "dialog-backdrop";
      back.innerHTML = `
        <div class="dialog" role="dialog" aria-modal="true">
          <h3>${escapeHTML(opts.title || "¿Confirmar?")}</h3>
          <p>${escapeHTML(opts.message || "Esta acción no se puede deshacer.")}</p>
          <div class="dialog__actions">
            <button type="button" class="btn btn-ghost" data-action="cancel">${escapeHTML(opts.cancelLabel || "Cancelar")}</button>
            <button type="button" class="btn ${opts.danger === false ? "btn-primary" : "btn-danger"}" data-action="confirm">${escapeHTML(opts.confirmLabel || "Eliminar")}</button>
          </div>
        </div>
      `;
      function close(result) {
        back.style.animation = "fade-in .15s reverse";
        setTimeout(() => back.remove(), 140);
        resolve(result);
      }
      back.addEventListener("click", (e) => {
        const a = e.target.closest("[data-action]");
        if (a) return close(a.dataset.action === "confirm");
        if (e.target === back) close(false);
      });
      document.addEventListener("keydown", function esc(e) {
        if (e.key === "Escape") { document.removeEventListener("keydown", esc); close(false); }
      });
      document.body.appendChild(back);
      back.querySelector('[data-action="confirm"]')?.focus();
    });
  };

  // ===== ACCORDIONS (delegated click) =====
  document.addEventListener("click", (e) => {
    const head = e.target.closest(".accordion__head");
    if (head) {
      head.closest(".accordion")?.classList.toggle("is-open");
    }
  });

  function escapeHTML(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[c]));
  }
})();
