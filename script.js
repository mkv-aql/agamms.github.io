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
  console.log("Script loaded successfully");
  const switchEl = document.getElementById("langSwitch");
  const themeSwitchEl = document.getElementById("themeSwitch");
  
  console.log("Language switch found:", switchEl);
  console.log("Theme switch found:", themeSwitchEl);

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
  console.log("Initial theme:", initialTheme);
  setTheme(initialTheme);

  // Reflect in theme slider (unchecked = light, checked = dark)
  if (themeSwitchEl) {
    themeSwitchEl.checked = initialTheme === "dark";
    console.log("Theme switch set to:", themeSwitchEl.checked);
  }

  // Theme toggle handler
  themeSwitchEl?.addEventListener("change", (e) => {
    const theme = e.target.checked ? "dark" : "light";
    console.log("Theme changed to:", theme);
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

  // Skills categories functionality with sliding
  const skillCategories = document.querySelectorAll('.skill-category');
  const skillsContainer = document.querySelector('.skills-container');
  const col2Content = document.getElementById('skills-content-col2');
  const col3Content = document.getElementById('skills-content-col3');

  skillCategories.forEach(category => {
    category.addEventListener('click', () => {
      const targetTab = category.getAttribute('data-tab');
      const column = category.getAttribute('data-column');
      
      // Toggle active state
      const isActive = category.classList.contains('active');
      
      // Close all categories and reset container
      skillCategories.forEach(c => c.classList.remove('active'));
      skillsContainer.classList.remove('col1-active', 'col2-active');
      
      // Hide all skill contents
      col2Content.querySelectorAll('.skill-tab-content').forEach(c => c.classList.remove('active'));
      col3Content.querySelectorAll('.skill-tab-content').forEach(c => c.classList.remove('active'));
      
      // Open clicked category if it wasn't active
      if (!isActive) {
        category.classList.add('active');
        
        if (column === '1') {
          // Col1 clicked: slide col2 to col3, show skills in col2
          skillsContainer.classList.add('col1-active');
          const content = col2Content.querySelector(`.skill-tab-content[data-content="${targetTab}"]`);
          if (content) {
            content.classList.add('active');
          }
        } else if (column === '2') {
          // Col2 clicked: show skills in col3, no sliding
          skillsContainer.classList.add('col2-active');
          const content = col3Content.querySelector(`.skill-tab-content[data-content="${targetTab}"]`);
          if (content) {
            content.classList.add('active');
          }
        }
      }
    });
  });
});
