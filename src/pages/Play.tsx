import React, { useState, useMemo, useRef, useCallback } from "react";
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
  IonFabButton,
  IonInput,
} from "@ionic/react";
import type { ItemReorderEventDetail } from "@ionic/react";
import { useParams } from "react-router-dom";
import {
  add,
  remove,
  flash,
  refresh,
} from "ionicons/icons";
import { useAppStore } from "../store/useAppStore";
import { getCardBgStyle, getCategoryClass } from "../utils/manaColors";
import CardFormModal from "../components/CardFormModal";
import { CATEGORIES, QUICKSTART_ID } from "../types";
import type { Category, ModifierCard } from "../types";
import {
  Users,
  CircleDot,
  Flame,
  BookOpen,
  Swords,
  DoorOpen,
  Droplet,
} from "lucide-react";

const CATEGORY_ICONS: Record<Category, React.FC<{ size?: number }>> = {
  Tokens: Users,
  Counters: CircleDot,
  Damage: Flame,
  "Card Draw": BookOpen,
  "Attack Triggers": Swords,
  ETB: DoorOpen,
  Mana: Droplet,
};

interface MathStep {
  id: string;
  cardName: string;
  prevValue: number;
  operator: string;
  modifierValue: number;
  newValue: number;
  color?: string;
}

const sortByOptimization = (a: ModifierCard, b: ModifierCard) => {
  const order = { additive: 1, multiplier: 2, floor: 3 };
  return order[a.mathType] - order[b.mathType];
};
const generateMathSteps = (
  base: number,
  effects: ModifierCard[],
): MathStep[] => {
  let current = base;
  return effects.map((eff) => {
    const prevValue = current;
    let operator = "";
    if (eff.mathType === "multiplier") {
      operator = "x";
      current *= eff.value;
    } else if (eff.mathType === "floor") {
      operator = "Min";
      current = Math.max(current, eff.value);
    } else {
      operator = "+";
      current += eff.value;
    }
    return {
      id: eff.id,
      cardName: eff.name,
      prevValue,
      operator,
      modifierValue: eff.value,
      newValue: current,
      color: eff.colors?.[0],
    };
  });
};

const getPermutations = <T,>(arr: T[]): T[][] => {
  if (arr.length <= 1) return [arr];
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const current = arr[i];
    const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
    const perms = getPermutations(remaining);
    for (const p of perms) {
      result.push([current, ...p]);
    }
  }
  return result;
};

const optimizeEffects = (effects: ModifierCard[], baseValue: number): ModifierCard[] => {
  if (effects.length === 0) return effects;
  if (effects.length > 8) {
    return [...effects].sort(sortByOptimization);
  }
  const permutations = getPermutations(effects);
  let maxResult = -Infinity;
  let bestPermutation = effects;

  for (const perm of permutations) {
    const steps = generateMathSteps(baseValue, perm);
    const result = steps.length > 0 ? steps[steps.length - 1].newValue : baseValue;
    if (result > maxResult) {
      maxResult = result;
      bestPermutation = perm;
    }
  }
  return bestPermutation;
};

