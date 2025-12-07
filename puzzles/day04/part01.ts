import { readEntireFile } from "../utils/files";
import { Puzzle } from "../utils/puzzle";

export default class extends Puzzle {
  readonly expectedTestResult = 13;

  async solution(inputPath: string): Promise<number> {
    const rawInput = await readEntireFile(inputPath);
    const grid = createGrid<GridElement>(rawInput);

    let accessibleRollsOfPaperCount = 0;
    for (let i = 0; i < grid.rows; i++) {
      for (let j = 0; j < grid.cols; j++) {
        if (grid.cell(i, j) === PAPER_ROLL && countNeighboursOfType(grid, i, j, PAPER_ROLL) < 4) {
          accessibleRollsOfPaperCount++;
        }
      }
    }

    return accessibleRollsOfPaperCount;
  }
}

const PAPER_ROLL = "@" as const;
const EMPTY_CELL = "." as const;
type GridElement = typeof PAPER_ROLL | typeof EMPTY_CELL;

function countNeighboursOfType(
  grid: Grid<GridElement>,
  x: number,
  y: number,
  t: GridElement,
): number {
  let count = 0;

  if (grid.cell(x - 1, y - 1) === t) count++; // Top left
  if (grid.cell(x - 1, y) === t) count++; // Left
  if (grid.cell(x - 1, y + 1) === t) count++; // Bottom left
  if (grid.cell(x, y - 1) === t) count++; // Top
  if (grid.cell(x, y + 1) === t) count++; // Bottom
  if (grid.cell(x + 1, y - 1) === t) count++; // Top right
  if (grid.cell(x + 1, y) === t) count++; // Right
  if (grid.cell(x + 1, y + 1) === t) count++; // Bottom right

  return count;
}

interface Grid<T> {
  rows: number;
  cols: number;

  cell(row: number, col: number): T | null;
}

function createGrid<T>(rawInput: string): Grid<T> {
  const grid = rawInput
    .split("\n")
    .filter((row) => row.length > 0)
    .map((row) => row.split(""));

  return {
    rows: grid.length,
    cols: (grid[0] || []).length,
    cell: (row: number, col: number): T | null => {
      if (!grid[row]) return null;
      const val = grid[row][col];
      if (!val) return null;
      return val as T;
    },
  };
}
