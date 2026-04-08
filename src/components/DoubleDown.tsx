import React from 'react';
import { Card as CardType } from '../utils/pokerLogic';
import { Card } from './CardBoard';
import './DoubleDown.css';

interface DoubleDownProps {
  dealerCard: CardType | null;
  playerCards: (CardType | null)[];
  onChoice: (index: number) => void;
  result: 'win' | 'loss' | 'tie' | null;
  chosenIndex: number | null;
}

export const DoubleDown: React.FC<DoubleDownProps> = ({ 
  dealerCard, 
  playerCards, 
  onChoice,
  result,
  chosenIndex
}) => {
  return (
    <div className="double-down-modern glass-panel">
      <div className="double-header">
        <h2 className="double-title">DOUBLE OR NOTHING</h2>
        <p className="double-subtitle">Pick a higher card than the dealer to double your win!</p>
      </div>

      <div className="double-grid">
        <div className="dealer-section">
          <span className="section-label">DEALER</span>
          <div className="dealer-card-slot">
            <Card 
              card={dealerCard} 
              isHeld={false} 
              onToggleHold={() => {}} 
              isFaceDown={false} 
              index={0} 
            />
          </div>
        </div>

        <div className="player-section">
          <span className="section-label">CHOOSE A CARD</span>
          <div className="player-cards-grid">
            {playerCards.map((card, i) => (
              <div 
                key={i} 
                className={`choice-card-wrapper ${chosenIndex === i ? 'is-chosen' : ''}`}
                onClick={() => !result && onChoice(i)}
              >
                <Card 
                  card={card} 
                  isHeld={false} 
                  onToggleHold={() => {}} 
                  isFaceDown={chosenIndex !== i && !result} 
                  index={i + 1} 
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {result && (
        <div className={`double-result-overlay ${result}`}>
          <span className="result-text">
            {result === 'win' && 'YOU DOUBLED!'}
            {result === 'loss' && 'TOO BAD...'}
            {result === 'tie' && 'PUSH! TRY AGAIN'}
          </span>
        </div>
      )}
    </div>
  );
};
