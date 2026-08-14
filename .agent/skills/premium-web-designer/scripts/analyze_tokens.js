/**
 * Analyze Design Tokens from a webpage.
 * This script extracts colors, typography, and spacing tokens.
 */
(() => {
  const tokens = {
    colors: {},
    typography: {
      families: new Set(),
      scales: {}
    },
    spacing: new Set(),
    glassmorphism: []
  };

  // 1. Extract CSS Variables (Custom Properties)
  const rootStyles = getComputedStyle(document.documentElement);
  const allSheets = Array.from(document.styleSheets);
  
  allSheets.forEach(sheet => {
    try {
      const rules = Array.from(sheet.cssRules || []);
      rules.forEach(rule => {
        if (rule.style) {
          Array.from(rule.style).forEach(prop => {
            if (prop.startsWith('--')) {
              const val = rule.style.getPropertyValue(prop).trim();
              if (val) tokens.colors[prop] = val;
            }
          });
        }
      });
    } catch (e) {
      // Cross-origin stylesheet access restricted
    }
  });

  // 2. Sample computed styles from key elements
  const elements = document.querySelectorAll('h1, h2, h3, p, a, button, section, div[class*="hero"], div[class*="card"]');
  elements.forEach(el => {
    const style = getComputedStyle(el);
    
    // Typography
    const font = style.fontFamily.split(',')[0].replace(/['"]/g, '');
    tokens.typography.families.add(font);
    
    const size = style.fontSize;
    const tag = el.tagName.toLowerCase();
    if (!tokens.typography.scales[tag]) tokens.typography.scales[tag] = new Set();
    tokens.typography.scales[tag].add(size);

    // Glassmorphism indicators
    const backdrop = style.backdropFilter || style.webkitBackdropFilter;
    if (backdrop && backdrop !== 'none') {
      tokens.glassmorphism.push({
        tag: tag,
        className: el.className,
        backdropFilter: backdrop,
        backgroundColor: style.backgroundColor
      });
    }

    // Spacing (padding/margin)
    ['padding', 'margin'].forEach(side => {
      ['Top', 'Bottom', 'Left', 'Right'].forEach(dir => {
        const val = style[side + dir];
        if (val && val !== '0px') tokens.spacing.add(val);
      });
    });
  });

  // Convert Sets to Arrays for JSON
  tokens.typography.families = Array.from(tokens.typography.families);
  Object.keys(tokens.typography.scales).forEach(tag => {
    tokens.typography.scales[tag] = Array.from(tokens.typography.scales[tag]).sort();
  });
  tokens.spacing = Array.from(tokens.spacing).sort();

  console.log('--- DESIGN TOKENS ANALYSIS ---');
  console.log(JSON.stringify(tokens, null, 2));
  return tokens;
})();
