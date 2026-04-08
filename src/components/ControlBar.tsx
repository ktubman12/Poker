import React from 'react';
import './ControlBar.css';

interface ControlBarProps {
  winAmount: number;
  currentBet: number;
  credits: number;
  onBetUp: () => void;
  onBetMin: () => void;
  onBetMax: () => void;
  onDeal: () => void;
  onCycleDenom: () => void;
  onDouble: () => void;
  onCollect: () => void;
  denomination: string;
  denomValue: number;
  gamePhase: 'betting' | 'holding' | 'gameover' | 'doubling';
}

const IconTrophy = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 22V18"/><path d="M14 22V18"/><path d="M18 4H6v7a6 6 0 0 0 12 0V4Z"/></svg>
);

const IconTrending = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
);

const IconCoins = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/></svg>
);

const IconZap = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
);

const InfoModule = ({ label, value, icon: Icon, colorClass = '' }: { label: string, value: string | number, icon: any, colorClass?: string }) => (
  <div className="info-module glass-panel">
    <div className="module-icon">
      <Icon />
    </div>
    <div className="module-content">
      <span className="module-label">{label}</span>
      <span className={`module-value ${colorClass}`}>{value}</span>
    </div>
  </div>
);

export const ControlBar: React.FC<ControlBarProps> = ({
  winAmount,
  currentBet,
  credits,
  onBetUp,
  onBetMin,
  onBetMax,
  onDeal,
  onCycleDenom,
  onDouble,
  onCollect,
  denomination,
  denomValue,
  gamePhase
}) => {
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };
  return (
    <div className="control-bar-modern">
      <div className="modules-row">
        <InfoModule 
            label="WIN" 
            value={winAmount > 0 ? winAmount : '−'} 
            icon={IconTrophy} 
            colorClass="text-gradient-win"
        />
        <InfoModule 
            label="BET" 
            value={currentBet} 
            icon={IconTrending} 
            colorClass="text-gradient-gold"
        />
        <div className="center-actions">
             <div 
                className="multiplier-badge glass-panel clickable" 
                onClick={onCycleDenom}
                title="Change Denomination"
             >
                {denomination}
             </div>
        </div>
        <InfoModule 
            label="BALANCE" 
            value={formatCurrency(credits * denomValue)} 
            icon={IconCoins} 
            colorClass="text-primary"
        />
      </div>

      <div className="actions-row">
        <div className="utility-buttons">
            <button className="icon-btn glass-panel">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
        </div>

        <div className="main-buttons">
            <button 
                className="action-btn secondary" 
                onClick={onBetUp}
                disabled={gamePhase !== 'betting' && gamePhase !== 'gameover'}
            >
                BET UP
            </button>
            <button 
                className="action-btn secondary" 
                onClick={onBetMin}
                disabled={gamePhase !== 'betting' && gamePhase !== 'gameover'}
            >
                MIN BET
            </button>
            <button 
                className="action-btn secondary" 
                onClick={onBetMax}
                disabled={gamePhase !== 'betting' && gamePhase !== 'gameover'}
            >
                MAX BET
            </button>

            {gamePhase === 'gameover' && winAmount > 0 && (
                <button 
                    className="action-btn secondary glow" 
                    onClick={onDouble}
                >
                    DOUBLE
                </button>
            )}
            {gamePhase === 'doubling' && (
                <button 
                    className="action-btn secondary" 
                    onClick={onCollect}
                >
                    COLLECT
                </button>
            )}
            <button 
                className="action-btn primary" 
                onClick={onDeal}
                disabled={gamePhase === 'holding' || gamePhase === 'doubling'}
            >
                {gamePhase === 'holding' ? <><IconZap /> DRAW</> : 'DEAL'}
            </button>
        </div>
      </div>
    </div>
  );
};
