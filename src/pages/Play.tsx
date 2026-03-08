
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
} from '@ionic/react';
import type { ItemReorderEventDetail } from '@ionic/react';
import { useParams } from 'react-router-dom';
import { add, remove, flash, refresh } from 'ionicons/icons';
import { useAppStore } from '../store/useAppStore';
import { manaGradient } from '../utils/manaColors';
import type { Category, ModifierCard } from '../types';

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
  const { activeBoard, updateCardCount, clearActiveBoard } = useAppStore();

  const [calculationModal, setCalculationModal] = useState<{
    isOpen: boolean;
    category: Category | null;
    baseValue: number;
  }>({ isOpen: false, category: null, baseValue: 0 });

  const [activeEffects, setActiveEffects] = useState<ModifierCard[]>([]);

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

  const categories: Category[] = [
    'Tokens',
    'Counters',
    'Damage',
    'Card Draw',
    'Attack Triggers',
    'ETB',
  ];

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
      </IonContent>

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
