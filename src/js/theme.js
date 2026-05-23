/**
 * GridVibe Theme Manager Module
 * Handles dynamic switching of premium CSS themes and coordinates color changes with Chart.js.
 */

export const THEMES = {
  MIDNIGHT: 'midnight',
  LIGHT: 'light',
  CYBER: 'cyber'
};

// Default theme configuration
let currentTheme = THEMES.MIDNIGHT;
const themeCallbacks = [];

/**
 * Initialize theme from localStorage or default
 */
export function initTheme() {
  const savedTheme = localStorage.getItem('gridvibe-theme');
  if (savedTheme && Object.values(THEMES).includes(savedTheme)) {
    applyTheme(savedTheme);
  } else {
    applyTheme(THEMES.MIDNIGHT);
  }
  setupThemeListeners();
}

/**
 * Get current active theme
 */
export function getCurrentTheme() {
  return currentTheme;
}

/**
 * Register callback to run when theme changes (e.g. to re-draw charts with correct grid/text colors)
 * @param {Function} callback 
 */
export function onThemeChange(callback) {
  if (typeof callback === 'function') {
    themeCallbacks.push(callback);
  }
}

/**
 * Apply selected theme to HTML document and save preference
 * @param {string} theme 
 */
export function applyTheme(theme) {
  if (!Object.values(THEMES).includes(theme)) return;
  
  currentTheme = theme;
  
  // Set data-theme attribute on root element
  if (theme === THEMES.MIDNIGHT) {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
  
  // Update theme option UI active states
  const options = document.querySelectorAll('.theme-option');
  options.forEach(opt => {
    const optTheme = opt.getAttribute('data-theme');
    if (optTheme === theme || (theme === THEMES.MIDNIGHT && optTheme === 'midnight')) {
      opt.classList.add('active');
    } else {
      opt.classList.remove('active');
    }
  });

  // Save to localStorage
  localStorage.setItem('gridvibe-theme', theme);

  // Trigger all registered theme change callbacks
  themeCallbacks.forEach(cb => {
    try {
      cb(theme, getThemeColorTokens(theme));
    } catch (err) {
      console.error('Error in theme change callback:', err);
    }
  });
}

/**
 * Setup DOM event listeners for theme selectors
 */
function setupThemeListeners() {
  const themeOptions = document.querySelectorAll('.theme-option');
  themeOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      const selectedTheme = opt.getAttribute('data-theme');
      applyTheme(selectedTheme);
    });
  });
}

/**
 * Retrieve exact hex/hsl values for charts to align with CSS themes
 * @param {string} theme 
 * @returns {Object} Chart style tokens
 */
export function getThemeColorTokens(theme = currentTheme) {
  switch (theme) {
    case THEMES.LIGHT:
      return {
        background: '#f0f4f9',
        panelBg: 'rgba(255, 255, 255, 0.7)',
        textMain: '#1f2937',
        textMuted: '#6b7280',
        primary: '#6366f1',
        secondary: '#db2777',
        gridLine: 'rgba(31, 41, 55, 0.08)',
        cardBorder: 'rgba(209, 213, 219, 0.5)',
        glow: 'rgba(99, 102, 241, 0.15)'
      };
      
    case THEMES.CYBER:
      return {
        background: '#020704',
        panelBg: 'rgba(4, 28, 16, 0.7)',
        textMain: '#ecfdf5',
        textMuted: '#6ee7b7',
        primary: '#10b981',
        secondary: '#06b6d4',
        gridLine: 'rgba(16, 185, 129, 0.1)',
        cardBorder: 'rgba(16, 185, 129, 0.25)',
        glow: 'rgba(16, 185, 129, 0.3)'
      };
      
    case THEMES.MIDNIGHT:
    default:
      return {
        background: '#080c16',
        panelBg: 'rgba(13, 20, 38, 0.7)',
        textMain: '#f3f4f6',
        textMuted: '#9ca3af',
        primary: '#8b5cf6',
        secondary: '#ec4899',
        gridLine: 'rgba(255, 255, 255, 0.05)',
        cardBorder: 'rgba(43, 64, 116, 0.4)',
        glow: 'rgba(139, 92, 246, 0.25)'
      };
  }
}