const Play: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const deck = useAppStore((state) => state.decks.find((d) => d.id === id));
  const activeBoard = useAppStore((state) => state.activeBoard);
  const updateCardCount = useAppStore((state) => state.updateCardCount);
  const clearActiveBoard = useAppStore((state) => state.clearActiveBoard);
  const updateModifierInDeck = useAppStore(
    (state) => state.updateModifierInDeck,
  );

  const [calculationModal, setCalculationModal] = useState<{
    isOpen: boolean;
    category: Category | null;
    baseValue: number;
  }>({ isOpen: false, category: null, baseValue: 0 });

  const [activeEffects, setActiveEffects] = useState<ModifierCard[]>([]);

  // Quick result state (inline display on short tap)
  const [quickResult, setQuickResult] = useState<{
    category: Category;
    result: number;
    effectCount: number;
  } | null>(null);

  // Long press detection
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);
  const LONG_PRESS_MS = 400;

  const getEffectsForCategory = useCallback(
    (category: Category, baseValue: number = 1) => {
      const effects: ModifierCard[] = [];
      for (const card of deck?.modifiers ?? []) {
        if (!card.categories.includes(category)) continue;
        const count = activeBoard[card.id] || 0;
        for (let i = 0; i < count; i++) {
          effects.push({ ...card, id: `${card.id}-${i}` });
        }
      }
      return optimizeEffects(effects, baseValue);
    },
    [deck?.modifiers, activeBoard],
  );

  const handlePointerDown = useCallback(
    (category: Category) => {
      isLongPress.current = false;
      longPressTimer.current = setTimeout(() => {
        isLongPress.current = true;
        // Long press → open detailed modal
        const effects = getEffectsForCategory(category, 1);
        setActiveEffects(effects);
        setCalculationModal({ isOpen: true, category, baseValue: 1 });
      }, LONG_PRESS_MS);
    },
    [getEffectsForCategory],
  );

  const handlePointerUp = useCallback(
    (category: Category) => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
      if (!isLongPress.current) {
        // Short tap → quick inline result
        const effects = getEffectsForCategory(category, 1);
        const result = generateMathSteps(1, effects).at(-1)?.newValue ?? 1;
        setQuickResult({ category, result, effectCount: effects.length });
      }
    },
    [getEffectsForCategory],
  );

  const handlePointerCancel = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  // Add Card State (Quickstart only)
  const [showAddModal, setShowAddModal] = useState(false);

  const mathSteps = useMemo(
    () => generateMathSteps(calculationModal.baseValue, activeEffects),
    [calculationModal.baseValue, activeEffects],
  );

  const result = useMemo(
    () => mathSteps.at(-1)?.newValue ?? calculationModal.baseValue,
    [mathSteps, calculationModal.baseValue],
  );

  if (!deck)
    return (
      <IonPage>
        <IonContent>Deck not found</IonContent>
      </IonPage>
    );

  // handleActionClick kept for modal-only usage (e.g. from quick result)
  const handleActionClick = (category: Category) => {
    const effects = getEffectsForCategory(category, 1);
    setActiveEffects(effects);
    setCalculationModal({ isOpen: true, category, baseValue: 1 });
  };

  const handleReorder = (event: CustomEvent<ItemReorderEventDetail>) => {
    const newEffects = [...activeEffects];
    const item = newEffects.splice(event.detail.from, 1)[0];
    newEffects.splice(event.detail.to, 0, item);
    setActiveEffects(newEffects);
    event.detail.complete();
  };

  const autoOptimize = () => {
    if (activeEffects.length === 0) return;
    setActiveEffects(optimizeEffects(activeEffects, calculationModal.baseValue));
  };

  return (
    <IonPage>
      <IonHeader className="mtg-header">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton text="" defaultHref="/home" />
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
              {CATEGORIES.map((cat) => {
                const Icon = CATEGORY_ICONS[cat];
                return (
                  <IonCol size="6" key={cat}>
                    <IonButton
                      expand="block"
                      fill="outline"
                      className={getCategoryClass("action-btn", cat)}
                      onPointerDown={(e) => {
                        e.preventDefault();
                        handlePointerDown(cat);
                      }}
                      onPointerUp={(e) => {
                        (e.currentTarget as HTMLIonButtonElement).blur();
                        handlePointerUp(cat);
                      }}
                      onPointerLeave={handlePointerCancel}
                      onPointerCancel={handlePointerCancel}
                      onClick={(e) => e.preventDefault()}
                    >
                      <Icon size={16} />
                      <span style={{ marginLeft: 6 }}>{cat}</span>
                    </IonButton>
                  </IonCol>
                );
              })}
            </IonRow>
          </IonGrid>
        </div>

        {/* Active Cards on Board */}
        <p className="board-section-title">Cards on Board</p>
        <IonList>
          {deck.modifiers.map((card) => {
            const count = activeBoard[card.id] || 0;
            const hasVisual = !!(
              card.artUrl ||
              (card.colors && card.colors.length > 0)
            );
            return (
              <IonItem
                key={card.id}
                lines="none"
                className={`board-card-item ${hasVisual ? "has-art" : ""}`}
                style={getCardBgStyle(card)}
              >
                <IonLabel>
                  <h2>{card.name}</h2>
                  {card.isDynamicValue ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginTop: "4px",
                      }}
                    >
                      <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>
                        Value:
                      </span>
                      <IonInput
                        type="number"
                        value={card.value}
                        onIonInput={(e) => {
                          const val = parseInt(e.detail.value!, 10);
                          if (!isNaN(val)) {
                            updateModifierInDeck(deck.id, card.id, {
                              value: val,
                            });
                          }
                        }}
                        style={{
                          width: "60px",
                          border: "1px solid var(--mtg-border)",
                          borderRadius: "4px",
                          padding: "0 8px",
                          background: "rgba(0, 0, 0, 0.4)",
                          color: "var(--mtg-text-primary)",
                        }}
                      />
                    </div>
                  ) : (
                    <p>
                      {card.mathType === "multiplier"
                        ? `x${card.value}`
                        : card.mathType === "additive"
                          ? `+${card.value}`
                          : `Min ${card.value}`}
                    </p>
                  )}
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
                  <span
                    className={`count-value ${count === 0 ? "count-zero" : "count-active"}`}
                  >
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

        {deck.id === QUICKSTART_ID && (
          <div className="custom-fab-container">
            <IonFabButton
              className="custom-fab-main-btn"
              onClick={() => setShowAddModal(true)}
            >
              <IonIcon icon={add} style={{ fontSize: "32px" }} />
            </IonFabButton>
          </div>
        )}
      </IonContent>

      {/* Quick Result Footer */}
      {quickResult && (
        <IonFooter>
          <div
            className="sticky-result-footer quick-result-footer"
            onClick={() =>
              quickResult.effectCount > 0 &&
              handleActionClick(quickResult.category)
            }
          >
            <span className="footer-label">{quickResult.category} Total</span>
            <span className="footer-value">{quickResult.result}</span>
          </div>
        </IonFooter>
      )}

      <CardFormModal
        isOpen={showAddModal}
        onDismiss={() => setShowAddModal(false)}
        deckId={deck.id}
      />

      {/* ── Calculation Modal ─────────────────────────── */}
      <IonModal
        isOpen={calculationModal.isOpen}
        onDidDismiss={() =>
          setCalculationModal({ ...calculationModal, isOpen: false })
        }
      >
        <IonHeader className="mtg-header">
          <IonToolbar>
            <IonTitle>{calculationModal.category}</IonTitle>
            <IonButtons slot="end">
              <IonButton
                onClick={() =>
                  setCalculationModal({ ...calculationModal, isOpen: false })
                }
              >
                Close
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
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
              <IonReorderGroup
                disabled={false}
                onIonItemReorder={handleReorder}
              >
                {activeEffects.map((eff) => (
                  <IonItem key={eff.id} className="effect-item">
                    <IonLabel>
                      {eff.name}
                      <span className={`effect-math ${eff.mathType}`}>
                        {eff.mathType === "multiplier"
                          ? ` x${eff.value}`
                          : eff.mathType === "floor"
                            ? ` Min ${eff.value}`
                            : ` +${eff.value}`}
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

          {/* Math Breakdown */}
          {activeEffects.length > 0 && (
            <div className="math-breakdown-section">
              <details className="math-details">
                <summary className="math-summary">Show Math</summary>
                <div className="math-steps">
                  {mathSteps.map((step, idx) => (
                    <div key={`${step.id}-${idx}`} className="math-step-row">
                      <div
                        className="math-step-indicator"
                        style={
                          step.color
                            ? { backgroundColor: `#${step.color}` }
                            : {}
                        }
                      ></div>
                      <div className="math-step-content">
                        <span className="math-step-card-name">
                          ({step.cardName})
                        </span>
                        <span className="math-step-calc">
                          {step.operator === "Min" ? (
                            <>
                              {step.prevValue} &rarr; Min({step.modifierValue})
                              = <strong>{step.newValue}</strong>
                            </>
                          ) : (
                            <>
                              {step.prevValue} {step.operator}{" "}
                              {step.modifierValue} ={" "}
                              <strong>{step.newValue}</strong>
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}
        </IonContent>

        {/* Sticky Result Footer */}
        <IonFooter>
          <div className="sticky-result-footer">
            <span className="footer-label">
              {calculationModal.category} Total
            </span>
            <span className="footer-value">{result}</span>
          </div>
        </IonFooter>
      </IonModal>
    </IonPage>
  );
};

export default Play;
