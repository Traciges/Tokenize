
import type { ScryfallCardResult } from '../types';

const SCRYFALL_API = 'https://api.scryfall.com';
const MIN_REQUEST_INTERVAL = 75; // ms — Scryfall asks for 50-100ms between calls

let lastRequestTime = 0;

/**
 * Rate-limited fetch wrapper for Scryfall API.
 * Enforces minimum interval between requests.
 */
async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_REQUEST_INTERVAL) {
    await new Promise((r) => setTimeout(r, MIN_REQUEST_INTERVAL - elapsed));
  }
  lastRequestTime = Date.now();
  return fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  });
}

/**
 * Extract image_uris from a Scryfall card object.
 * Handles double-faced cards where image_uris is on card_faces[0].
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractImageUris(card: any): { art_crop: string; normal: string } | null {
  if (card.image_uris) {
    return { art_crop: card.image_uris.art_crop, normal: card.image_uris.normal };
  }
  if (card.card_faces?.[0]?.image_uris) {
    return {
      art_crop: card.card_faces[0].image_uris.art_crop,
      normal: card.card_faces[0].image_uris.normal,
    };
  }
  return null;
}

/**
 * Transform a raw Scryfall card object into our ScryfallCardResult.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toCardResult(card: any): ScryfallCardResult | null {
  const images = extractImageUris(card);
  if (!images) return null;

  return {
    name: card.name,
    artCropUrl: images.art_crop,
    normalUrl: images.normal,
    colors: card.colors || card.color_identity || [],
    set: card.set || '',
    collectorNumber: card.collector_number || '',
  };
}

/**
 * Search for cards by query. Returns up to 20 results.
 */
export async function searchCards(query: string): Promise<ScryfallCardResult[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const url = `${SCRYFALL_API}/cards/search?q=${encodeURIComponent(query)}&unique=cards&order=released&dir=desc`;
    const response = await rateLimitedFetch(url);

    if (!response.ok) return [];

    const data = await response.json();
    const results: ScryfallCardResult[] = [];

    for (const card of data.data || []) {
      if (results.length >= 20) break;
      const result = toCardResult(card);
      if (result) {
        results.push(result);
      }
    }

    return results;
  } catch {
    // Network error or offline — return empty
    return [];
  }
}

/**
 * Autocomplete card names. Returns up to 20 name suggestions.
 */
export async function autocompleteCardName(query: string): Promise<string[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const url = `${SCRYFALL_API}/cards/autocomplete?q=${encodeURIComponent(query)}`;
    const response = await rateLimitedFetch(url);

    if (!response.ok) return [];

    const data = await response.json();
    return data.data || [];
  } catch {
    return [];
  }
}

/**
 * Get a single card by fuzzy name match.
 */
export async function getCardByName(name: string): Promise<ScryfallCardResult | null> {
  if (!name || name.trim().length < 2) return null;

  try {
    const url = `${SCRYFALL_API}/cards/named?fuzzy=${encodeURIComponent(name)}`;
    const response = await rateLimitedFetch(url);

    if (!response.ok) return null;

    const card = await response.json();
    return toCardResult(card);
  } catch {
    return null;
  }
}
