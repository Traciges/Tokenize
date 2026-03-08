import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonButtons,
  IonBackButton,
  IonGrid,
  IonRow,
  IonCol,
  IonModal,
  IonReorderGroup,
  IonReorder,
  IonFooter,
  IonFab,
  IonFabButton,
  IonInput,
  IonSelect,
  IonSelectOption,
} from '@ionic/react';
import type { ItemReorderEventDetail } from '@ionic/react';
import { useParams } from 'react-router-dom';
import { add, remove, flash, refresh, imageOutline, closeCircle } from 'ionicons/icons';
import { useAppStore } from '../store/useAppStore';
import { manaGradient } from '../utils/manaColors';
import CardArtSelector from '../components/CardArtSelector';
import type { Category, ModifierCard, MathType } from '../types';

const categories: Category[] = [
  'Tokens',
  'Counters',
  'Damage',
  'Card Draw',
  'Attack Triggers',
  'ETB',
];

const getCategoryBtnClass = (cat: Category): string => {
  const map: Record<Category, string> = {
    'Tokens': 'action-btn action-btn-tokens',
    'Counters': 'action-btn action-btn-counters',
    'Damage': 'action-btn action-btn-damage',
    'Card Draw': 'action-btn action-btn-card-draw',
    'Attack Triggers': 'action-btn action-btn-attack-triggers',
    'ETB': 'action-btn action-btn-etb',
  };
  return map[cat];
};

/** Build inline style for card art / color background */
const getCardBgStyle = (card: { artUrl?: string; colors?: string[] }): React.CSSProperties | undefined => {
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
};

