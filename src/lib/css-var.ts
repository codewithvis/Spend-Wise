// This is a client-side utility
'use client';

// A map to cache the CSS variables
const cssVarCache = new Map<string, string>();

/**
 * Gets the computed value of a CSS custom property.
 * @param propertyName - The name of the CSS custom property (e.g., '--primary').
 * @returns The computed value of the property.
 */
export function getCSSVariableValue(propertyName: string): string {
  const fullPropertyName = `--${propertyName}`;
  
  if (typeof window === 'undefined') {
    // Return a sensible default or empty string during SSR
    return '';
  }

  // Check cache first
  if (cssVarCache.has(fullPropertyName)) {
    return cssVarCache.get(fullPropertyName)!;
  }

  // Get from DOM
  const value = getComputedStyle(document.documentElement).getPropertyValue(fullPropertyName).trim();
  
  // Cache the result
  if (value) {
    cssVarCache.set(fullPropertyName, value);
  }

  return value;
}
