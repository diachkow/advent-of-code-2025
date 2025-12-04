import assert from "../utils/assert";
import { readEntireFile } from "../utils/files";

export async function solve(): Promise<void> {
  const testResult = await countAccessibleRollsOfPaper(`${import.meta.dir}/test.input.txt`);
  assert(testResult === 43, `Unexpected testResult. Expected: 43. Got ${testResult}`);
  console.log("Test result met!");

  const actualResult = await countAccessibleRollsOfPaper(`${import.meta.dir}/actual.input.txt`);
  console.log(`actualResult is ${actualResult}`);
}

const PAPER_ROLL = "@" as const;
const EMPTY_CELL = "." as const;
const REMOVED_PAPER_ROLL = "x" as const;
type GridElement = typeof PAPER_ROLL | typeof EMPTY_CELL | typeof REMOVED_PAPER_ROLL;

async function countAccessibleRollsOfPaper(inputPath: string): Promise<number> {
  const rawInput = await readEntireFile(inputPath);
  const grid = createGrid<GridElement>(rawInput);

  let accessibleRollsOfPaperCount = 0;
  let iterations = 0;
  while (true) {
    const toRemove: Array<{ x: number; y: number }> = [];

    for (let i = 0; i < grid.rows; i++) {
      for (let j = 0; j < grid.cols; j++) {
        if (grid.cell(i, j) === PAPER_ROLL && countNeighboursOfType(grid, i, j, PAPER_ROLL) < 4) {
          toRemove.push({ x: i, y: j });
        }
      }
    }

    if (toRemove.length === 0) break;

    for (const cell of toRemove) {
      grid.replace(cell.x, cell.y, REMOVED_PAPER_ROLL);
    }
    accessibleRollsOfPaperCount += toRemove.length;
  }

  return accessibleRollsOfPaperCount;
}

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
  replace(x: number, y: number, val: T): void;
}

function createGrid<T extends string>(rawInput: string): Grid<T> {
  const grid = rawInput
    .split("\n")
    .filter((row) => row.length > 0)
    .map((row) => row.split(""));

  const rows = grid.length;
  const cols = (grid[0] || []).length;

  return {
    rows,
    cols,
    cell: (row: number, col: number): T | null => {
      if (!grid[row]) return null;
      const val = grid[row][col];
      if (!val) return null;
      return val as T;
    },
    replace: (x: number, y: number, val: T): void => {
      if (x >= 0 && x < rows && y >= 0 && y < cols) {
        const row = grid.at(x)!;
        row[y] = val;
      }
    },
  };
}
