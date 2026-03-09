
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
  IonIcon,
  IonButtons,
  IonBackButton,
  IonFabButton,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonChip,
} from '@ionic/react';
import { useParams } from 'react-router-dom';
import { add, trash } from 'ionicons/icons';
import { useAppStore } from '../store/useAppStore';
import { getCardBgStyle, getCategoryClass } from '../utils/manaColors';
import CardFormModal from '../components/CardFormModal';
import type { ModifierCard } from '../types';

const DeckDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const deck = useAppStore((state) => state.decks.find((d) => d.id === id));
  const { removeModifierFromDeck } = useAppStore();

  const [showModal, setShowModal] = useState(false);
  const [editingCard, setEditingCard] = useState<ModifierCard | null>(null);

  if (!deck) return <IonPage><IonContent>Deck not found</IonContent></IonPage>;

  return (
    <IonPage>
      <IonHeader className="mtg-header">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>
            {deck.name}
            <span className="mtg-subtitle">Modifier Cards</span>
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonList className="modifier-list">
          {deck.modifiers.map((card) => {
            const hasVisual = !!(card.artUrl || (card.colors && card.colors.length > 0));
            return (
              <IonItemSliding key={card.id}>
                <IonItem
                  button
                  onClick={() => {
                    setEditingCard(card);
                    setShowModal(true);
                  }}
                  className={`modifier-card-item ${hasVisual ? 'has-art' : ''}`}
                  style={getCardBgStyle(card)}
                >
                  <IonLabel>
                    <h2>{card.name}</h2>
                    <span className={`math-badge ${card.mathType}`}>
                      {card.mathType === 'multiplier' ? `x${card.value}` : card.mathType === 'additive' ? `+${card.value}` : `Min ${card.value}`}
                    </span>
                    <div style={{ marginTop: '6px' }}>
                      {card.categories.map((cat) => (
                        <IonChip key={cat} outline className={getCategoryClass('cat-chip', cat)}>
                          {cat}
                        </IonChip>
                      ))}
                    </div>
                  </IonLabel>
                </IonItem>
                <IonItemOptions side="end">
                  <IonItemOption
                    color="danger"
                    onClick={() => removeModifierFromDeck(deck.id, card.id)}
                  >
                    <IonIcon icon={trash} slot="icon-only" />
                  </IonItemOption>
                </IonItemOptions>
              </IonItemSliding>
            );
          })}
        </IonList>

        {deck.modifiers.length === 0 && (
          <div className="empty-state">
            <p>No cards yet</p>
            <p className="empty-state-hint">Tap + to add modifier cards</p>
          </div>
        )}

        <div className="custom-fab-container">
          <IonFabButton
            className="custom-fab-main-btn"
            onClick={() => {
              setEditingCard(null);
              setShowModal(true);
            }}
          >
            <IonIcon icon={add} style={{ fontSize: '32px' }} />
          </IonFabButton>
        </div>
      </IonContent>

      <CardFormModal
        isOpen={showModal}
        onDismiss={() => setShowModal(false)}
        deckId={deck.id}
        editingCard={editingCard}
      />
    </IonPage>
  );
};

export default DeckDetail;
