import { useState, useCallback } from 'react';
import { PayTable } from './components/PayTable';
import { CardBoard } from './components/CardBoard';
import { ControlBar } from './components/ControlBar';
import './App.css';
import { 
  createDeck, 
  shuffle, 
  evaluateHand, 
  PAYTABLE, 
  Card, 
  HandType 
} from './utils/pokerLogic';

function App() {
  const [credits, setCredits] = useState(4460);
  const [currentBet, setCurrentBet] = useState(5);
  const [hand, setHand] = useState<(Card | null)[]>([null, null, null, null, null]);
  const [deck, setDeck] = useState<Card[]>([]);
  const [heldIndices, setHeldIndices] = useState<Set<number>>(new Set());
  const [gamePhase, setGamePhase] = useState<'betting' | 'holding' | 'gameover'>('betting');
  const [winAmount, setWinAmount] = useState(0);
  const [winningHand, setWinningHand] = useState<HandType | null>(null);

  const handleBetUp = () => {
    if (gamePhase !== 'betting') return;
    setCurrentBet(prev => (prev % 5) + 1);
  };

  const handleBetMax = () => {
    if (gamePhase !== 'betting') return;
    setCurrentBet(5);
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
      const payout = PAYTABLE[result][currentBet - 1];

      setHand(finalHand);
      setWinningHand(result !== 'NONE' ? result : null);
      setWinAmount(payout);
      setCredits(prev => prev + payout);
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

  return (
    <div className="modern-app">
      <div className="layout-grid">
        <header className="game-header">
           <h1 className="logo">TUBMAN<span className="accent">POKER</span></h1>
           <div className="header-stats">
                <div className="stat-pill glass-panel">JACKS OR BETTER</div>
           </div>
        </header>

        <main className="game-main">
          <PayTable currentBet={currentBet} winningHand={winningHand} />
          
          <div className="announcement-window">
              {winningHand && (
                <div className="win-alert">
                    <span className="win-label">{winningHand}</span>
                    <span className="win-sub">+{winAmount} CREDITS</span>
                </div>
              )}
          </div>

          <CardBoard 
            cards={hand} 
            heldIndices={heldIndices} 
            onToggleIndex={toggleHold}
          />
        </main>

        <footer className="game-footer glass-panel">
          <ControlBar 
            winAmount={winAmount}
            currentBet={currentBet}
            credits={credits}
            onBetUp={handleBetUp}
            onBetMax={handleBetMax}
            onDeal={handleDeal}
            gamePhase={gamePhase}
          />
        </footer>
      </div>
    </div>
  );
}

export default App;
