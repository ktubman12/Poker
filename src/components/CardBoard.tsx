import React from 'react';
import { Card as CardType } from '../utils/pokerLogic';
import './CardBoard.css';

interface CardProps {
  card: CardType | null;
  isHeld: boolean;
  onToggleHold: () => void;
  isFaceDown: boolean;
  index: number;
}

const SuitSVG = ({ suit, size = 24 }: { suit: string, size?: number }) => {
  if (suit === 'spades') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C9.5 4.5 4 10.5 4 14.5C4 16.5 5.5 18 7.5 18C8.5 18 9.5 17.5 10 16.5V20H14V16.5C14.5 17.5 15.5 18 16.5 18C18.5 18 20 16.5 20 14.5C20 10.5 14.5 4.5 12 2Z" />
    </svg>
  );
  if (suit === 'hearts') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
  if (suit === 'diamonds') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 12L12 22L22 12L12 2Z" />
    </svg>
  );
  if (suit === 'clubs') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a4 4 0 0 1 4 4 4 4 0 0 1-1.92 3.42A5 5 0 1 1 19 14.5c0 2.41-1.7 4.43-4 4.89V22h-6v-2.61c-2.3-.46-4-2.48-4-4.89a5 5 0 1 1 4.92-5.08A4 4 0 0 1 8 6a4 4 0 0 1 4-4z" />
    </svg>
  );
  return null;
};

export const Card: React.FC<CardProps> = ({ card, isHeld, onToggleHold, isFaceDown, index }) => {
  const getSuitColorClass = (suit: string) => {
    return (suit === 'hearts' || suit === 'diamonds') ? 'text-rose' : 'text-slate';
  };

  return (
    <div 
      className="card-container-modern"
      onClick={onToggleHold}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {isHeld && <div className="held-badge">HELD</div>}

      <div className={`modern-card ${isFaceDown || !card ? 'is-back' : ''} ${isHeld ? 'is-held' : ''}`}>
        {!isFaceDown && card && (
          <div className={`card-face ${getSuitColorClass(card.suit)}`}>
            <div className="card-top-left">
              <span className="rank-text">{card.rank}</span>
              <SuitSVG suit={card.suit} size={16} />
            </div>
            
            <div className="card-center-icon">
              <SuitSVG suit={card.suit} size={64} />
            </div>

            <div className="card-bottom-right">
              <span className="rank-text">{card.rank}</span>
              <SuitSVG suit={card.suit} size={16} />
            </div>
          </div>
        )}
        {(isFaceDown || !card) && (
          <div className="card-back-pattern">
            <div className="logo-placeholder">VP</div>
          </div>
        )}
      </div>
    </div>
  );
};

interface CardBoardProps {
  cards: (CardType | null)[];
  heldIndices: Set<number>;
  onToggleIndex: (index: number) => void;
}

export const CardBoard: React.FC<CardBoardProps> = ({ cards, heldIndices, onToggleIndex }) => {
  return (
    <div className="card-board-modern">
      {cards.map((card, i) => (
        <Card
          key={`${i}-${card ? card.rank + card.suit : 'back'}`}
          index={i}
          card={card}
          isHeld={heldIndices.has(i)}
          onToggleHold={() => onToggleIndex(i)}
          isFaceDown={!card}
        />
      ))}
    </div>
  );
};
