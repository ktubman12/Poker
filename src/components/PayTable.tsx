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
              {[1, 2, 3, 4, 5].map((betLevel) => (
                <div
                  key={`${hand}-${betLevel}`}
                  className={`payout-item 
                    ${currentBet === betLevel ? 'active-col' : ''} 
                    ${winningHand === hand && currentBet === betLevel ? 'win-active' : ''}`}
                >
                  {PAYTABLE[hand][betLevel - 1]}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
