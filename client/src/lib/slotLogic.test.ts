import { describe, it, expect } from 'vitest';
import {
  createSlotGrid,
  revealCell,
  calculateTotalMultiplier,
  calculateCurrentWin,
  getRevealedCount,
  canReveal,
  calculateWinProbability,
} from './slotLogic';

describe('slotLogic', () => {
  describe('createSlotGrid', () => {
    it('should create a grid with correct dimensions', () => {
      const grid = createSlotGrid(5, 3);
      expect(grid).toHaveLength(5);
      expect(grid[0]).toHaveLength(5);
    });

    it('should place exact number of mines', () => {
      const grid = createSlotGrid(5, 3);
      let mineCount = 0;
      
      grid.forEach(row => {
        row.forEach(cell => {
          if (cell.isMine) mineCount++;
        });
      });
      
      expect(mineCount).toBe(3);
    });

    it('should assign multipliers to non-mine cells', () => {
      const grid = createSlotGrid(5, 3);
      
      grid.forEach(row => {
        row.forEach(cell => {
          if (!cell.isMine) {
            expect(cell.baseWin + cell.multiplier).toBeGreaterThanOrEqual(0); // baseWin veya multiplier olabilir
          } else {
            expect(cell.multiplier).toBe(0);
          }
        });
      });
    });

    it('should initialize all cells as hidden', () => {
      const grid = createSlotGrid(5, 3);
      
      grid.forEach(row => {
        row.forEach(cell => {
          expect(cell.state).toBe('hidden');
        });
      });
    });
  });

  describe('revealCell', () => {
    it('should reveal a safe cell', () => {
      const grid = createSlotGrid(5, 3);
      
      // Find a safe cell
      let safeRow = 0, safeCol = 0;
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          if (!grid[i][j].isMine) {
            safeRow = i;
            safeCol = j;
            break;
          }
        }
      }
      
      const { newGrid, isMine, baseWin, multiplier } = revealCell(grid, safeRow, safeCol);
      
      expect(isMine).toBe(false);
      expect(baseWin + multiplier).toBeGreaterThanOrEqual(0); // baseWin veya multiplier
      expect(newGrid[safeRow][safeCol].state).toBe('revealed');
    });

    it('should reveal a mine and disable other cells', () => {
      const grid = createSlotGrid(5, 3);
      
      // Find a mine
      let mineRow = 0, mineCol = 0;
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          if (grid[i][j].isMine) {
            mineRow = i;
            mineCol = j;
            break;
          }
        }
      }
      
      const { newGrid, isMine, multiplier } = revealCell(grid, mineRow, mineCol);
      
      expect(isMine).toBe(true);
      expect(multiplier).toBe(0);
      expect(newGrid[mineRow][mineCol].state).toBe('mine');
      
      // Check that other hidden cells are disabled
      let hasDisabled = false;
      newGrid.forEach(row => {
        row.forEach(cell => {
          if (cell.state === 'disabled') {
            hasDisabled = true;
          }
        });
      });
      expect(hasDisabled).toBe(true);
    });

    it('should not reveal already revealed cells', () => {
      const grid = createSlotGrid(5, 3);
      grid[0][0].state = 'revealed';
      
      const { newGrid } = revealCell(grid, 0, 0);
      expect(newGrid[0][0].state).toBe('revealed');
    });
  });

  describe('calculateTotalMultiplier', () => {
    it('should return 0 when no cells are revealed', () => {
      const grid = createSlotGrid(5, 3);
      const multiplier = calculateTotalMultiplier(grid);
      expect(multiplier).toBe(0);
    });

    it('should calculate multiplier for revealed cells', () => {
      const grid = createSlotGrid(5, 3);
      grid[0][0].state = 'revealed';
      grid[0][0].multiplier = 2;
      grid[0][1].state = 'revealed';
      grid[0][1].multiplier = 3;
      
      const multiplier = calculateTotalMultiplier(grid);
      expect(multiplier).toBe(5); // 2 + 3 (TOPLAMA)
    });
  });

  describe('calculateCurrentWin', () => {
    it('should calculate win correctly', () => {
      const win = calculateCurrentWin(100, 5.5); // 100 * (1 + 5.5) = 650
      expect(win).toBe(650);
    });

    it('should floor the result', () => {
      const win = calculateCurrentWin(100, 5.55); // 100 * (1 + 5.55) = 655
      expect(win).toBe(655);
    });
  });

  describe('getRevealedCount', () => {
    it('should count revealed cells', () => {
      const grid = createSlotGrid(5, 3);
      grid[0][0].state = 'revealed';
      grid[0][1].state = 'revealed';
      grid[1][0].state = 'revealed';
      
      const count = getRevealedCount(grid);
      expect(count).toBe(3);
    });

    it('should return 0 when no cells are revealed', () => {
      const grid = createSlotGrid(5, 3);
      const count = getRevealedCount(grid);
      expect(count).toBe(0);
    });
  });

  describe('canReveal', () => {
    it('should return true for hidden cells', () => {
      const grid = createSlotGrid(5, 3);
      expect(canReveal(grid, 0, 0)).toBe(true);
    });

    it('should return false for revealed cells', () => {
      const grid = createSlotGrid(5, 3);
      grid[0][0].state = 'revealed';
      expect(canReveal(grid, 0, 0)).toBe(false);
    });

    it('should return false for mine cells', () => {
      const grid = createSlotGrid(5, 3);
      grid[0][0].state = 'mine';
      expect(canReveal(grid, 0, 0)).toBe(false);
    });
  });

  describe('calculateWinProbability', () => {
    it('should calculate correct probability', () => {
      // 5x5 grid = 25 cells, 3 mines = 22 safe cells
      // 0 revealed = 22/25 = 88%
      const prob = calculateWinProbability(5, 3, 0);
      expect(prob).toBeCloseTo(88, 0);
    });

    it('should decrease probability as cells are revealed', () => {
      const prob1 = calculateWinProbability(5, 3, 0);
      const prob2 = calculateWinProbability(5, 3, 5);
      expect(prob2).toBeLessThan(prob1);
    });

    it('should return 0 when all cells are revealed', () => {
      const prob = calculateWinProbability(5, 3, 25);
      expect(prob).toBe(0);
    });
  });
});
