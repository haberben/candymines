import { describe, it, expect } from 'vitest';
import {
  createBoard,
  findMatches,
  isAdjacent,
  swapCells,
  calculateScore,
} from './gameLogic';
import { Cell, Position } from '@/types/game';

describe('gameLogic', () => {
  describe('createBoard', () => {
    it('should create a board with correct dimensions', () => {
      const board = createBoard(8, 4);
      expect(board).toHaveLength(8);
      expect(board[0]).toHaveLength(8);
    });

    it('should not create initial matches', () => {
      const board = createBoard(8, 4);
      const matches = findMatches(board);
      expect(matches).toHaveLength(0);
    });

    it('should populate all cells with candy types', () => {
      const board = createBoard(8, 4);
      board.forEach(row => {
        row.forEach(cell => {
          expect(cell.type).not.toBeNull();
        });
      });
    });
  });

  describe('findMatches', () => {
    it('should find horizontal matches', () => {
      const board = createBoard(8, 4);
      // Manually create a horizontal match
      board[0][0].type = 'play';
      board[0][1].type = 'play';
      board[0][2].type = 'play';

      const matches = findMatches(board);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].length).toBeGreaterThanOrEqual(3);
    });

    it('should find vertical matches', () => {
      const board = createBoard(8, 4);
      // Manually create a vertical match
      board[0][0].type = 'shop';
      board[1][0].type = 'shop';
      board[2][0].type = 'shop';

      const matches = findMatches(board);
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].length).toBeGreaterThanOrEqual(3);
    });

    it('should not find matches when there are none', () => {
      const board: Cell[][] = [
        [
          { type: 'play', row: 0, col: 0, id: '0-0' },
          { type: 'shop', row: 0, col: 1, id: '0-1' },
          { type: 'wallet', row: 0, col: 2, id: '0-2' },
        ],
        [
          { type: 'shop', row: 1, col: 0, id: '1-0' },
          { type: 'wallet', row: 1, col: 1, id: '1-1' },
          { type: 'play', row: 1, col: 2, id: '1-2' },
        ],
        [
          { type: 'wallet', row: 2, col: 0, id: '2-0' },
          { type: 'play', row: 2, col: 1, id: '2-1' },
          { type: 'shop', row: 2, col: 2, id: '2-2' },
        ],
      ];

      const matches = findMatches(board);
      expect(matches).toHaveLength(0);
    });
  });

  describe('isAdjacent', () => {
    it('should return true for horizontally adjacent cells', () => {
      const pos1: Position = { row: 0, col: 0 };
      const pos2: Position = { row: 0, col: 1 };
      expect(isAdjacent(pos1, pos2)).toBe(true);
    });

    it('should return true for vertically adjacent cells', () => {
      const pos1: Position = { row: 0, col: 0 };
      const pos2: Position = { row: 1, col: 0 };
      expect(isAdjacent(pos1, pos2)).toBe(true);
    });

    it('should return false for diagonal cells', () => {
      const pos1: Position = { row: 0, col: 0 };
      const pos2: Position = { row: 1, col: 1 };
      expect(isAdjacent(pos1, pos2)).toBe(false);
    });

    it('should return false for non-adjacent cells', () => {
      const pos1: Position = { row: 0, col: 0 };
      const pos2: Position = { row: 0, col: 3 };
      expect(isAdjacent(pos1, pos2)).toBe(false);
    });
  });

  describe('swapCells', () => {
    it('should swap two cells correctly', () => {
      const board: Cell[][] = [
        [
          { type: 'play', row: 0, col: 0, id: '0-0' },
          { type: 'shop', row: 0, col: 1, id: '0-1' },
        ],
      ];

      const pos1: Position = { row: 0, col: 0 };
      const pos2: Position = { row: 0, col: 1 };

      const swapped = swapCells(board, pos1, pos2);

      expect(swapped[0][0].type).toBe('shop');
      expect(swapped[0][1].type).toBe('play');
    });

    it('should not mutate the original board', () => {
      const board: Cell[][] = [
        [
          { type: 'play', row: 0, col: 0, id: '0-0' },
          { type: 'shop', row: 0, col: 1, id: '0-1' },
        ],
      ];

      const pos1: Position = { row: 0, col: 0 };
      const pos2: Position = { row: 0, col: 1 };

      swapCells(board, pos1, pos2);

      expect(board[0][0].type).toBe('play');
      expect(board[0][1].type).toBe('shop');
    });
  });

  describe('calculateScore', () => {
    it('should calculate score for 3-match', () => {
      const matches = [
        {
          cells: [
            { row: 0, col: 0 },
            { row: 0, col: 1 },
            { row: 0, col: 2 },
          ],
          type: 'play' as const,
          length: 3,
        },
      ];

      const score = calculateScore(matches, 1);
      expect(score).toBe(100);
    });

    it('should calculate score for 4-match', () => {
      const matches = [
        {
          cells: [
            { row: 0, col: 0 },
            { row: 0, col: 1 },
            { row: 0, col: 2 },
            { row: 0, col: 3 },
          ],
          type: 'play' as const,
          length: 4,
        },
      ];

      const score = calculateScore(matches, 1);
      expect(score).toBe(200);
    });

    it('should calculate score for 5-match', () => {
      const matches = [
        {
          cells: [
            { row: 0, col: 0 },
            { row: 0, col: 1 },
            { row: 0, col: 2 },
            { row: 0, col: 3 },
            { row: 0, col: 4 },
          ],
          type: 'play' as const,
          length: 5,
        },
      ];

      const score = calculateScore(matches, 1);
      expect(score).toBe(500);
    });

    it('should apply combo multiplier', () => {
      const matches = [
        {
          cells: [
            { row: 0, col: 0 },
            { row: 0, col: 1 },
            { row: 0, col: 2 },
          ],
          type: 'play' as const,
          length: 3,
        },
      ];

      const score = calculateScore(matches, 2);
      expect(score).toBeGreaterThan(100);
    });

    it('should calculate total score for multiple matches', () => {
      const matches = [
        {
          cells: [
            { row: 0, col: 0 },
            { row: 0, col: 1 },
            { row: 0, col: 2 },
          ],
          type: 'play' as const,
          length: 3,
        },
        {
          cells: [
            { row: 1, col: 0 },
            { row: 1, col: 1 },
            { row: 1, col: 2 },
          ],
          type: 'shop' as const,
          length: 3,
        },
      ];

      const score = calculateScore(matches, 1);
      expect(score).toBe(200);
    });
  });
});
