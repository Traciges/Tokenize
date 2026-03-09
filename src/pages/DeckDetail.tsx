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
  IonFabButton,
  IonModal,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonChip,
  IonToggle,
} from '@ionic/react';
import { useParams } from 'react-router-dom';
import { add, trash, imageOutline, closeCircle } from 'ionicons/icons';
import { useAppStore } from '../store/useAppStore';
import { getCardBgStyle, getCategoryClass } from '../utils/manaColors';
import CardArtSelector from '../components/CardArtSelector';
import { CATEGORIES } from '../types';
import type { Category, MathType, ModifierCard } from '../types';

const DeckDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const deck = useAppStore((state) => state.decks.find((d) => d.id === id));
  const { addModifierToDeck, updateModifierInDeck, removeModifierFromDeck } = useAppStore();

  const [showModal, setShowModal] = useState(false);
  const [showArtSelector, setShowArtSelector] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [cardData, setCardData] = useState({
    name: '',
    mathType: 'multiplier' as MathType,
    value: 2,
    isDynamicValue: false,
    categories: [] as Category[],
    artUrl: undefined as string | undefined,
    colors: undefined as string[] | undefined,
  });

  if (!deck) return <IonPage><IonContent>Deck not found</IonContent></IonPage>;

  const handleOpenAdd = () => {
    setEditingCardId(null);
    setCardData({ name: '', mathType: 'multiplier', value: 2, isDynamicValue: false, categories: [], artUrl: undefined, colors: undefined });
    setShowModal(true);
  };

  const handleOpenEdit = (card: ModifierCard) => {
    setEditingCardId(card.id);
    setCardData({
      name: card.name,
      mathType: card.mathType,
      value: card.value,
      isDynamicValue: card.isDynamicValue || false,
      categories: [...card.categories],
      artUrl: card.artUrl,
      colors: card.colors,
    });
    setShowModal(true);
  };

  const handleSaveCard = () => {
    if (cardData.name && cardData.categories.length > 0) {
      if (editingCardId) {
        updateModifierInDeck(deck.id, editingCardId, cardData);
      } else {
        addModifierToDeck(deck.id, cardData);
      }
      setShowModal(false);
    }
  };

  const handleArtSelect = (artUrl: string, colors: string[], cardName?: string) => {
    setCardData({
      ...cardData,
      artUrl: artUrl || undefined,
      colors: colors.length > 0 ? colors : undefined,
      // Auto-fill the card name when selecting art from Scryfall
      ...(cardName ? { name: cardName } : {}),
    });
    setShowArtSelector(false);
  };

  const handleRemoveArt = () => {
    setCardData({ ...cardData, artUrl: undefined, colors: undefined });
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
                  onClick={() => handleOpenEdit(card)}
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
                        <IonChip
                          key={cat}
                          outline
                          className={getCategoryClass('cat-chip', cat)}
                        >
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
          <IonFabButton className="custom-fab-main-btn" onClick={handleOpenAdd}>
            <IonIcon icon={add} style={{ fontSize: '32px' }} />
          </IonFabButton>
        </div>

        {/* ── Add/Edit Card Modal ─────────────────────── */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader className="mtg-header">
            <IonToolbar>
              <IonTitle>{editingCardId ? 'Edit Card' : 'Add Card'}</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}>Cancel</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding mtg-modal-form">
            <div className="art-thumbnail-wrapper">
              <div className={`art-thumbnail-box ${cardData.artUrl ? 'has-art' : ''}`} onClick={() => setShowArtSelector(true)}>
                {cardData.artUrl ? (
                  <>
                    <img src={cardData.artUrl} alt="Card art" />
                    <IonButton
                      fill="clear"
                      className="art-thumbnail-remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveArt();
                      }}
                    >
                      <IonIcon icon={closeCircle} slot="icon-only" />
                    </IonButton>
                  </>
                ) : (
                  <>
                    <IonIcon icon={imageOutline} />
                    <span>Add Art</span>
                  </>
                )}
              </div>
            </div>

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
                <IonSelectOption value="floor">Minimum Value (Floor)</IonSelectOption>
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
            <IonItem lines="none" style={{ marginTop: '8px', marginBottom: '8px' }}>
              <IonLabel>Value can change in-game (Dynamic)</IonLabel>
              <IonToggle
                checked={cardData.isDynamicValue}
                onIonChange={(e) => setCardData({ ...cardData, isDynamicValue: e.detail.checked })}
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Categories</IonLabel>
              <IonSelect
                multiple={true}
                value={cardData.categories}
                onIonChange={(e) => setCardData({ ...cardData, categories: e.detail.value })}
              >
                {CATEGORIES.map((cat) => (
                  <IonSelectOption key={cat} value={cat}>
                    {cat}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            <IonButton
              expand="block"
              onClick={handleSaveCard}
              className="ion-margin-top save-btn"
            >
              {editingCardId ? 'Update Card' : 'Add Card'}
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
      </IonContent>
    </IonPage>
  );
};

export default DeckDetail;
