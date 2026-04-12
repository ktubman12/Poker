import { useState } from 'react';
import './App.css';
import { JacksOrBetter } from './components/JacksOrBetter';
import { GamesMenu } from './components/GamesMenu';
import { Blackjack } from './components/Blackjack'; 

function App() {
  const [credits, setCredits] = useState(10000);
  const [denomIndex, setDenomIndex] = useState(0);
  const denominations = ['5¢', '25¢', '$1', '$5', '$10'];
  const [currentGame, setCurrentGame] = useState<'jacks' | 'blackjack'>('jacks');

  const gameTitle = localStorage.getItem('poker_game_title') || 'TUBMANPOKER';

  return (
    <div className="modern-app">
      <div className="layout-grid">
        <header className="game-header">
           <h1 className="logo">{currentGame === 'jacks' ? gameTitle : 'BLACKJACK'}</h1>
           <div className="header-stats" style={{ display: 'flex', gap: '10px' }}>
                <GamesMenu currentGame={currentGame} onSwitchGame={setCurrentGame} />
           </div>
        </header>

        {currentGame === 'jacks' && (
          <JacksOrBetter 
            credits={credits}
            setCredits={setCredits}
            denomIndex={denomIndex}
            setDenomIndex={setDenomIndex}
            denominations={denominations}
          />
        )}

        {currentGame === 'blackjack' && (
          <Blackjack 
            credits={credits}
            setCredits={setCredits}
            denomIndex={denomIndex}
            setDenomIndex={setDenomIndex}
            denominations={denominations}
          />
        )}
      </div>
    </div>
  );
}

export default App;
