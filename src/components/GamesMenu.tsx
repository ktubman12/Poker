import React, { useState } from 'react';

interface GamesMenuProps {
  currentGame: 'jacks' | 'blackjack';
  onSwitchGame: (game: 'jacks' | 'blackjack') => void;
}

export const GamesMenu: React.FC<GamesMenuProps> = ({ currentGame, onSwitchGame }) => {
  const [isOpen, setIsOpen] = useState(false);

  const games = [
    { id: 'jacks' as const, label: 'JACKS OR BETTER' },
    { id: 'blackjack' as const, label: 'BLACKJACK' },
  ];

  const currentLabel = games.find(g => g.id === currentGame)?.label;

  return (
    <div className="games-menu-container" style={{ position: 'relative' }}>
      <div 
        className="stat-pill glass-panel clickable" 
        onClick={() => setIsOpen(!isOpen)}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
      >
        {currentLabel} <span style={{ fontSize: '0.8em' }}>▼</span>
      </div>
      {isOpen && (
        <div 
          className="glass-panel"
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '5px',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
            padding: '10px',
            zIndex: 100,
            minWidth: '150px'
          }}
        >
          {games.map(game => (
            <button 
              key={game.id}
              className={`action-btn ${currentGame === game.id ? 'primary' : ''}`}
              style={{ padding: '8px 15px', width: '100%', textAlign: 'left', fontSize: '14px' }}
              onClick={() => {
                onSwitchGame(game.id);
                setIsOpen(false);
              }}
            >
              {game.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
