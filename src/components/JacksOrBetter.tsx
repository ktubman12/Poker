import React, { useState, useCallback } from 'react';
import { PayTable } from './PayTable';
import { CardBoard } from './CardBoard';
import { ControlBar } from './ControlBar';
import { DoubleDown } from './DoubleDown';
import '../App.css'; // Uses the same styles
import { 
  createDeck, 
  shuffle, 
  evaluateHand, 
  PAYTABLE, 
  Card, 
  HandType,
  RANKS
} from '../utils/pokerLogic';

interface JacksOrBetterProps {
  credits: number;
  setCredits: React.Dispatch<React.SetStateAction<number>>;
  denomIndex: number;
  setDenomIndex: React.Dispatch<React.SetStateAction<number>>;
  denominations: string[];
}

export const JacksOrBetter: React.FC<JacksOrBetterProps> = ({
  credits,
  setCredits,
  denomIndex,
  setDenomIndex,
  denominations
}) => {
  const [currentBet, setCurrentBet] = useState(5);
  const [hand, setHand] = useState<(Card | null)[]>([null, null, null, null, null]);
  const [deck, setDeck] = useState<Card[]>([]);
  const [heldIndices, setHeldIndices] = useState<Set<number>>(new Set());
  const [gamePhase, setGamePhase] = useState<'betting' | 'holding' | 'gameover' | 'doubling'>('betting');
  const [winAmount, setWinAmount] = useState(0);
  const [winningHand, setWinningHand] = useState<HandType | null>(null);

  const [winStreak, setWinStreak] = useState(0);
  const [gameTitle, setGameTitle] = useState(() => localStorage.getItem('poker_game_title') || 'TUBMANPOKER');
  const [isRenaming, setIsRenaming] = useState(false);
  const [tempTitle, setTempTitle] = useState('');

  const [doubleDealerCard, setDoubleDealerCard] = useState<Card | null>(null);
  const [doublePlayerCards, setDoublePlayerCards] = useState<(Card | null)[]>([null, null, null, null]);
  const [doubleResult, setDoubleResult] = useState<'win' | 'loss' | 'tie' | null>(null);
  const [chosenIndex, setChosenIndex] = useState<number | null>(null);

  const handleCycleDenom = () => {
    if (gamePhase !== 'betting' && gamePhase !== 'gameover') return;
    
    const denomValues = [0.05, 0.25, 1, 5, 10];
    const currentCash = credits * denomValues[denomIndex];
    
    const nextIndex = (denomIndex + 1) % denominations.length;
    const nextDenomValue = denomValues[nextIndex];
    
    const nextCredits = Math.floor(currentCash / nextDenomValue);
    
    setDenomIndex(nextIndex);
    setCredits(nextCredits);
    
    setCurrentBet(prev => Math.min(prev, Math.max(5, nextCredits))); 
  };

  const handleBetUp = () => {
    if (gamePhase !== 'betting' && gamePhase !== 'gameover') return;
    if (gamePhase === 'gameover') {
        setWinningHand(null);
        setWinAmount(0);
        setHand([null, null, null, null, null]);
        setGamePhase('betting');
    }
    setCurrentBet(prev => (prev >= 100 ? 5 : prev + 5));
  };

  const handleBetMin = () => {
    if (gamePhase !== 'betting' && gamePhase !== 'gameover') return;
    if (gamePhase === 'gameover') {
        setWinningHand(null);
        setWinAmount(0);
        setHand([null, null, null, null, null]);
        setGamePhase('betting');
    }
    setCurrentBet(5);
  };

  const handleBetMax = () => {
    if (gamePhase !== 'betting' && gamePhase !== 'gameover') return;
    if (gamePhase === 'gameover') {
        setWinningHand(null);
        setWinAmount(0);
        setHand([null, null, null, null, null]);
        setGamePhase('betting');
    }
    setCurrentBet(100);
  };

  const handleDeal = useCallback(() => {
    if (gamePhase === 'betting' || gamePhase === 'gameover') {
      if (credits < currentBet) {
        alert("Not enough credits!");
        return;
      }
      
      const newDeck = shuffle(createDeck());
      const initialHand = newDeck.slice(0, 5);
      const remainingDeck = newDeck.slice(5);
      
      setCredits(prev => prev - currentBet);
      setHand(initialHand);
      setDeck(remainingDeck);
      setHeldIndices(new Set());
      setWinAmount(0);
      setWinningHand(null);
      setGamePhase('holding');

    } else if (gamePhase === 'holding') {
      const finalHand = [...hand];
      let currentDeck = [...deck];

      for (let i = 0; i < 5; i++) {
        if (!heldIndices.has(i)) {
          finalHand[i] = currentDeck[0];
          currentDeck = currentDeck.slice(1);
        }
      }

      const result = evaluateHand(finalHand as Card[]);
      
      const units = currentBet / 5;
      let payoutMultiplier = 0;
      
      if (units <= 5) {
          payoutMultiplier = PAYTABLE[result][Math.max(0, Math.floor(units) - 1)];
      } else {
          payoutMultiplier = PAYTABLE[result][4] * (units / 5);
      }
      
      const payout = Math.floor(payoutMultiplier * 5);

      setHand(finalHand);
      setWinningHand(result !== 'NONE' ? result : null);
      setWinAmount(payout);
      setCredits(prev => prev + payout);
      
      if (result !== 'NONE') {
        const nextStreak = winStreak + 1;
        setWinStreak(nextStreak);
        if (nextStreak === 5) {
          setIsRenaming(true);
        }
      } else {
        setWinStreak(0);
      }

      setGamePhase('gameover');
    }
  }, [gamePhase, credits, currentBet, hand, deck, heldIndices, winStreak, setCredits]);

  const toggleHold = (index: number) => {
    if (gamePhase !== 'holding') return;
    setHeldIndices(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleDoubleStart = () => {
    const newDeck = shuffle(createDeck());
    setDoubleDealerCard(newDeck[0]);
    setDoublePlayerCards(newDeck.slice(1, 5));
    setDoubleResult(null);
    setChosenIndex(null);
    setGamePhase('doubling');
  };

  const handleDoubleChoice = (index: number) => {
    if (doubleResult || !doubleDealerCard) return;
    
    setChosenIndex(index);
    const playerCard = doublePlayerCards[index]!;
    const dealerRankIndex = RANKS.indexOf(doubleDealerCard.rank);
    const playerRankIndex = RANKS.indexOf(playerCard.rank);

    if (playerRankIndex > dealerRankIndex) {
      setDoubleResult('win');
      const newWin = winAmount * 2;
      setCredits(prev => prev + winAmount);
      setWinAmount(newWin);
    } else if (playerRankIndex < dealerRankIndex) {
      setDoubleResult('loss');
      setCredits(prev => prev - winAmount);
      setWinAmount(0);
      setTimeout(() => {
        handleCollect();
      }, 1500);
    } else {
      setDoubleResult('tie');
      setTimeout(() => {
        handleDoubleStart();
      }, 1500);
    }
  };

  const handleCollect = () => {
    setHand([null, null, null, null, null]);
    setHeldIndices(new Set());
    setWinningHand(null);
    setWinAmount(0);
    setGamePhase('betting');
  };

  const handleSaveTitle = () => {
    if (tempTitle.trim()) {
      const newTitle = tempTitle.trim().toUpperCase();
      setGameTitle(newTitle);
      localStorage.setItem('poker_game_title', newTitle);
    }
    setIsRenaming(false);
    setWinStreak(0);
  };

  return (
    <>
      {isRenaming && (
        <div className="naming-overlay glass-panel">
          <div className="naming-card">
            <h2>🏆 STREAK MASTER!</h2>
            <p>You won 5 hands in a row. Rename the game:</p>
            <input 
              autoFocus
              className="naming-input"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              placeholder="Enter new name..."
              onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
            />
            <button className="action-btn primary" onClick={handleSaveTitle}>SAVE NAME</button>
          </div>
        </div>
      )}

      {/* Adding game-title element here so we can keep the logo locally if we want, or remove it from Header. Let me just inject the gameTitle into the parent somehow, or we can just render the title here? 
      Actually, let's keep the header in App.tsx but pass Title from JacksOrBetter via a callback? Or just render the header inside JacksOrBetter and Blackjack wrappers so they can fully customize it. 
      For now, I'll return the full layout-grid here minus the outer wrapper to simplify, but wait, the App.tsx has `<div className="layout-grid">` */}

      <main className="game-main">
        <PayTable currentBet={currentBet} winningHand={winningHand} />
        
        <div className="announcement-window">
            {winningHand && gamePhase !== 'doubling' && (
              <div className="win-alert">
                  <span className="win-label">{winningHand}</span>
                  <span className="win-sub">+{winAmount} CREDITS</span>
              </div>
            )}
            {gamePhase === 'doubling' && (
              <div className="win-alert">
                  <span className="win-label">GAMBLE</span>
                  <span className="win-sub">{winAmount} CREDITS</span>
              </div>
            )}
        </div>

        {gamePhase === 'doubling' ? (
          <DoubleDown 
            dealerCard={doubleDealerCard}
            playerCards={doublePlayerCards}
            onChoice={handleDoubleChoice}
            result={doubleResult}
            chosenIndex={chosenIndex}
          />
        ) : (
          <CardBoard 
            cards={hand} 
            heldIndices={heldIndices} 
            onToggleIndex={toggleHold}
          />
        )}
      </main>

      <footer className="game-footer glass-panel">
        <ControlBar 
          winAmount={winAmount}
          currentBet={currentBet}
          credits={credits}
          onBetUp={handleBetUp}
          onBetMin={handleBetMin}
          onBetMax={handleBetMax}
          onDeal={handleDeal}
          onCycleDenom={handleCycleDenom}
          onDouble={handleDoubleStart}
          onCollect={handleCollect}
          denomination={denominations[denomIndex]}
          denomValue={[0.05, 0.25, 1, 5, 10][denomIndex]}
          gamePhase={gamePhase}
        />
      </footer>
    </>
  );
};
