import { useState, useCallback } from 'react';
import { PayTable } from './components/PayTable';
import { CardBoard } from './components/CardBoard';
import { ControlBar } from './components/ControlBar';
import { DoubleDown } from './components/DoubleDown';
import './App.css';
import { 
  createDeck, 
  shuffle, 
  evaluateHand, 
  PAYTABLE, 
  Card, 
  HandType,
  RANKS
} from './utils/pokerLogic';

function App() {
  const [credits, setCredits] = useState(10000);
  const [currentBet, setCurrentBet] = useState(5);
  const [hand, setHand] = useState<(Card | null)[]>([null, null, null, null, null]);
  const [deck, setDeck] = useState<Card[]>([]);
  const [heldIndices, setHeldIndices] = useState<Set<number>>(new Set());
  const [gamePhase, setGamePhase] = useState<'betting' | 'holding' | 'gameover' | 'doubling'>('betting');
  const [winAmount, setWinAmount] = useState(0);
  const [winningHand, setWinningHand] = useState<HandType | null>(null);
  const [denomIndex, setDenomIndex] = useState(0);
  const denominations = ['5¢', '25¢', '$1', '$5', '$10'];

  // Win Streak / Renaming logic
  const [winStreak, setWinStreak] = useState(0);
  const [gameTitle, setGameTitle] = useState(() => localStorage.getItem('poker_game_title') || 'TUBMANPOKER');
  const [isRenaming, setIsRenaming] = useState(false);
  const [tempTitle, setTempTitle] = useState('');

  // Double Down states
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
    
    // Scale credits to maintain the same cash value
    const nextCredits = Math.floor(currentCash / nextDenomValue);
    
    setDenomIndex(nextIndex);
    setCredits(nextCredits);
    
    // Ensure current bet doesn't exceed new credit total or remain at zero
    // We try to keep the same scale (increment by 5) but cap it at 100 or the new total
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
    // Start session or start new deal from gameover
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
      
      // Calculate payout based on 5-unit increments
      const units = currentBet / 5;
      let payoutMultiplier = 0;
      
      if (units <= 5) {
          payoutMultiplier = PAYTABLE[result][Math.max(0, Math.floor(units) - 1)];
      } else {
          // Linear scaling for bets above 25 based on the level 5 bonus
          payoutMultiplier = PAYTABLE[result][4] * (units / 5);
      }
      
      const payout = Math.floor(payoutMultiplier * 5); // Total credits won

      setHand(finalHand);
      setWinningHand(result !== 'NONE' ? result : null);
      setWinAmount(payout);
      setCredits(prev => prev + payout);
      
      // Update streak
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
  }, [gamePhase, credits, currentBet, hand, deck, heldIndices]);

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
      setCredits(prev => prev + winAmount); // Add another winAmount to double the previous addition
      setWinAmount(newWin);
    } else if (playerRankIndex < dealerRankIndex) {
      setDoubleResult('loss');
      setCredits(prev => prev - winAmount); // Lose what was added
      setWinAmount(0);
      setTimeout(() => {
        handleCollect();
      }, 1500);
    } else {
      setDoubleResult('tie');
      setTimeout(() => {
        handleDoubleStart(); // Restart on push
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
    setWinStreak(0); // Reset after renaming
  };

  return (
    <div className="modern-app">
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

      <div className="layout-grid">
        <header className="game-header">
           <h1 className="logo">{gameTitle}</h1>
           <div className="header-stats">
                {winStreak > 0 && (
                   <div className="streak-pill glass-panel">
                     🔥 STREAK: {winStreak}
                   </div>
                )}
                <div className="stat-pill glass-panel">JACKS OR BETTER</div>
           </div>
        </header>

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
      </div>
    </div>
  );
}

export default App;
