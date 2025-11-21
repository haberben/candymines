import { SlotCell, SYMBOL_CONFIG, MINE_IMAGE } from '@/types/slotGame';
import { useState } from 'react';
import ParticleEffect from './ParticleEffect';

interface SlotCandyCellProps {
  cell: SlotCell;
  size: number;
  onClick: () => void;
  disabled: boolean;
}

export default function SlotCandyCell({ cell, size, onClick, disabled }: SlotCandyCellProps) {
  const [showParticles, setShowParticles] = useState(false);
  const [particlePos, setParticlePos] = useState({ x: 0, y: 0 });
  
  const isClickable = cell.state === 'hidden' && !disabled;
  const symbolConfig = SYMBOL_CONFIG[cell.symbolType];
  
  const handleClick = () => {
    if (!isClickable) return;
    
    // Show particles on reveal
    if (cell.state === 'hidden') {
      setParticlePos({ x: size / 2, y: size / 2 });
      setShowParticles(true);
      setTimeout(() => setShowParticles(false), 1500);
    }
    
    onClick();
  };
  
  return (
    <div
      className="relative"
      style={{
        width: size,
        height: size,
        perspective: '1000px',
      }}
    >
      {/* 3D Flip Container */}
      <div
        onClick={handleClick}
        className={`
          relative w-full h-full transition-all duration-500
          ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
        `}
        style={{
          transformStyle: 'preserve-3d',
          transform: cell.state === 'hidden' ? 'rotateY(0deg)' : 'rotateY(180deg)',
        }}
      >
        {/* Front Face - Hidden State */}
        <div
          className="absolute inset-0 rounded-2xl neon-box-hidden flex items-center justify-center"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <div className="text-white text-5xl font-bold neon-text-purple animate-pulse">
            ?
          </div>
        </div>

        {/* Back Face - Revealed/Mine State */}
        <div
          className={`
            absolute inset-0 rounded-2xl flex items-center justify-center p-2
            ${cell.state === 'revealed' ? 'neon-box-revealed' : ''}
            ${cell.state === 'mine' ? 'neon-box-mine' : ''}
            ${cell.state === 'disabled' ? 'neon-box-disabled' : ''}
          `}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* Revealed - Show Symbol */}
          {cell.state === 'revealed' && (
            <img
              src={symbolConfig.image}
              alt={cell.symbolType}
              className="w-full h-full object-contain"
              style={{
                filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.5))',
              }}
            />
          )}

          {/* Mine - Show Bomb */}
          {cell.state === 'mine' && (
            <img
              src={MINE_IMAGE}
              alt="mine"
              className="w-full h-full object-contain"
              style={{
                filter: 'drop-shadow(0 0 15px rgba(248, 113, 113, 0.8))',
              }}
            />
          )}

          {/* Disabled Mine - Dimmed */}
          {cell.state === 'disabled' && cell.isMine && (
            <img
              src={MINE_IMAGE}
              alt="mine"
              className="w-full h-full object-contain opacity-20"
            />
          )}
        </div>
      </div>

      {/* Particle Effect */}
      {showParticles && cell.state === 'revealed' && (
        <ParticleEffect
          x={particlePos.x}
          y={particlePos.y}
          type="star"
        />
      )}

      {/* Neon glow overlay for hover */}
      {isClickable && (
        <div className="absolute inset-0 rounded-2xl neon-hover-overlay pointer-events-none" />
      )}
    </div>
  );
}
