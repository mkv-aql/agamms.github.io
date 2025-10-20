function setLanguage(lang) {
  document.querySelectorAll("[data-en]").forEach(el => {
    el.innerHTML = el.getAttribute(`data-${lang}`);
  });
  localStorage.setItem("portfolio_lang", lang);
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem("portfolio_theme", theme);
}

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

document.addEventListener("DOMContentLoaded", () => {
  const switchEl = document.getElementById("langSwitch");
  const themeSwitchEl = document.getElementById("themeSwitch");

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

  // Theme initialization: saved -> system -> light
  const savedTheme = localStorage.getItem("portfolio_theme");
  const systemTheme = getSystemTheme();
  const initialTheme = savedTheme || systemTheme;
  setTheme(initialTheme);

  // Reflect in theme slider (unchecked = light, checked = dark)
  if (themeSwitchEl) themeSwitchEl.checked = initialTheme === "dark";

  // Theme toggle handler
  themeSwitchEl?.addEventListener("change", (e) => {
    const theme = e.target.checked ? "dark" : "light";
    setTheme(theme);
  });

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    // Only update if user hasn't manually set a preference
    if (!localStorage.getItem("portfolio_theme")) {
      const newTheme = e.matches ? 'dark' : 'light';
      setTheme(newTheme);
      if (themeSwitchEl) themeSwitchEl.checked = newTheme === "dark";
    }
  });
});
