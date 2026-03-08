
import type React from 'react';
import type { Category } from '../types';

/**
 * MTG Mana Color → CSS Gradient utility.
 * Used as fallback when no Scryfall art is available.
 */

/** Official MTG mana color hex values (muted for dark mode) */
const MANA_COLOR_MAP: Record<string, string> = {
  W: '#E8E4D4', // Plains — warm white
  U: '#0E68AB', // Island — deep blue
  B: '#2B1A10', // Swamp — dark brown/black
  R: '#D3202A', // Mountain — bold red
  G: '#00733E', // Forest — rich green
};

/** Selectable mana colors for the manual picker UI */
export const MANA_COLORS = [
  { code: 'W', label: 'White', hex: '#E8E4D4' },
  { code: 'U', label: 'Blue', hex: '#0E68AB' },
  { code: 'B', label: 'Black', hex: '#2B1A10' },
  { code: 'R', label: 'Red', hex: '#D3202A' },
  { code: 'G', label: 'Green', hex: '#00733E' },
] as const;

/**
 * Generate a CSS gradient string from an array of MTG color codes.
 *
 * @param colors - Array of MTG color codes: 'W', 'U', 'B', 'R', 'G'
 * @returns CSS linear-gradient string
 *
 * @example
 * manaGradient(['R', 'W']) → "linear-gradient(135deg, #D3202Aaa 0%, #E8E4D4aa 100%)"
 * manaGradient([])         → "linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)"
 */
export function manaGradient(colors: string[]): string {
  if (!colors || colors.length === 0) {
    // Colorless: neutral dark gradient
    return 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)';
  }

  if (colors.length === 1) {
    const c = MANA_COLOR_MAP[colors[0]] || '#2a2a2a';
    return `linear-gradient(135deg, ${c}cc 0%, ${c}66 100%)`;
  }

  // Multi-color: evenly distributed stops with transparency
  const stops = colors.map((color, i) => {
    const hex = MANA_COLOR_MAP[color] || '#2a2a2a';
    const pct = Math.round((i / (colors.length - 1)) * 100);
    return `${hex}99 ${pct}%`;
  });

  return `linear-gradient(135deg, ${stops.join(', ')})`;
}

/** Build inline style for Ionic IonItem card art / color background */
export function getCardBgStyle(card: { artUrl?: string; colors?: string[] }): React.CSSProperties | undefined {
  if (card.artUrl) {
    return {
      '--background': `linear-gradient(90deg, rgba(22,27,34,0.88) 0%, rgba(22,27,34,0.55) 100%), url(${card.artUrl}) center/cover`,
    } as React.CSSProperties;
  }
  if (card.colors && card.colors.length > 0) {
    return {
      '--background': manaGradient(card.colors),
    } as React.CSSProperties;
  }
  return undefined;
}

/** Build a category CSS class from a prefix (e.g. 'action-btn', 'cat-chip') */
export function getCategoryClass(prefix: string, cat: Category): string {
  const slug = cat.toLowerCase().replace(/\s+/g, '-');
  return `${prefix} ${prefix}-${slug}`;
}
