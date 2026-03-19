import React, { useState } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonFabButton,
  IonAlert,
  IonCard,
  IonModal,
  IonButtons,
} from "@ionic/react";
import {
  add,
  play,
  settings,
  layersOutline,
  imageOutline,
  flash,
  trashOutline,
  informationCircleOutline,
} from "ionicons/icons";
import { useAppStore } from "../store/useAppStore";
import { getDeckBgStyle } from "../utils/manaColors";
import CardArtSelector from "../components/CardArtSelector";
import { QUICKSTART_ID } from "../types";
import { useHistory } from "react-router-dom";
import { APP_VERSION } from "../version";

const Home: React.FC = () => {
  const { decks, addDeck, updateDeckArt, initQuickstart, removeDeck } =
    useAppStore();
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [showDeckArtSelector, setShowDeckArtSelector] = useState(false);
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
  const [deckToDelete, setDeckToDelete] = useState<string | null>(null);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const history = useHistory();

  // Filter out the ephemeral quickstart deck from the list if it happens to be in memory
  const displayDecks = decks.filter((d) => d.id !== QUICKSTART_ID);

  const handleDeckArtSelect = (artUrl: string, colors: string[]) => {
    if (editingDeckId) {
      updateDeckArt(
        editingDeckId,
        artUrl || undefined,
        colors.length > 0 ? colors : undefined,
      );
    }
    setShowDeckArtSelector(false);
    setEditingDeckId(null);
  };

  const handleQuickstart = () => {
    setIsFabOpen(false);
    initQuickstart();
    history.push(`/play/${QUICKSTART_ID}`);
  };

  const handleNewDeck = () => {
    setIsFabOpen(false);
    setShowAddAlert(true);
  };

  return (
    <IonPage>
      <IonHeader className="mtg-header">
        <IonToolbar>
          <IonTitle class="home-title">
            Tokenize
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowHelp(true)}>
              <IonIcon icon={informationCircleOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {displayDecks.length > 0 ? (
          <div className="deck-grid">
            {displayDecks.map((deck) => {
              const hasArt = !!(
                deck.artUrl ||
                (deck.colors && deck.colors.length > 0)
              );
              return (
                <IonCard key={deck.id} className="deck-card" button={false}>
                  <div
                    className={`deck-card-inner ${hasArt ? "has-art" : ""}`}
                    onClick={() => history.push(`/play/${deck.id}`)}
                    style={getDeckBgStyle(deck)}
                  >
                    <h3 className="deck-name">{deck.name}</h3>
                    <p className="deck-count">
                      {deck.modifiers.length}{" "}
                      {deck.modifiers.length === 1 ? "Card" : "Cards"}
                    </p>
                    <div
                      className="deck-actions"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <IonButton
                        size="small"
                        fill="outline"
                        color="danger"
                        className="deck-action-delete"
                        onClick={(e) => {
                          (e.currentTarget as HTMLIonButtonElement).blur();
                          setDeckToDelete(deck.id);
                        }}
                      >
                        <IonIcon icon={trashOutline} slot="icon-only" />
                      </IonButton>
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

        {/* ── Custom Animated FAB ──────────────────────── */}
        <div
          className={`custom-fab-backdrop ${isFabOpen ? "open" : ""}`}
          onClick={() => setIsFabOpen(false)}
        />

        <div className={`custom-fab-container ${isFabOpen ? "open" : ""}`}>
          <div className="custom-fab-menu">
            <div className="custom-fab-item">
              <span className="custom-fab-label" onClick={handleQuickstart}>
                Quickstart
              </span>
              <IonFabButton
                className="custom-fab-sub-btn"
                onClick={handleQuickstart}
                size="small"
              >
                <IonIcon icon={flash} color="light" />
              </IonFabButton>
            </div>

            <div className="custom-fab-item">
              <span className="custom-fab-label" onClick={handleNewDeck}>
                New Deck
              </span>
              <IonFabButton
                className="custom-fab-sub-btn"
                onClick={handleNewDeck}
                size="small"
              >
                <IonIcon icon={layersOutline} color="light" />
              </IonFabButton>
            </div>
          </div>

          <IonFabButton
            className="custom-fab-main-btn"
            onClick={() => setIsFabOpen(!isFabOpen)}
          >
            <IonIcon icon={add} style={{ fontSize: "32px" }} />
          </IonFabButton>
        </div>

        <IonAlert
          isOpen={showAddAlert}
          onDidDismiss={() => setShowAddAlert(false)}
          header="New Deck"
          inputs={[
            {
              name: "name",
              type: "text",
              placeholder: "Deck Name (e.g. Anikthea)",
            },
          ]}
          buttons={[
            { text: "Cancel", role: "cancel" },
            {
              text: "Add",
              handler: (data) => {
                if (data.name) addDeck(data.name);
              },
            },
          ]}
        />

        <IonAlert
          isOpen={!!deckToDelete}
          onDidDismiss={() => setDeckToDelete(null)}
          header="Delete Deck"
          message="Are you sure you want to delete this deck? This action cannot be undone."
          buttons={[
            { text: "Cancel", role: "cancel" },
            {
              text: "Delete",
              role: "destructive",
              handler: () => {
                if (deckToDelete) {
                  removeDeck(deckToDelete);
                }
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
          initialSearch={displayDecks.find((d) => d.id === editingDeckId)?.name}
          onSelect={handleDeckArtSelect}
        />
      </IonContent>

      {/* ── Help Modal ──────────────────────────────── */}
      <IonModal
        isOpen={showHelp}
        onDidDismiss={() => setShowHelp(false)}
        breakpoints={[0, 0.75]}
        initialBreakpoint={0.75}
      >
        <IonContent className="ion-padding help-modal-content">
          <div className="help-title-row">
            <span className="home-title">Tokenize</span>
            <span className="help-version">v{APP_VERSION}</span>
          </div>

          <p className="help-tagline">MTG board state calculator for token & effect tracking.</p>

          <div className="help-section">
            <h4 className="help-section-title">Decks</h4>
            <p className="help-section-body">Create a deck for each commander. Each deck holds your modifier cards — cards that affect token counts, damage, mana, etc.</p>
          </div>

          <div className="help-section">
            <h4 className="help-section-title">Quickstart</h4>
            <p className="help-section-body">Jump straight into a game without saving a deck. Add cards on the fly. Your last Quickstart session is saved and can be restored.</p>
          </div>

          <div className="help-section">
            <h4 className="help-section-title">Active Game</h4>
            <p className="help-section-body">Tap +/− to set how many copies of each card are currently on the board. Tap a category button (Tokens, Damage, etc.) for a quick total. Long-press a category to open the full calculation view with reorderable effects and math breakdown. Swipe the result footer to the right to dismiss it.</p>
          </div>

          <div className="help-section">
            <h4 className="help-section-title">Modifier Cards</h4>
            <p className="help-section-body">Each card has a math type — additive (+), multiplier (×), or floor (Min). The app finds the optimal ordering automatically, or you can drag to reorder manually.</p>
          </div>

          <div className="help-credits-row">
            <span>Made by <strong>@Philipp</strong></span>
          </div>
        </IonContent>
      </IonModal>
    </IonPage>
  );
};

export default Home;
