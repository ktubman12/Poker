import React from 'react';
import { PAYTABLE, HandType } from '../utils/pokerLogic';
import './PayTable.css';

interface PayTableProps {
  currentBet: number;
  winningHand: HandType | null;
}

const hands: HandType[] = [
  'ROYAL FLUSH',
  'STRAIGHT FLUSH',
  '4 OF A KIND',
  'FULL HOUSE',
  'FLUSH',
  'STRAIGHT',
  '3 OF A KIND',
  '2 PAIR',
  'JACKS OR BETTER'
];

export const PayTable: React.FC<PayTableProps> = ({ currentBet, winningHand }) => {
  return (
    <div className="paytable-modern glass-panel">
      <div className="paytable-grid">
        {hands.map((hand) => (
          <div 
            key={hand}
            className={`paytable-row ${winningHand === hand ? 'winning-row' : ''}`}
          >
            <div className="hand-name">
              {hand}
            </div>
            <div className="payout-columns">
              {[5, 10, 15, 20, 25].map((betLevel) => {
                const isMaxCol = betLevel === 25;
                const isActive = (currentBet === betLevel) || (isMaxCol && currentBet > 25);
                
                return (
                  <div
                    key={`${hand}-${betLevel}`}
                    className={`payout-item 
                      ${isActive ? 'active-col' : ''} 
                      ${winningHand === hand && isActive ? 'win-active' : ''}`}
                  >
                    {PAYTABLE[hand][(betLevel / 5) - 1] * 5}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