const Play: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const deck = useAppStore((state) => state.decks.find((d) => d.id === id));
  const { activeBoard, updateCardCount, clearActiveBoard, addModifierToDeck } = useAppStore();

  const [calculationModal, setCalculationModal] = useState<{
    isOpen: boolean;
    category: Category | null;
    baseValue: number;
  }>({ isOpen: false, category: null, baseValue: 0 });

  const [activeEffects, setActiveEffects] = useState<ModifierCard[]>([]);

  // Add Card State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showArtSelector, setShowArtSelector] = useState(false);
  const [cardData, setCardData] = useState({
    name: '',
    mathType: 'multiplier' as MathType,
    value: 2,
    categories: [] as Category[],
    artUrl: undefined as string | undefined,
    colors: undefined as string[] | undefined,
  });

  if (!deck) return <IonPage><IonContent>Deck not found</IonContent></IonPage>;

  const sortByOptimization = (a: ModifierCard, b: ModifierCard) => {
    if (a.mathType === 'additive' && b.mathType === 'multiplier') return -1;
    if (a.mathType === 'multiplier' && b.mathType === 'additive') return 1;
    return 0;
  };

  const handleActionClick = (category: Category) => {
    const effects: ModifierCard[] = [];
    deck.modifiers.forEach((card) => {
      const count = activeBoard[card.id] || 0;
      for (let i = 0; i < count; i++) {
        effects.push({ ...card, id: `${card.id}-${i}` });
      }
    });

    const filteredEffects = effects.filter((c) => c.categories.includes(category));
    const optimized = [...filteredEffects].sort(sortByOptimization);
    setActiveEffects(optimized);
    setCalculationModal({ isOpen: true, category, baseValue: 1 });
  };

  const calculateResult = (base: number, effects: ModifierCard[]) => {
    let current = base;
    effects.forEach((eff) => {
      if (eff.mathType === 'multiplier') {
        current *= eff.value;
      } else {
        current += eff.value;
      }
    });
    return current;
  };

  const handleReorder = (event: CustomEvent<ItemReorderEventDetail>) => {
    const newEffects = [...activeEffects];
    const item = newEffects.splice(event.detail.from, 1)[0];
    newEffects.splice(event.detail.to, 0, item);
    setActiveEffects(newEffects);
    event.detail.complete();
  };

  const autoOptimize = () => {
    const optimized = [...activeEffects].sort(sortByOptimization);
    setActiveEffects(optimized);
  };

  const handleOpenAdd = () => {
    setCardData({ name: '', mathType: 'multiplier', value: 2, categories: [], artUrl: undefined, colors: undefined });
    setShowAddModal(true);
  };

  const handleSaveCard = () => {
    if (cardData.name && cardData.categories.length > 0) {
      addModifierToDeck(deck.id, cardData);
      setShowAddModal(false);
    }
  };

  const handleArtSelect = (artUrl: string, colors: string[], cardName?: string) => {
    setCardData({
      ...cardData,
      artUrl: artUrl || undefined,
      colors: colors.length > 0 ? colors : undefined,
      ...(cardName ? { name: cardName } : {}),
    });
    setShowArtSelector(false);
  };

  return (
    <IonPage>
      <IonHeader className="mtg-header">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>
            {deck.name}
            <span className="mtg-subtitle">Active Game</span>
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => clearActiveBoard()}>
              <IonIcon icon={refresh} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {/* Category Action Buttons */}
        <div className="action-grid">
          <IonGrid>
            <IonRow>
              {categories.map((cat) => (
                <IonCol size="6" key={cat}>
                  <IonButton
                    expand="block"
                    fill="outline"
                    className={getCategoryBtnClass(cat)}
                    onClick={(e) => {
                      (e.currentTarget as HTMLIonButtonElement).blur();
                      handleActionClick(cat);
                    }}
                  >
                    {cat}
                  </IonButton>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        </div>

        {/* Active Cards on Board */}
        <p className="board-section-title">Cards on Board</p>
        <IonList>
          {deck.modifiers.map((card) => {
            const count = activeBoard[card.id] || 0;
            const hasVisual = !!(card.artUrl || (card.colors && card.colors.length > 0));
            return (
              <IonItem
                key={card.id}
                lines="none"
                className={`board-card-item ${hasVisual ? 'has-art' : ''}`}
                style={getCardBgStyle(card)}
              >
                <IonLabel>
                  <h2>{card.name}</h2>
                  <p>
                    {card.mathType === 'multiplier' ? `x${card.value}` : `+${card.value}`}
                  </p>
                </IonLabel>
                <div slot="end" className="count-controls">
                  <IonButton
                    fill="outline"
                    className="count-btn count-btn-minus"
                    onClick={(e) => {
                      (e.currentTarget as HTMLIonButtonElement).blur();
                      updateCardCount(card.id, -1);
                    }}
                  >
                    <IonIcon icon={remove} slot="icon-only" />
                  </IonButton>
                  <span className={`count-value ${count === 0 ? 'count-zero' : 'count-active'}`}>
                    {count}
                  </span>
                  <IonButton
                    fill="outline"
                    className="count-btn count-btn-plus"
                    onClick={(e) => {
                      (e.currentTarget as HTMLIonButtonElement).blur();
                      updateCardCount(card.id, 1);
                    }}
                  >
                    <IonIcon icon={add} slot="icon-only" />
                  </IonButton>
                </div>
              </IonItem>
            );
          })}
        </IonList>

        {deck.id === 'quickstart' && (
          <div className="custom-fab-container">
            <IonFabButton className="custom-fab-main-btn" onClick={handleOpenAdd}>
              <IonIcon icon={add} style={{ fontSize: '32px' }} />
            </IonFabButton>
          </div>
        )}
      </IonContent>

      {/* ── Add Card Modal ─────────────────────── */}
      <IonModal isOpen={showAddModal} onDidDismiss={() => setShowAddModal(false)}>
        <IonHeader className="mtg-header">
          <IonToolbar>
            <IonTitle>Add Card</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowAddModal(false)}>Cancel</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding mtg-modal-form">
          <IonItem>
            <IonLabel position="stacked">Card Name</IonLabel>
            <IonInput
              value={cardData.name}
              placeholder="Doubling Season"
              onIonInput={(e) => setCardData({ ...cardData, name: e.detail.value! })}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Math Type</IonLabel>
            <IonSelect
              value={cardData.mathType}
              onIonChange={(e) => setCardData({ ...cardData, mathType: e.detail.value })}
            >
              <IonSelectOption value="multiplier">Multiplier (x)</IonSelectOption>
              <IonSelectOption value="additive">Additive (+)</IonSelectOption>
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Value</IonLabel>
            <IonInput
              type="number"
              value={cardData.value ?? 0}
              onIonInput={(e) => {
                const val = parseInt(e.detail.value!);
                setCardData({ ...cardData, value: isNaN(val) ? 0 : val });
              }}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Categories</IonLabel>
            <IonSelect
              multiple={true}
              value={cardData.categories}
              onIonChange={(e) => setCardData({ ...cardData, categories: e.detail.value })}
            >
              {categories.map((cat) => (
                <IonSelectOption key={cat} value={cat}>
                  {cat}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>

          {/* Art Preview (if set) */}
          {cardData.artUrl && (
            <div className="art-preview">
              <img src={cardData.artUrl} alt="Card art" />
              <IonButton
                fill="clear"
                size="small"
                className="art-preview-remove"
                onClick={() => setCardData({ ...cardData, artUrl: undefined, colors: undefined })}
              >
                <IonIcon icon={closeCircle} slot="icon-only" />
              </IonButton>
            </div>
          )}

          {/* Search Art Button */}
          <IonButton
            expand="block"
            fill="outline"
            className="ion-margin-top search-art-btn"
            onClick={() => setShowArtSelector(true)}
          >
            <IonIcon icon={imageOutline} slot="start" />
            {cardData.artUrl ? 'Change Art' : 'Search Art'}
          </IonButton>

          <IonButton
            expand="block"
            onClick={handleSaveCard}
            className="ion-margin-top save-btn"
          >
            Add Card
          </IonButton>
        </IonContent>
      </IonModal>

      {/* ── Card Art Selector ───────────────────────── */}
      <CardArtSelector
        isOpen={showArtSelector}
        onDismiss={() => setShowArtSelector(false)}
        initialSearch={cardData.name}
        onSelect={handleArtSelect}
      />

      {/* ── Calculation Modal ─────────────────────────── */}
      <IonModal
        isOpen={calculationModal.isOpen}
        onDidDismiss={() => setCalculationModal({ ...calculationModal, isOpen: false })}
      >
        <IonHeader className="mtg-header">
          <IonToolbar>
            <IonTitle>{calculationModal.category}</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setCalculationModal({ ...calculationModal, isOpen: false })}>
                Close
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          {/* Total Result */}
          <div className="result-display">
            <p className="result-label">Total Result</p>
            <h1 className="result-value">
              {calculateResult(calculationModal.baseValue, activeEffects)}
            </h1>
          </div>

          {/* Base Value */}
          <div className="base-value-section">
            <p className="base-label">Base Value</p>
            <div className="base-value-controls">
              <IonButton
                fill="outline"
                className="base-btn"
                onClick={() =>
                  setCalculationModal({
                    ...calculationModal,
                    baseValue: Math.max(0, calculationModal.baseValue - 1),
                  })
                }
              >
                <IonIcon icon={remove} slot="icon-only" />
              </IonButton>
              <span className="base-value-num">
                {calculationModal.baseValue}
              </span>
              <IonButton
                fill="outline"
                className="base-btn"
                onClick={() =>
                  setCalculationModal({
                    ...calculationModal,
                    baseValue: calculationModal.baseValue + 1,
                  })
                }
              >
                <IonIcon icon={add} slot="icon-only" />
              </IonButton>
            </div>
          </div>

          {/* Replacement Effects */}
          <div className="effects-section">
            <div className="effects-header">
              <h4>Replacement Effects</h4>
              <IonButton
                size="small"
                fill="solid"
                className="optimize-btn"
                onClick={autoOptimize}
              >
                <IonIcon icon={flash} slot="start" />
                Optimize
              </IonButton>
            </div>
            <p className="drag-hint">Drag to reorder effects</p>

            <IonList>
              <IonReorderGroup disabled={false} onIonItemReorder={handleReorder}>
                {activeEffects.map((eff) => (
                  <IonItem key={eff.id} className="effect-item">
                    <IonLabel>
                      {eff.name}
                      <span className={`effect-math ${eff.mathType}`}>
                        {eff.mathType === 'multiplier' ? ` x${eff.value}` : ` +${eff.value}`}
                      </span>
                    </IonLabel>
                    <IonReorder slot="end" />
                  </IonItem>
                ))}
              </IonReorderGroup>
            </IonList>

            {activeEffects.length === 0 && (
              <div className="no-effects">
                <p>No active effects for this category.</p>
              </div>
            )}
          </div>
        </IonContent>

        {/* Sticky Result Footer */}
        <IonFooter>
          <div className="sticky-result-footer">
            <span className="footer-label">{calculationModal.category} Total</span>
            <span className="footer-value">
              {calculateResult(calculationModal.baseValue, activeEffects)}
            </span>
          </div>
        </IonFooter>
      </IonModal>
    </IonPage>
  );
};

export default Play;
