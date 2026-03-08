
export type MathType = 'multiplier' | 'additive' | 'floor';

export type Category = 'Tokens' | 'Counters' | 'Damage' | 'Card Draw' | 'Attack Triggers' | 'ETB';

export const CATEGORIES: Category[] = [
  'Tokens',
  'Counters',
  'Damage',
  'Card Draw',
  'Attack Triggers',
  'ETB',
];

export const QUICKSTART_ID = 'quickstart';

export interface ModifierCard {
  id: string;
  name: string;
  mathType: MathType;
  value: number; // e.g., 2 for multiplier, 1 for additive
  isDynamicValue?: boolean;
  categories: Category[];
  artUrl?: string;       // Scryfall art_crop URL
  colors?: string[];     // MTG color identity: 'W' | 'U' | 'B' | 'R' | 'G'
}

export interface Deck {
  id: string;
  name: string;
  modifiers: ModifierCard[];
  artUrl?: string;       // Scryfall art_crop URL (e.g. Commander art)
  colors?: string[];     // MTG color identity
}

export interface AppState {
  decks: Deck[];
  activeBoard: Record<string, number>; // cardId -> count
}

export interface ScryfallCardResult {
  name: string;
  artCropUrl: string;     // image_uris.art_crop — landscape, for backgrounds
  normalUrl: string;      // image_uris.normal — portrait, for selection grid
  colors: string[];       // colors array from Scryfall ('W','U','B','R','G')
  set: string;            // set code for disambiguation
  collectorNumber: string;
}
