
import React, { useState } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonToggle,
  IonIcon,
} from '@ionic/react';
import { imageOutline, closeCircle } from 'ionicons/icons';
import { useAppStore } from '../store/useAppStore';
import { CATEGORIES } from '../types';
import type { Category, MathType, ModifierCard } from '../types';
import CardArtSelector from './CardArtSelector';

interface CardFormModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  deckId: string;
  /** Pass a card to edit it; omit or pass null/undefined to add a new card. */
  editingCard?: ModifierCard | null;
}

const CardFormModal: React.FC<CardFormModalProps> = ({ isOpen, onDismiss, deckId, editingCard }) => {
  const { addModifierToDeck, updateModifierInDeck } = useAppStore();
  const [showArtSelector, setShowArtSelector] = useState(false);
  
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [cardData, setCardData] = useState({
    name: '',
    mathType: 'multiplier' as MathType,
    value: 2,
    isDynamicValue: false,
    categories: [] as Category[],
    artUrl: undefined as string | undefined,
    colors: undefined as string[] | undefined,
  });

  // Populate or reset the form each time the modal opens
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      if (editingCard) {
        setCardData({
          name: editingCard.name,
          mathType: editingCard.mathType,
          value: editingCard.value,
          isDynamicValue: editingCard.isDynamicValue ?? false,
          categories: [...editingCard.categories],
          artUrl: editingCard.artUrl,
          colors: editingCard.colors,
        });
      } else {
        setCardData({
          name: '',
          mathType: 'multiplier',
          value: 2,
          isDynamicValue: false,
          categories: [],
          artUrl: undefined,
          colors: undefined,
        });
      }
    }
  }

  const handleSave = () => {
    if (!cardData.name || cardData.categories.length === 0) return;
    if (editingCard) {
      updateModifierInDeck(deckId, editingCard.id, cardData);
    } else {
      addModifierToDeck(deckId, cardData);
    }
    onDismiss();
  };

  const handleArtSelect = (artUrl: string, colors: string[], cardName?: string) => {
    setCardData((prev) => ({
      ...prev,
      artUrl: artUrl || undefined,
      colors: colors.length > 0 ? colors : undefined,
      ...(cardName ? { name: cardName } : {}),
    }));
    setShowArtSelector(false);
  };

  return (
    <>
      <IonModal isOpen={isOpen} onDidDismiss={onDismiss}>
        <IonHeader className="mtg-header">
          <IonToolbar>
            <IonTitle>{editingCard ? 'Edit Card' : 'Add Card'}</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={onDismiss}>Cancel</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding mtg-modal-form">
          <div className="art-thumbnail-wrapper">
            <div
              className={`art-thumbnail-box ${cardData.artUrl ? 'has-art' : ''}`}
              onClick={() => setShowArtSelector(true)}
            >
              {cardData.artUrl ? (
                <>
                  <img src={cardData.artUrl} alt="Card art" />
                  <IonButton
                    fill="clear"
                    className="art-thumbnail-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCardData((prev) => ({ ...prev, artUrl: undefined, colors: undefined }));
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
              onIonInput={(e) => setCardData((prev) => ({ ...prev, name: e.detail.value! }))}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Math Type</IonLabel>
            <IonSelect
              value={cardData.mathType}
              onIonChange={(e) => setCardData((prev) => ({ ...prev, mathType: e.detail.value }))}
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
                setCardData((prev) => ({ ...prev, value: isNaN(val) ? 0 : val }));
              }}
            />
          </IonItem>
          <IonItem lines="none" style={{ marginTop: '8px', marginBottom: '8px' }}>
            <IonLabel>Value can change in-game (Dynamic)</IonLabel>
            <IonToggle
              checked={cardData.isDynamicValue}
              onIonChange={(e) => setCardData((prev) => ({ ...prev, isDynamicValue: e.detail.checked }))}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Categories</IonLabel>
            <IonSelect
              multiple={true}
              value={cardData.categories}
              onIonChange={(e) => setCardData((prev) => ({ ...prev, categories: e.detail.value }))}
            >
              {CATEGORIES.map((cat) => (
                <IonSelectOption key={cat} value={cat}>
                  {cat}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>

          <IonButton expand="block" onClick={handleSave} className="ion-margin-top save-btn">
            {editingCard ? 'Update Card' : 'Add Card'}
          </IonButton>
        </IonContent>
      </IonModal>

      <CardArtSelector
        isOpen={showArtSelector}
        onDismiss={() => setShowArtSelector(false)}
        initialSearch={cardData.name}
        onSelect={handleArtSelect}
      />
    </>
  );
};

export default CardFormModal;
