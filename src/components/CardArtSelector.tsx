
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonSearchbar,
  IonSpinner,
  IonIcon,
} from '@ionic/react';
import { colorPalette } from 'ionicons/icons';
import { searchCards } from '../services/scryfall';
import { MANA_COLORS } from '../utils/manaColors';
import WIcon from '../../assets/W.webp';
import UIcon from '../../assets/U.webp';
import BIcon from '../../assets/B.webp';
import RIcon from '../../assets/R.webp';
import GIcon from '../../assets/G.webp';
import CIcon from '../../assets/C.webp';

const MANA_ICONS: Record<string, string> = { W: WIcon, U: UIcon, B: BIcon, R: RIcon, G: GIcon, C: CIcon };
import type { ScryfallCardResult } from '../types';

interface CardArtSelectorProps {
  isOpen: boolean;
  onDismiss: () => void;
  onSelect: (artUrl: string, colors: string[], cardName?: string) => void;
  initialSearch?: string;
}

const CardArtSelector: React.FC<CardArtSelectorProps> = ({
  isOpen,
  onDismiss,
  onSelect,
  initialSearch,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ScryfallCardResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pre-fill search when modal opens with a name
  useEffect(() => {
    if (isOpen && initialSearch && initialSearch.trim().length >= 2) {
      setQuery(initialSearch);
      performSearch(initialSearch);
    }
    if (!isOpen) {
      // Reset state on close
      setQuery('');
      setResults([]);
      setSearched(false);
      setSelectedColors([]);
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const cards = await searchCards(searchQuery);
      setResults(cards);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearchInput = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      performSearch(value);
    }, 400);
  };

  const handleSelectCard = (card: ScryfallCardResult) => {
    onSelect(card.artCropUrl, card.colors, card.name);
  };

  const toggleColor = (code: string) => {
    setSelectedColors((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleUseColors = () => {
    onSelect('', selectedColors);
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDismiss}>
      <IonHeader className="mtg-header">
        <IonToolbar>
          <IonTitle>Search Card Art</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onDismiss}>Cancel</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="art-selector-content">
          {/* Search Bar */}
          <IonSearchbar
            value={query}
            placeholder="Search card name..."
            debounce={0}
            onIonInput={(e) => handleSearchInput(e.detail.value || '')}
            className="art-searchbar"
          />

          {/* Loading Spinner */}
          {loading && (
            <div className="art-loading">
              <IonSpinner name="crescent" color="primary" />
              <p>Searching Scryfall...</p>
            </div>
          )}

          {/* Results Grid */}
          {!loading && results.length > 0 && (
            <div className="art-results-grid">
              {results.map((card, idx) => (
                <div
                  key={`${card.name}-${card.set}-${card.collectorNumber}-${idx}`}
                  className="art-result-item"
                  onClick={() => handleSelectCard(card)}
                >
                  <img
                    src={card.normalUrl}
                    alt={card.name}
                    loading="lazy"
                  />
                  <span className="art-result-name">{card.name}</span>
                  <span className="art-result-set">{card.set.toUpperCase()}</span>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && searched && results.length === 0 && (
            <div className="art-no-results">
              <p>No cards found. Try a different search or use manual colors below.</p>
            </div>
          )}

          {/* Manual Color Picker */}
          <div className="manual-color-section">
            <div className="color-section-header">
              <IonIcon icon={colorPalette} />
              <span className="section-label">Manual Mana Colors</span>
            </div>
            <p className="color-hint">Select colors for a gradient background (works offline)</p>
            <div className="mana-color-picker">
              {MANA_COLORS.map((c) => (
                <button
                  key={c.code}
                  className={`mana-orb ${selectedColors.includes(c.code) ? 'selected' : ''}`}
                  onClick={() => toggleColor(c.code)}
                  title={c.label}
                  type="button"
                >
                  <img src={MANA_ICONS[c.code]} alt={c.label} className="mana-orb-icon" />
                </button>
              ))}
            </div>
            {selectedColors.length > 0 && (
              <IonButton
                expand="block"
                fill="solid"
                className="use-colors-btn"
                onClick={handleUseColors}
              >
                Use {selectedColors.map((c) => {
                  const found = MANA_COLORS.find((m) => m.code === c);
                  return found?.label;
                }).join(' / ')} Colors
              </IonButton>
            )}
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default CardArtSelector;
