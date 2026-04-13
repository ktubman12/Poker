import React, { useState, useEffect, useCallback } from 'react';
import { Card, createDeck, shuffle } from '../utils/pokerLogic';
import { calculateHandValue, isBlackjack, shouldDealerHit } from '../utils/blackjackLogic';
import { ControlBar } from './ControlBar';
import '../App.css';
import './Blackjack.css';

interface BlackjackProps {
  credits: number;
  setCredits: React.Dispatch<React.SetStateAction<number>>;
  denomIndex: number;
  setDenomIndex: React.Dispatch<React.SetStateAction<number>>;
  denominations: string[];
}

type Phase = 'betting' | 'playerTurn' | 'dealerTurn' | 'gameover';

// Using a custom card renderer for Blackjack since CardBoard is for 5-card poker
const PlayingCard = ({ card, hidden = false }: { card: Card | null, hidden?: boolean }) => {
  if (!card && !hidden) return <div className="card empty" />;
  
  if (hidden) {
    return (
      <div className="card-container">
        <div className="card back"></div>
      </div>
    );
  }

  const isRed = card!.suit === 'hearts' || card!.suit === 'diamonds';
  const suitSymbols: Record<string, string> = { hearts: '♥', diamonds: '♦', spades: '♠', clubs: '♣' };
  const symbol = suitSymbols[card!.suit];

  return (
    <div className="card-container">
      <div className="card front">
        <div className={`card-inner ${isRed ? 'red' : 'black'}`}>
          <div className="card-top">
            <span className="rank">{card!.rank}</span>
            <span className="suit small">{symbol}</span>
          </div>
          <div className="card-center">
            <span className="suit large">{symbol}</span>
          </div>
          <div className="card-bottom">
            <span className="rank">{card!.rank}</span>
            <span className="suit small">{symbol}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Blackjack: React.FC<BlackjackProps> = ({
  credits,
  setCredits,
  denomIndex,
  setDenomIndex,
  denominations
}) => {
  const [currentBet, setCurrentBet] = useState(5);
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [dealerCards, setDealerCards] = useState<Card[]>([]);
  const [gamePhase, setGamePhase] = useState<Phase>('betting');
  const [winAmount, setWinAmount] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

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
    if (gamePhase === 'gameover') resetTable();
    setCurrentBet(prev => (prev >= 100 ? 5 : prev + 5));
  };

  const handleBetMin = () => {
    if (gamePhase !== 'betting' && gamePhase !== 'gameover') return;
    if (gamePhase === 'gameover') resetTable();
    setCurrentBet(5);
  };

  const handleBetMax = () => {
    if (gamePhase !== 'betting' && gamePhase !== 'gameover') return;
    if (gamePhase === 'gameover') resetTable();
    setCurrentBet(100);
  };

  const resetTable = () => {
    setPlayerCards([]);
    setDealerCards([]);
    setMessage(null);
    setWinAmount(0);
    setGamePhase('betting');
  };

  const handleDeal = () => {
    if (gamePhase === 'betting' || gamePhase === 'gameover') {
      if (credits < currentBet) {
        alert("Not enough credits!");
        return;
      }

      setCredits(prev => prev - currentBet);
      setMessage(null);
      setWinAmount(0);

      const d = shuffle(createDeck());
      const pCards = [d[0], d[2]];
      const dCards = [d[1], d[3]];

      setPlayerCards(pCards);
      setDealerCards(dCards);
      setDeck(d.slice(4));

      // Check for immediate blackjack
      const pBj = isBlackjack(pCards);
      const dBj = isBlackjack(dCards);

      if (pBj || dBj) {
        setGamePhase('dealerTurn'); // Skip player turn, resolve immediately
      } else {
        setGamePhase('playerTurn');
      }
    }
  };

  const handleHit = () => {
    if (gamePhase !== 'playerTurn') return;
    
    const newCard = deck[0];
    const newHand = [...playerCards, newCard];
    setPlayerCards(newHand);
    setDeck(deck.slice(1));

    const { total } = calculateHandValue(newHand);
    if (total > 21) {
      setGamePhase('gameover');
      handleResult(newHand, dealerCards, currentBet); // Bust handled in handleResult
    }
  };

  const handleStand = () => {
    if (gamePhase !== 'playerTurn') return;
    setGamePhase('dealerTurn');
  };

  const handleDoubleDown = () => {
    if (gamePhase !== 'playerTurn' || playerCards.length !== 2) return;
    if (credits < currentBet) {
      alert("Not enough credits to double down!");
      return;
    }

    setCredits(prev => prev - currentBet); // Bet matched again
    
    const doubleBet = currentBet * 2;
    const newCard = deck[0];
    const newHand = [...playerCards, newCard];
    
    setPlayerCards(newHand);
    setDeck(deck.slice(1));
    
    const { total } = calculateHandValue(newHand);
    
    // Automatically transition to dealer turn whether bust or stand, 
    // unless they bust, then we go to gameover. Actually, we can just transition to dealerTurn,
    // the game loop will resolve it. But typically if you bust on double down, dealer doesn't draw.
    if (total > 21) {
      setGamePhase('gameover');
      handleResult(newHand, dealerCards, doubleBet);
    } else {
      setGamePhase('dealerTurn');
    }
  };

  const handleResult = (pHand: Card[], dHand: Card[], betAmount: number) => {
    const pValue = calculateHandValue(pHand).total;
    const dValue = calculateHandValue(dHand).total;
    
    const pBj = isBlackjack(pHand);
    const dBj = isBlackjack(dHand);

    let payout = 0;
    let msg = "";

    if (pValue > 21) {
      msg = "BUST";
      payout = 0;
    } else if (dBj && pBj) {
      msg = "PUSH";
      payout = betAmount; // return bet
    } else if (pBj) {
      msg = "BLACKJACK!";
      payout = betAmount + Math.floor(betAmount * 1.5); // 3 to 2 payout
    } else if (dBj) {
      msg = "DEALER BLACKJACK";
      payout = 0;
    } else if (dValue > 21 || pValue > dValue) {
      msg = "YOU WIN!";
      payout = betAmount * 2;
    } else if (pValue < dValue) {
      msg = "DEALER WINS";
      payout = 0;
    } else {
      msg = "PUSH";
      payout = betAmount; // return bet
    }

    if (payout > 0) {
      setCredits(prev => prev + payout);
      // For control bar logic: pass internal winAmount excluding initial bet for display if preferred.
      // E.g., if you bet 10 and win 20, the "win" is 20 in terms of payout. 
      // But purely profit is 10. Let's just say winAmount is what is added to balance (payout - bet) or total payout.
      // The Jacks or Better control bar displays total payout. Let's do total payout.
      setWinAmount(payout); 
    }

    setMessage(msg);
    setGamePhase('gameover');
  };

  // Run dealer turn
  useEffect(() => {
    if (gamePhase === 'dealerTurn') {
      let currentDealerHand = [...dealerCards];
      let currentDeck = [...deck];

      // If player already busted or got blackjack, we don't draw (optimization handled in handleHit/handleDeal, but just in case)
      const pTotal = calculateHandValue(playerCards).total;
      if (pTotal <= 21 && !isBlackjack(playerCards)) {
        while (shouldDealerHit(currentDealerHand)) {
          currentDealerHand.push(currentDeck[0]);
          currentDeck = currentDeck.slice(1);
        }
      }

      setDealerCards(currentDealerHand);
      setDeck(currentDeck);
    }
  }, [gamePhase]);
  
  // Actually, let's fix double down bet tracking.
  const [actualBetInPlay, setActualBetInPlay] = useState(5);
  
  // Override handleDeal to set bet in play
  const safeHandleDeal = () => {
    setActualBetInPlay(currentBet);
    handleDeal();
  };

  const safeHandleDouble = () => {
    setActualBetInPlay(currentBet * 2);
    handleDoubleDown();
  }

  useEffect(() => {
    if (gamePhase === 'dealerTurn' && dealerCards.length > 0) {
      // Small timeout for visual effect
      const timer = setTimeout(() => {
        let finalDHand = [...dealerCards];
        let currentDeck = [...deck];
        const pTotal = calculateHandValue(playerCards).total;
        
        if (pTotal <= 21 && !isBlackjack(playerCards) && !isBlackjack(finalDHand)) {
           while (shouldDealerHit(finalDHand)) {
             finalDHand.push(currentDeck[0]);
             currentDeck = currentDeck.slice(1);
           }
        }
        setDealerCards(finalDHand);
        // We calculate result now
        handleResult(playerCards, finalDHand, actualBetInPlay);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gamePhase]);

  const pTotal = calculateHandValue(playerCards).total;
  const dTotal = gamePhase === 'gameover' || gamePhase === 'dealerTurn' 
    ? calculateHandValue(dealerCards).total 
    : calculateHandValue([dealerCards[0], null]).total;

  return (
    <>
      <main className="game-main">
        <div className="blackjack-board">
          
          <div className="dealer-area">
            {dealerCards.length > 0 && (
               <div className="cards-container">
                 <PlayingCard card={dealerCards[0]} />
                 {gamePhase === 'playerTurn' ? (
                   <PlayingCard card={null} hidden={true} />
                 ) : (
                   dealerCards.slice(1).map((c, i) => <PlayingCard key={i} card={c} />)
                 )}
               </div>
            )}
            {(gamePhase === 'dealerTurn' || gamePhase === 'gameover') && dTotal > 0 && (
                <div style={{ color: 'white', fontWeight: 'bold' }}>Dealer: {dTotal}</div>
            )}
          </div>

          <div className="blackjack-ribbon">
            <h2>BLACKJACK PAYS 3 TO 2</h2>
            <p>Dealer Must Hit on Soft 17</p>
            <p style={{ fontSize: '0.8rem', color: '#ccc' }}>INSURANCE PAYS 2 TO 1</p>
          </div>

          <div className="player-area">
            {playerCards.length > 0 && (
               <div className="cards-container" style={{ position: 'relative' }}>
                 <div className="hand-total-bubble">{pTotal}</div>
                 {playerCards.map((c, i) => <PlayingCard key={i} card={c} />)}
               </div>
            )}

            <div className="bet-chips-area">
               {gamePhase === 'playerTurn' || gamePhase === 'dealerTurn' || gamePhase === 'gameover' ? (
                  <div className="chip-stack">
                     <div className="chip">{denomIndex >= 2 ? '$' : ''}{(actualBetInPlay / (denomIndex < 2 ? 5 : 1))}</div>
                     <div className="chip-label">${(actualBetInPlay * [0.05, 0.25, 1, 5, 10][denomIndex]).toFixed(2)}</div>
                  </div>
               ) : null}
            </div>
          </div>

          <div className="announcement-window" style={{ position: 'absolute', zIndex: 100 }}>
              {message && (
                <div className="win-alert">
                    <span className="win-label">{message}</span>
                    {winAmount > 0 && <span className="win-sub">+{winAmount} CREDITS</span>}
                </div>
              )}
          </div>

          <div className="blackjack-actions">
            {gamePhase === 'playerTurn' && (
              <>
                <button className="bj-btn btn-hit" onClick={handleHit}>Hit</button>
                <button className="bj-btn btn-stand" onClick={handleStand}>Stand</button>
                {playerCards.length === 2 && (
                  <button className="bj-btn btn-double" onClick={safeHandleDouble}>Double</button>
                )}
              </>
            )}
          </div>

        </div>
      </main>

      <footer className="game-footer glass-panel">
        <ControlBar 
          winAmount={winAmount}
          currentBet={currentBet}
          credits={credits}
          // The standard control bar expects 5-increment betting
          onBetUp={handleBetUp}
          onBetMin={handleBetMin}
          onBetMax={handleBetMax}
          onDeal={safeHandleDeal}
          onCycleDenom={handleCycleDenom}
          // Blackjack doesn't use these but they are required by props
          onDouble={()=>{}} 
          onCollect={resetTable}
          denomination={denominations[denomIndex]}
          denomValue={[0.05, 0.25, 1, 5, 10][denomIndex]}
          // Override phase so standard deal button is disabled during play
          gamePhase={gamePhase === 'betting' || gamePhase === 'gameover' ? 'betting' : 'holding'}
        />
      </footer>
    </>
  );
};
