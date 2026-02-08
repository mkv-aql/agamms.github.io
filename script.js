function setLanguage(lang) {
  const isNonDACH = document.body.getAttribute('data-region') === 'non-dach';
  const isDACH = document.body.getAttribute('data-region') === 'dach';
  
  document.querySelectorAll("[data-en]").forEach(el => {
    // Skip elements with data-non-dach if we're in non-DACH region
    if (isNonDACH && el.hasAttribute('data-non-dach')) {
      return; // Don't update - let region-based content handle it
    }
    // Skip elements with data-dach if we're in DACH region
    if (isDACH && el.hasAttribute('data-dach')) {
      return; // Don't update - let region-based content handle it
    }
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

/**
 * Sets region-based content based on DACH region
 */
function setRegionBasedContent(isDACH) {
  // Set data attribute on body for CSS targeting if needed
  document.body.setAttribute('data-region', isDACH ? 'dach' : 'non-dach');
  
  // Update all elements with region-specific content
  document.querySelectorAll("[data-non-dach], [data-dach]").forEach(el => {
    if (isDACH) {
      // DACH region: Use data-dach if available, otherwise let language system handle it
      if (el.hasAttribute('data-dach')) {
        el.style.display = '';
        el.innerHTML = el.getAttribute('data-dach');
      } else if (el.hasAttribute('data-non-dach')) {
        // Element has non-DACH content but we're in DACH - let language system handle it
        el.style.display = '';
        // Don't set innerHTML here - let the language system handle it
      }
    } else {
      // Non-DACH region: Show non-DACH content, override language attributes
      if (el.hasAttribute('data-non-dach')) {
        el.style.display = '';
        el.innerHTML = el.getAttribute('data-non-dach');
      } else if (el.hasAttribute('data-dach')) {
        // Element has DACH content but we're in non-DACH - use language system
        el.style.display = '';
        // Don't set innerHTML here - let the language system handle it
      }
    }
  });
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

  // [PRODUCTION] Use detected region only (for live site / no override)
  const isDACH = regionInfo.isDACH;
  // [LOCAL DEV] Force DACH on localhost (comment the line above, uncomment the 2 lines below)
//   const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
//   const isDACH = isLocalhost ? true : regionInfo.isDACH;

  // Set region-based content
  setRegionBasedContent(isDACH);

  // Show/hide language toggle based on region
  if (isDACH) {
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
  const skillsNarrow = window.matchMedia('(max-width: 768px)');

  function restoreSkillsContentOrder() {
    if (col2Content && col3Content && skillsContainer) {
      skillsContainer.appendChild(col2Content);
      skillsContainer.appendChild(col3Content);
    }
  }

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

        // Narrow screen: show skills list directly below the selected category
        if (skillsNarrow.matches) {
          const visibleContent = column === '1' ? col2Content : col3Content;
          category.after(visibleContent);
        }
      } else {
        // Closed category; on narrow screen restore content containers to grid area
        if (skillsNarrow.matches) {
          restoreSkillsContentOrder();
        }
      }
    });
  });

  // When resizing to wide, put content back so grid layout works
  skillsNarrow.addEventListener('change', (e) => {
    if (!e.matches) {
      restoreSkillsContentOrder();
    }
  });

  // Project category filtering functionality
  const projectCategories = document.querySelectorAll('.project-category');
  const projects = document.querySelectorAll('.project[data-category]');
  const projectCountCurrent = document.getElementById('project-count-current');
  const projectCountTotal = document.getElementById('project-count-total');

  // Set total count (only once on page load)
  if (projectCountTotal) {
    projectCountTotal.textContent = projects.length;
  }

  function filterProjects(category) {
    // Update active button
    projectCategories.forEach(btn => {
      if (btn.getAttribute('data-category') === category) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    let visibleCount = 0;

    // Show/hide projects based on category
    projects.forEach(project => {
      const projectCategories = project.getAttribute('data-category').split(' ');
      if (projectCategories.includes(category)) {
        project.style.display = '';
        visibleCount++;
        // Don't override opacity - let CSS handle under-construction styling
      } else {
        project.style.display = 'none';
      }
    });

    // Update the visible count
    if (projectCountCurrent) {
      projectCountCurrent.textContent = visibleCount;
    }
  }

  // Add click handlers to category buttons
  projectCategories.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.getAttribute('data-category');
      filterProjects(category);
    });
  });

  // Initialize with "top" category (My Top Projects)
  filterProjects('top');
});
