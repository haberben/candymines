import { useState, useEffect, useCallback } from 'react';
import Candy3D from './Candy3D';
import {
  createBoard,
  findMatches,
  isAdjacent,
  swapCells,
  removeMatches,
  applyGravity,
  calculateScore,
  hasValidMoves,
  shuffleBoard,
} from '@/lib/gameLogic';
import { Cell, Position, GameState, GameStats, LevelConfig } from '@/types/game';

interface GameBoardProps {
  levelConfig: LevelConfig;
  onGameOver: (stats: GameStats) => void;
  onVictory: (stats: GameStats) => void;
}

const CELL_SIZE = 70;
const CELL_GAP = 5;

export default function GameBoard({ levelConfig, onGameOver, onVictory }: GameBoardProps) {
  const [board, setBoard] = useState<Cell[][]>([]);
  const [selectedCell, setSelectedCell] = useState<Position | null>(null);
  const [gameState, setGameState] = useState<GameState>('playing');
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    moves: 0,
    level: levelConfig.level,
    targetScore: levelConfig.targetScore,
    maxMoves: levelConfig.maxMoves,
    combo: 0,
  });

  // Initialize board
  useEffect(() => {
    const newBoard = createBoard(levelConfig.gridSize, levelConfig.candyTypes);
    setBoard(newBoard);
    setStats({
      score: 0,
      moves: 0,
      level: levelConfig.level,
      targetScore: levelConfig.targetScore,
      maxMoves: levelConfig.maxMoves,
      combo: 0,
    });
  }, [levelConfig]);

  // Check for matches after board changes
  const processMatches = useCallback(() => {
    if (gameState !== 'playing') return;

    const matches = findMatches(board);
    
    if (matches.length > 0) {
      setGameState('matching');
      
      // Calculate score
      const matchScore = calculateScore(matches, stats.combo + 1);
      
      setTimeout(() => {
        // Remove matches
        const boardAfterRemoval = removeMatches(board, matches);
        setBoard(boardAfterRemoval);
        
        // Update stats
        setStats(prev => ({
          ...prev,
          score: prev.score + matchScore,
          combo: prev.combo + 1,
        }));
        
        setTimeout(() => {
          // Apply gravity
          const boardAfterGravity = applyGravity(boardAfterRemoval, levelConfig.candyTypes);
          setBoard(boardAfterGravity);
          setGameState('playing');
        }, 400);
      }, 500);
    } else {
      // Reset combo if no matches
      setStats(prev => ({ ...prev, combo: 0 }));
      
      // Check for valid moves
      if (!hasValidMoves(board)) {
        setTimeout(() => {
          const shuffled = shuffleBoard(board, levelConfig.candyTypes);
          setBoard(shuffled);
        }, 500);
      }
    }
  }, [board, gameState, stats.combo, levelConfig.candyTypes]);

  useEffect(() => {
    if (gameState === 'playing' && board.length > 0) {
      const timer = setTimeout(() => {
        processMatches();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [board, gameState, processMatches]);

  // Check win/lose conditions
  useEffect(() => {
    if (stats.score >= stats.targetScore && gameState === 'playing') {
      setGameState('victory');
      onVictory(stats);
    } else if (stats.moves >= stats.maxMoves && stats.score < stats.targetScore && gameState === 'playing') {
      setGameState('gameover');
      onGameOver(stats);
    }
  }, [stats, gameState, onVictory, onGameOver]);

  const handleCellClick = (row: number, col: number) => {
    if (gameState !== 'playing') return;

    const clickedPos: Position = { row, col };

    if (!selectedCell) {
      // First selection
      setSelectedCell(clickedPos);
      const newBoard = board.map(r => r.map(c => ({ ...c, isSelected: false })));
      newBoard[row][col].isSelected = true;
      setBoard(newBoard);
    } else {
      // Second selection
      if (selectedCell.row === row && selectedCell.col === col) {
        // Deselect
        setSelectedCell(null);
        const newBoard = board.map(r => r.map(c => ({ ...c, isSelected: false })));
        setBoard(newBoard);
      } else if (isAdjacent(selectedCell, clickedPos)) {
        // Valid swap
        setGameState('swapping');
        
        const swappedBoard = swapCells(board, selectedCell, clickedPos);
        const matches = findMatches(swappedBoard);
        
        if (matches.length > 0) {
          // Valid move
          setBoard(swappedBoard.map(r => r.map(c => ({ ...c, isSelected: false }))));
          setSelectedCell(null);
          setStats(prev => ({ ...prev, moves: prev.moves + 1 }));
          
          setTimeout(() => {
            setGameState('playing');
          }, 300);
        } else {
          // Invalid move - swap back
          setTimeout(() => {
            const newBoard = board.map(r => r.map(c => ({ ...c, isSelected: false })));
            setBoard(newBoard);
            setSelectedCell(null);
            setGameState('playing');
          }, 300);
        }
      } else {
        // Not adjacent - new selection
        setSelectedCell(clickedPos);
        const newBoard = board.map(r => r.map(c => ({ ...c, isSelected: false })));
        newBoard[row][col].isSelected = true;
        setBoard(newBoard);
      }
    }
  };

  const getCellPosition = (row: number, col: number) => {
    return {
      x: col * (CELL_SIZE + CELL_GAP),
      y: row * (CELL_SIZE + CELL_GAP),
    };
  };

  const boardWidth = levelConfig.gridSize * (CELL_SIZE + CELL_GAP) - CELL_GAP;
  const boardHeight = levelConfig.gridSize * (CELL_SIZE + CELL_GAP) - CELL_GAP;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Stats HUD */}
      <div className="flex gap-6 text-white">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/20">
          <div className="text-sm opacity-80">Skor</div>
          <div className="text-2xl font-bold">{stats.score.toLocaleString()}</div>
          <div className="text-xs opacity-60">Hedef: {stats.targetScore.toLocaleString()}</div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/20">
          <div className="text-sm opacity-80">Hamle</div>
          <div className="text-2xl font-bold">{stats.moves} / {stats.maxMoves}</div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/20">
          <div className="text-sm opacity-80">Seviye</div>
          <div className="text-2xl font-bold">{stats.level}</div>
        </div>
        
        {stats.combo > 0 && (
          <div className="bg-gradient-to-r from-[#FF5DA2] to-[#7C4DFF] rounded-lg px-6 py-3 border border-white/20 animate-pulse">
            <div className="text-sm opacity-90">Combo!</div>
            <div className="text-2xl font-bold">x{stats.combo}</div>
          </div>
        )}
      </div>

      {/* Game Board */}
      <div
        className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10"
        style={{
          width: boardWidth + 32,
          height: boardHeight + 32,
        }}
      >
        <div
          className="relative"
          style={{
            width: boardWidth,
            height: boardHeight,
          }}
        >
          {/* Grid cells */}
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const pos = getCellPosition(rowIndex, colIndex);
              
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  className={`absolute rounded-lg transition-all cursor-pointer ${
                    cell.isSelected
                      ? 'bg-white/30 ring-2 ring-white'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                  style={{
                    left: pos.x,
                    top: pos.y,
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                  }}
                >
                  {cell.type && (
                    <Candy3D
                      type={cell.type}
                      position={{ x: 5, y: 5 }}
                      isSelected={cell.isSelected}
                      isMatched={cell.isMatched}
                      size={60}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-md">
        <div className="flex justify-between text-white text-sm mb-2">
          <span>İlerleme</span>
          <span>{Math.min(100, Math.round((stats.score / stats.targetScore) * 100))}%</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#FF5DA2] to-[#7C4DFF] h-full transition-all duration-500"
            style={{
              width: `${Math.min(100, (stats.score / stats.targetScore) * 100)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
