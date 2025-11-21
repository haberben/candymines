import { Cell, Position, Match, CandyType, CANDY_TYPES } from '@/types/game';

export function createBoard(size: number, candyTypes: number): Cell[][] {
  const board: Cell[][] = [];
  const availableTypes = CANDY_TYPES.slice(0, candyTypes);
  
  for (let row = 0; row < size; row++) {
    board[row] = [];
    for (let col = 0; col < size; col++) {
      let type: CandyType;
      let attempts = 0;
      
      // Başlangıçta eşleşme olmaması için kontrol
      do {
        type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
        attempts++;
      } while (attempts < 10 && wouldCreateMatch(board, row, col, type));
      
      board[row][col] = {
        type,
        row,
        col,
        id: `${row}-${col}`,
        isMatched: false,
        isSelected: false,
      };
    }
  }
  
  return board;
}

function wouldCreateMatch(board: Cell[][], row: number, col: number, type: CandyType): boolean {
  // Solda 2 aynı tip var mı?
  if (col >= 2 && 
      board[row][col - 1]?.type === type && 
      board[row][col - 2]?.type === type) {
    return true;
  }
  
  // Üstte 2 aynı tip var mı?
  if (row >= 2 && 
      board[row - 1]?.[col]?.type === type && 
      board[row - 2]?.[col]?.type === type) {
    return true;
  }
  
  return false;
}

export function findMatches(board: Cell[][]): Match[] {
  const matches: Match[] = [];
  const size = board.length;
  const matched = new Set<string>();
  
  // Yatay eşleşmeleri bul
  for (let row = 0; row < size; row++) {
    let matchStart = 0;
    
    for (let col = 1; col <= size; col++) {
      const current = board[row][col]?.type;
      const previous = board[row][col - 1]?.type;
      
      if (col === size || current !== previous || !current) {
        const matchLength = col - matchStart;
        
        if (matchLength >= 3 && previous) {
          const cells: Position[] = [];
          for (let i = matchStart; i < col; i++) {
            cells.push({ row, col: i });
            matched.add(`${row}-${i}`);
          }
          
          matches.push({
            cells,
            type: previous,
            length: matchLength,
          });
        }
        
        matchStart = col;
      }
    }
  }
  
  // Dikey eşleşmeleri bul
  for (let col = 0; col < size; col++) {
    let matchStart = 0;
    
    for (let row = 1; row <= size; row++) {
      const current = board[row]?.[col]?.type;
      const previous = board[row - 1]?.[col]?.type;
      
      if (row === size || current !== previous || !current) {
        const matchLength = row - matchStart;
        
        if (matchLength >= 3 && previous) {
          const cells: Position[] = [];
          for (let i = matchStart; i < row; i++) {
            // Sadece henüz eşleşmemiş hücreleri ekle
            if (!matched.has(`${i}-${col}`)) {
              cells.push({ row: i, col });
            }
          }
          
          if (cells.length >= 3) {
            matches.push({
              cells,
              type: previous,
              length: matchLength,
            });
          }
        }
        
        matchStart = row;
      }
    }
  }
  
  return matches;
}

export function isAdjacent(pos1: Position, pos2: Position): boolean {
  const rowDiff = Math.abs(pos1.row - pos2.row);
  const colDiff = Math.abs(pos1.col - pos2.col);
  
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

export function swapCells(board: Cell[][], pos1: Position, pos2: Position): Cell[][] {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  
  const temp = newBoard[pos1.row][pos1.col].type;
  newBoard[pos1.row][pos1.col].type = newBoard[pos2.row][pos2.col].type;
  newBoard[pos2.row][pos2.col].type = temp;
  
  return newBoard;
}

export function removeMatches(board: Cell[][], matches: Match[]): Cell[][] {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  
  matches.forEach(match => {
    match.cells.forEach(pos => {
      newBoard[pos.row][pos.col].type = null;
      newBoard[pos.row][pos.col].isMatched = true;
    });
  });
  
  return newBoard;
}

export function applyGravity(board: Cell[][], candyTypes: number): Cell[][] {
  const size = board.length;
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  const availableTypes = CANDY_TYPES.slice(0, candyTypes);
  
  // Her sütun için
  for (let col = 0; col < size; col++) {
    // Alttan yukarı boş olmayan hücreleri topla
    const column: (CandyType | null)[] = [];
    
    for (let row = size - 1; row >= 0; row--) {
      if (newBoard[row][col].type !== null) {
        column.push(newBoard[row][col].type);
      }
    }
    
    // Eksik olanları yeni candylerle doldur
    while (column.length < size) {
      const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
      column.push(randomType);
    }
    
    // Sütunu güncelle (alttan yukarı)
    for (let row = size - 1; row >= 0; row--) {
      newBoard[row][col].type = column[size - 1 - row];
      newBoard[row][col].isMatched = false;
    }
  }
  
  return newBoard;
}

export function hasValidMoves(board: Cell[][]): boolean {
  const size = board.length;
  
  // Her hücre için komşularıyla swap dene
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      // Sağdaki ile swap
      if (col < size - 1) {
        const testBoard = swapCells(board, { row, col }, { row, col: col + 1 });
        if (findMatches(testBoard).length > 0) {
          return true;
        }
      }
      
      // Alttaki ile swap
      if (row < size - 1) {
        const testBoard = swapCells(board, { row, col }, { row: row + 1, col });
        if (findMatches(testBoard).length > 0) {
          return true;
        }
      }
    }
  }
  
  return false;
}

export function findHint(board: Cell[][]): { pos1: Position; pos2: Position } | null {
  const size = board.length;
  
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      // Sağdaki ile swap
      if (col < size - 1) {
        const testBoard = swapCells(board, { row, col }, { row, col: col + 1 });
        if (findMatches(testBoard).length > 0) {
          return { pos1: { row, col }, pos2: { row, col: col + 1 } };
        }
      }
      
      // Alttaki ile swap
      if (row < size - 1) {
        const testBoard = swapCells(board, { row, col }, { row: row + 1, col });
        if (findMatches(testBoard).length > 0) {
          return { pos1: { row, col }, pos2: { row: row + 1, col } };
        }
      }
    }
  }
  
  return null;
}

export function shuffleBoard(board: Cell[][], candyTypes: number): Cell[][] {
  const size = board.length;
  const types: CandyType[] = [];
  
  // Mevcut tüm candy tiplerini topla
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cellType = board[row][col].type;
      if (cellType !== null) {
        types.push(cellType);
      }
    }
  }
  
  // Fisher-Yates shuffle
  for (let i = types.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [types[i], types[j]] = [types[j], types[i]];
  }
  
  // Yeni board oluştur
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  let index = 0;
  
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      newBoard[row][col].type = types[index++];
    }
  }
  
  return newBoard;
}

export function calculateScore(matches: Match[], combo: number): number {
  let score = 0;
  
  matches.forEach(match => {
    if (match.length === 3) {
      score += 100;
    } else if (match.length === 4) {
      score += 200;
    } else if (match.length >= 5) {
      score += 500;
    }
  });
  
  // Combo multiplier
  if (combo > 1) {
    score = Math.floor(score * Math.pow(1.5, combo - 1));
  }
  
  return score;
}
