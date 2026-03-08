
import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonFab,
  IonFabButton,
  IonAlert,
  IonCard,
} from '@ionic/react';
import { add, play, settings, layersOutline, imageOutline } from 'ionicons/icons';
import { useAppStore } from '../store/useAppStore';
import { manaGradient } from '../utils/manaColors';
import CardArtSelector from '../components/CardArtSelector';
import { useHistory } from 'react-router-dom';

const Home: React.FC = () => {
  const { decks, addDeck, updateDeckArt } = useAppStore();
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [showDeckArtSelector, setShowDeckArtSelector] = useState(false);
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
  const history = useHistory();

  const getDeckBgStyle = (deck: { artUrl?: string; colors?: string[] }): React.CSSProperties | undefined => {
    if (deck.artUrl) {
      return {
        backgroundImage: `linear-gradient(180deg, rgba(13,17,23,0.25) 0%, rgba(13,17,23,0.85) 70%), url(${deck.artUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    if (deck.colors && deck.colors.length > 0) {
      return { background: manaGradient(deck.colors) };
    }
    return undefined;
  };

  const handleDeckArtSelect = (artUrl: string, colors: string[], _cardName?: string) => {
    if (editingDeckId) {
      updateDeckArt(editingDeckId, artUrl || undefined, colors.length > 0 ? colors : undefined);
    }
    setShowDeckArtSelector(false);
    setEditingDeckId(null);
  };

  return (
    <IonPage>
      <IonHeader className="mtg-header">
        <IonToolbar>
          <IonTitle>
            MTG Toolbox
            <span className="mtg-subtitle">Board State Calculator</span>
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {decks.length > 0 ? (
          <div className="deck-grid">
            {decks.map((deck) => {
              const hasArt = !!(deck.artUrl || (deck.colors && deck.colors.length > 0));
              return (
                <IonCard
                  key={deck.id}
                  className="deck-card"
                  button={false}
                >
                  <div
                    className={`deck-card-inner ${hasArt ? 'has-art' : ''}`}
                    onClick={() => history.push(`/deck/${deck.id}`)}
                    style={getDeckBgStyle(deck)}
                  >
                    <h3 className="deck-name">{deck.name}</h3>
                    <p className="deck-count">
                      {deck.modifiers.length} {deck.modifiers.length === 1 ? 'Card' : 'Cards'}
                    </p>
                    <div className="deck-actions" onClick={(e) => e.stopPropagation()}>
                      <IonButton
                        size="small"
                        fill="outline"
                        className="deck-action-art"
                        onClick={(e) => {
                          (e.currentTarget as HTMLIonButtonElement).blur();
                          setEditingDeckId(deck.id);
                          setShowDeckArtSelector(true);
                        }}
                      >
                        <IonIcon icon={imageOutline} slot="icon-only" />
                      </IonButton>
                      <IonButton
                        size="small"
                        fill="outline"
                        className="deck-action-play"
                        onClick={(e) => {
                          (e.currentTarget as HTMLIonButtonElement).blur();
                          history.push(`/play/${deck.id}`);
                        }}
                      >
                        <IonIcon icon={play} slot="icon-only" />
                      </IonButton>
                      <IonButton
                        size="small"
                        fill="outline"
                        className="deck-action-settings"
                        onClick={(e) => {
                          (e.currentTarget as HTMLIonButtonElement).blur();
                          history.push(`/deck/${deck.id}`);
                        }}
                      >
                        <IonIcon icon={settings} slot="icon-only" />
                      </IonButton>
                    </div>
                  </div>
                </IonCard>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <IonIcon icon={layersOutline} className="empty-state-icon" />
            <p>No decks yet</p>
            <p className="empty-state-hint">Tap + to create your first deck</p>
          </div>
        )}

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => setShowAddAlert(true)}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        <IonAlert
          isOpen={showAddAlert}
          onDidDismiss={() => setShowAddAlert(false)}
          header="New Deck"
          inputs={[
            {
              name: 'name',
              type: 'text',
              placeholder: 'Deck Name (e.g. Anikthea)',
            },
          ]}
          buttons={[
            { text: 'Cancel', role: 'cancel' },
            {
              text: 'Add',
              handler: (data) => {
                if (data.name) addDeck(data.name);
              },
            },
          ]}
        />

        {/* ── Deck Art Selector ───────────────────────── */}
        <CardArtSelector
          isOpen={showDeckArtSelector}
          onDismiss={() => {
            setShowDeckArtSelector(false);
            setEditingDeckId(null);
          }}
          initialSearch={decks.find((d) => d.id === editingDeckId)?.name}
          onSelect={handleDeckArtSelect}
        />
      </IonContent>
    </IonPage>
  );
};

export default Home;
