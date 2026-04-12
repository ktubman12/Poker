import { Card } from './pokerLogic';

export interface HandValue {
  total: number;
  isSoft: boolean;
}

export function calculateHandValue(cards: (Card | null)[]): HandValue {
  let total = 0;
  let aces = 0;

  for (const card of cards) {
    if (!card) continue;
    
    if (['J', 'Q', 'K'].includes(card.rank)) {
      total += 10;
    } else if (card.rank === 'A') {
      aces += 1;
      total += 11;
    } else {
      total += parseInt(card.rank, 10);
    }
  }

  // Adjust for aces
  let isSoft = false;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  if (aces > 0 && total <= 21) {
    isSoft = true;
  }

  return { total, isSoft };
}

export function isBlackjack(cards: (Card | null)[]): boolean {
  if (cards.length !== 2 || cards.includes(null)) return false;
  const val = calculateHandValue(cards);
  return val.total === 21;
}

// Dealer rule: hit on soft 17 (meaning soft 17 or below 17)
export function shouldDealerHit(cards: (Card | null)[]): boolean {
  const { total, isSoft } = calculateHandValue(cards);
  if (total < 17) return true;
  if (total === 17 && isSoft) return true;
  return false;
}
