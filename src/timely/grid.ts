import { CellCoord, Digit, Grid } from './types';

export const GRID_SIZE = 9;
export const BOX_SIZE = 3;

export function createEmptyGrid(): Grid {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
}

export function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => [...row]);
}

export function areGridsEqual(a: Grid, b: Grid): boolean {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (a[r][c] !== b[r][c]) return false;
    }
  }
  return true;
}

export function countClues(grid: Grid): number {
  let count = 0;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] !== 0) count++;
    }
  }
  return count;
}

export function getBoxIndex(row: number, col: number): number {
  return Math.floor(row / BOX_SIZE) * BOX_SIZE + Math.floor(col / BOX_SIZE);
}

export function getBoxStart(boxIndex: number): CellCoord {
  const row = Math.floor(boxIndex / BOX_SIZE) * BOX_SIZE;
  const col = (boxIndex % BOX_SIZE) * BOX_SIZE;
  return { row, col };
}

export function getPeers(row: number, col: number): CellCoord[] {
  const peers: CellCoord[] = [];
  const seen = new Set<string>();

  const add = (r: number, c: number) => {
    if (r === row && c === col) return;
    const key = `${r},${c}`;
    if (!seen.has(key)) {
      seen.add(key);
      peers.push({ row: r, col: c });
    }
  };

  // Row and column peers
  for (let i = 0; i < GRID_SIZE; i++) {
    add(row, i);
    add(i, col);
  }

  // Box peers
  const boxRowStart = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  const boxColStart = Math.floor(col / BOX_SIZE) * BOX_SIZE;
  for (let r = 0; r < BOX_SIZE; r++) {
    for (let c = 0; c < BOX_SIZE; c++) {
      add(boxRowStart + r, boxColStart + c);
    }
  }

  return peers;
}

export function isValidPlacement(grid: Grid, row: number, col: number, val: Digit): boolean {
  // Check row and column
  for (let i = 0; i < GRID_SIZE; i++) {
    if (i !== col && grid[row][i] === val) return false;
    if (i !== row && grid[i][col] === val) return false;
  }

  // Check 3x3 box
  const boxRowStart = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  const boxColStart = Math.floor(col / BOX_SIZE) * BOX_SIZE;
  for (let r = 0; r < BOX_SIZE; r++) {
    for (let c = 0; c < BOX_SIZE; c++) {
      const cr = boxRowStart + r;
      const cc = boxColStart + c;
      if ((cr !== row || cc !== col) && grid[cr][cc] === val) return false;
    }
  }

  return true;
}

export function getCandidates(grid: Grid, row: number, col: number): Digit[] {
  if (grid[row][col] !== 0) return [];
  const candidates: Digit[] = [];
  for (let d = 1; d <= 9; d++) {
    const digit = d as Digit;
    if (isValidPlacement(grid, row, col, digit)) {
      candidates.push(digit);
    }
  }
  return candidates;
}

export function isGridCompleteAndValid(grid: Grid): boolean {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const val = grid[r][c];
      if (val === 0) return false;
      if (!isValidPlacement(grid, r, c, val as Digit)) return false;
    }
  }
  return true;
}
