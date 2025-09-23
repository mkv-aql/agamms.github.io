function setLanguage(lang) {
  document.querySelectorAll("[data-en]").forEach(el => {
    el.innerHTML = el.getAttribute(`data-${lang}`);
  });
  localStorage.setItem("portfolio_lang", lang);
}

document.addEventListener("DOMContentLoaded", () => {
  const switchEl = document.getElementById("langSwitch");

  // Initial language: saved -> browser -> EN
  const saved = localStorage.getItem("portfolio_lang");
  const initial = saved || (navigator.language?.startsWith("de") ? "de" : "en");
  setLanguage(initial);

  // Reflect in slider (unchecked = EN, checked = DE)
  if (switchEl) switchEl.checked = initial === "de";

  // Toggle handler
  switchEl?.addEventListener("change", (e) => {
    const lang = e.target.checked ? "de" : "en";
    setLanguage(lang);
  });
});
