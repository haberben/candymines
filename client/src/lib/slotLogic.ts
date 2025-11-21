import { SlotCell, SYMBOL_CONFIG, SymbolType, GRID_SIZES } from '@/types/slotGame';

// Weighted random sembol seçimi
function getRandomSymbol(): SymbolType {
  const symbols = Object.keys(SYMBOL_CONFIG) as SymbolType[];
  const totalWeight = symbols.reduce((sum, symbol) => sum + SYMBOL_CONFIG[symbol].rarity, 0);
  
  let random = Math.random() * totalWeight;
  
  for (const symbol of symbols) {
    random -= SYMBOL_CONFIG[symbol].rarity;
    if (random <= 0) {
      return symbol;
    }
  }
  
  return symbols[0];
}

export function createSlotGrid(gridSize: number, mineCount: number): SlotCell[][] {
  const grid: SlotCell[][] = [];
  const totalCells = gridSize * gridSize;
  
  // Mayın pozisyonlarını rastgele seç
  const minePositions = new Set<number>();
  while (minePositions.size < mineCount) {
    minePositions.add(Math.floor(Math.random() * totalCells));
  }
  
  let cellIndex = 0;
  for (let row = 0; row < gridSize; row++) {
    const rowCells: SlotCell[] = [];
    for (let col = 0; col < gridSize; col++) {
      const isMine = minePositions.has(cellIndex);
      const symbolType = isMine ? 'shield' : getRandomSymbol(); // Mayınlar için dummy sembol
      const config = SYMBOL_CONFIG[symbolType];
      
      rowCells.push({
        id: `${row}-${col}`,
        row,
        col,
        symbolType,
        state: 'hidden',
        baseWin: isMine ? 0 : config.baseWin,
        multiplier: isMine ? 0 : config.multiplier,
        isMine,
      });
      
      cellIndex++;
    }
    grid.push(rowCells);
  }
  
  return grid;
}

export function revealCell(
  grid: SlotCell[][],
  row: number,
  col: number
): { newGrid: SlotCell[][]; isMine: boolean; baseWin: number; multiplier: number } {
  const newGrid = grid.map(r => r.map(c => ({ ...c })));
  const cell = newGrid[row][col];
  
  if (cell.state !== 'hidden') {
    return { newGrid, isMine: false, baseWin: 0, multiplier: 0 };
  }
  
  if (cell.isMine) {
    cell.state = 'mine';
    // Tüm mayınları göster
    newGrid.forEach(r => {
      r.forEach(c => {
        if (c.isMine && c.state === 'hidden') {
          c.state = 'disabled';
        }
      });
    });
    return { newGrid, isMine: true, baseWin: 0, multiplier: 0 };
  } else {
    cell.state = 'revealed';
    return { newGrid, isMine: false, baseWin: cell.baseWin, multiplier: cell.multiplier };
  }
}

// Toplam çarpan hesapla (sadece çarpan sembollerinin toplamı)
export function calculateTotalMultiplier(grid: SlotCell[][]): number {
  let total = 0;
  
  grid.forEach(row => {
    row.forEach(cell => {
      if (cell.state === 'revealed' && cell.multiplier > 0) {
        total += cell.multiplier;
      }
    });
  });
  
  return total;
}

// Toplam sabit kazanç hesapla
export function calculateBaseWinTotal(grid: SlotCell[][]): number {
  let total = 0;
  
  grid.forEach(row => {
    row.forEach(cell => {
      if (cell.state === 'revealed' && cell.baseWin > 0) {
        total += cell.baseWin;
      }
    });
  });
  
  return total;
}

// Mevcut kazanç hesapla: baseWinTotal × (1 + totalMultiplier)
export function calculateCurrentWin(baseWinTotal: number, totalMultiplier: number): number {
  if (baseWinTotal === 0) return 0;
  return Math.floor(baseWinTotal * (1 + totalMultiplier));
}

export function getRevealedCount(grid: SlotCell[][]): number {
  let count = 0;
  grid.forEach(row => {
    row.forEach(cell => {
      if (cell.state === 'revealed') {
        count++;
      }
    });
  });
  return count;
}

export function canReveal(grid: SlotCell[][], row: number, col: number): boolean {
  const cell = grid[row][col];
  return cell.state === 'hidden';
}

export function calculateWinProbability(gridSize: number, mineCount: number, revealedCount: number): number {
  const totalCells = gridSize * gridSize;
  const remainingCells = totalCells - revealedCount;
  const remainingMines = mineCount;
  
  if (remainingCells === 0) return 0;
  
  const safeCells = remainingCells - remainingMines;
  return (safeCells / remainingCells) * 100;
}
