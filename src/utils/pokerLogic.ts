export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
}

export const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
export const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];

export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank });
    }
  }
  return deck;
};

export const shuffle = (deck: Card[]): Card[] => {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

export type HandType =
  | 'ROYAL FLUSH'
  | 'STRAIGHT FLUSH'
  | '4 OF A KIND'
  | 'FULL HOUSE'
  | 'FLUSH'
  | 'STRAIGHT'
  | '3 OF A KIND'
  | '2 PAIR'
  | 'JACKS OR BETTER'
  | 'NONE';

export const evaluateHand = (cards: Card[]): HandType => {
  if (cards.length !== 5) return 'NONE';

  const rankCounts: Record<string, number> = {};
  const suitCounts: Record<string, number> = {};
  const rankValues = cards.map(c => RANKS.indexOf(c.rank)).sort((a, b) => a - b);
  
  cards.forEach(c => {
    rankCounts[c.rank] = (rankCounts[c.rank] || 0) + 1;
    suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1;
  });

  const counts = Object.values(rankCounts).sort((a, b) => b - a);
  const isFlush = Object.values(suitCounts).some(count => count === 5);
  
  // Straight check (including wheel A-2-3-4-5)
  let isStraight = false;
  const uniqueRanks = Array.from(new Set(rankValues));
  if (uniqueRanks.length === 5) {
    if (rankValues[4] - rankValues[0] === 4) {
      isStraight = true;
    } else if (rankValues[4] === 12 && rankValues[3] === 3) {
      // A, 2, 3, 4, 5 (ranks 12, 0, 1, 2, 3)
      isStraight = true;
    }
  }

  if (isFlush && isStraight) {
    if (rankValues[0] === 8) return 'ROYAL FLUSH'; // 10, J, Q, K, A
    return 'STRAIGHT FLUSH';
  }

  if (counts[0] === 4) return '4 OF A KIND';
  if (counts[0] === 3 && counts[1] === 2) return 'FULL HOUSE';
  if (isFlush) return 'FLUSH';
  if (isStraight) return 'STRAIGHT';
  if (counts[0] === 3) return '3 OF A KIND';
  if (counts[0] === 2 && counts[1] === 2) return '2 PAIR';
  
  if (counts[0] === 2) {
    const pairRank = Object.keys(rankCounts).find(r => rankCounts[r] === 2)!;
    const pairValue = RANKS.indexOf(pairRank as Rank);
    if (pairValue >= 9) return 'JACKS OR BETTER'; // J is index 9
  }

  return 'NONE';
};

export const PAYTABLE: Record<HandType, number[]> = {
  'ROYAL FLUSH': [250, 500, 750, 1000, 4000],
  'STRAIGHT FLUSH': [50, 100, 150, 200, 250],
  '4 OF A KIND': [25, 50, 75, 100, 125],
  'FULL HOUSE': [9, 18, 27, 36, 45],
  'FLUSH': [6, 12, 18, 24, 30],
  'STRAIGHT': [4, 8, 12, 16, 20],
  '3 OF A KIND': [3, 6, 9, 12, 15],
  '2 PAIR': [2, 4, 6, 8, 10],
  'JACKS OR BETTER': [1, 2, 3, 4, 5],
  'NONE': [0, 0, 0, 0, 0]
};
