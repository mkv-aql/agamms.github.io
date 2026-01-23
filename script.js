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

// DACH region countries: Germany (DE), Austria (AT), Switzerland (CH)
const DACH_COUNTRIES = ['DE', 'AT', 'CH'];

/**
 * Helper function to fetch with timeout
 */
async function fetchWithTimeout(url, options = {}, timeout = 3000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Detects if user is from DACH region using free geolocation API
 * Returns: { isDACH: boolean, country: string | null, method: string }
 */
async function detectDACHRegion() {
  // Method 1: Try free ipapi.co API (no authentication required)
  try {
    const response = await fetchWithTimeout('https://ipapi.co/json/', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    }, 3000);
    
    if (response.ok) {
      const data = await response.json();
      const countryCode = data.country_code;
      
      if (countryCode && DACH_COUNTRIES.includes(countryCode)) {
        return { isDACH: true, country: countryCode, method: 'ipapi' };
      } else if (countryCode) {
        return { isDACH: false, country: countryCode, method: 'ipapi' };
      }
    }
  } catch (error) {
    console.log('ipapi.co failed, trying fallback:', error.message);
  }

  // Method 2: Fallback to ip-api.com (free, no auth) - using HTTPS
  try {
    const response = await fetchWithTimeout('https://ip-api.com/json/?fields=countryCode', {
      method: 'GET',
    }, 3000);
    
    if (response.ok) {
      const data = await response.json();
      const countryCode = data.countryCode;
      
      if (countryCode && DACH_COUNTRIES.includes(countryCode)) {
        return { isDACH: true, country: countryCode, method: 'ip-api' };
      } else if (countryCode) {
        return { isDACH: false, country: countryCode, method: 'ip-api' };
      }
    }
  } catch (error) {
    console.log('ip-api.com failed, trying browser language fallback:', error.message);
  }

  // Method 3: Fallback to browser language detection
  const browserLang = navigator.language || navigator.userLanguage || '';
  const langCode = browserLang.split('-')[0].toUpperCase();
  
  // Check if browser language is German
  if (browserLang.toLowerCase().startsWith('de')) {
    // If browser is set to German, assume DACH (conservative approach)
    return { isDACH: true, country: null, method: 'browser-lang' };
  }
  
  // Method 4: Final fallback - check if any navigator.languages includes German
  if (navigator.languages) {
    for (const lang of navigator.languages) {
      if (lang.toLowerCase().startsWith('de')) {
        return { isDACH: true, country: null, method: 'browser-languages' };
      }
    }
  }

  // Default: Not DACH (safer to show English only)
  return { isDACH: false, country: null, method: 'default' };
}

/**
 * Shows or hides the language toggle based on DACH region
 */
function toggleLanguageSwitchVisibility(show) {
  const langToggle = document.querySelector('.lang-toggle');
  if (langToggle) {
    if (show) {
      langToggle.classList.remove('hidden');
    } else {
      langToggle.classList.add('hidden');
    }
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log("Script loaded successfully");
  const switchEl = document.getElementById("langSwitch");
  const themeSwitchEl = document.getElementById("themeSwitch");
  const langToggle = document.querySelector('.lang-toggle');
  
  console.log("Language switch found:", switchEl);
  console.log("Theme switch found:", themeSwitchEl);

  // Hide language toggle initially to prevent flickering
  // It will be shown only if user is from DACH region
  if (langToggle) {
    langToggle.classList.add('hidden');
  }

  // Detect DACH region
  const regionInfo = await detectDACHRegion();
  console.log("Region detection:", regionInfo);

  // Show/hide language toggle based on region
  if (regionInfo.isDACH) {
    // DACH region: Show toggle and allow language switching
    toggleLanguageSwitchVisibility(true);
    
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
  } else {
    // Non-DACH region: Hide toggle and force English
    toggleLanguageSwitchVisibility(false);
    
    // Force English and clear any saved German preference
    setLanguage("en");
    if (localStorage.getItem("portfolio_lang") === "de") {
      localStorage.removeItem("portfolio_lang");
    }
    
    // Disable the switch if it exists
    if (switchEl) {
      switchEl.checked = false;
      switchEl.disabled = true;
    }
  }

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
