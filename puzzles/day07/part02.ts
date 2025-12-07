import { readEntireFile } from "../utils/files";
import { Puzzle } from "../utils/puzzle";

export default class extends Puzzle {
  readonly expectedTestResult = 40;

  async solution(inputPath: string): Promise<number> {
    const rawInput = await readEntireFile(inputPath);
    const manifold = TachyonManifold.fromString(rawInput);

    const memo = new Map<string, number>();
    const beam = new TachyonBeam(manifold.start);

    return beam.run(manifold, memo);
  }
}

const MANIFOLD_CELLS = {
  START: "S",
  EMPTY_SPACE: ".",
  SPLITTER: "^",
} as const;

type ManifoldCell = (typeof MANIFOLD_CELLS)[keyof typeof MANIFOLD_CELLS];

class Position {
  constructor(
    readonly x: number,
    readonly y: number,
  ) {}

  toString(): string {
    return `${this.x},${this.y}`;
  }

  moveDown(): Position {
    return new Position(this.x + 1, this.y);
  }

  moveLeft(): Position {
    return new Position(this.x, this.y - 1);
  }

  moveRight(): Position {
    return new Position(this.x, this.y + 1);
  }
}

class TachyonManifold {
  private constructor(
    private readonly grid: ManifoldCell[][],
    readonly start: Position,
  ) {}

  static fromString(input: string): TachyonManifold {
    const grid = input.split("\n").map((line) => line.split("") as ManifoldCell[]);

    const start = this.findStartPosition(grid);
    if (!start) {
      throw new Error("No start position (S) found on the grid");
    }

    return new TachyonManifold(grid, start);
  }

  private static findStartPosition(grid: ManifoldCell[][]): Position | null {
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i]!.length; j++) {
        if (grid[i]![j] === MANIFOLD_CELLS.START) {
          return new Position(i, j);
        }
      }
    }
    return null;
  }

  at(pos: Position): ManifoldCell | null {
    return this.grid[pos.x]?.[pos.y] ?? null;
  }

  isWithinRange(pos: Position): boolean {
    return pos.y >= 0 && this.grid[pos.x]?.[pos.y] !== undefined;
  }
}

class TachyonBeam {
  private currentPos: Position;

  constructor(readonly start: Position) {
    this.currentPos = start;
  }

  run(manifold: TachyonManifold, memo: Map<string, number>): number {
    const startKey = this.start.toString();

    // Check if we've already computed timelines from this starting position
    if (memo.has(startKey)) {
      return memo.get(startKey)!;
    }

    let timelines = 0;

    while (true) {
      const nextPos = this.currentPos.moveDown();

      if (!manifold.isWithinRange(nextPos)) {
        memo.set(startKey, timelines + 1);
        return timelines + 1;
      }

      const cellType = manifold.at(nextPos);

      if (cellType === MANIFOLD_CELLS.EMPTY_SPACE) {
        this.currentPos = nextPos;
      } else if (cellType === MANIFOLD_CELLS.SPLITTER) {
        const splitLeft = nextPos.moveLeft();
        if (manifold.isWithinRange(splitLeft)) {
          timelines += new TachyonBeam(splitLeft).run(manifold, memo);
        }

        const splitRight = nextPos.moveRight();
        if (manifold.isWithinRange(splitRight)) {
          timelines += new TachyonBeam(splitRight).run(manifold, memo);
        }

        memo.set(startKey, timelines);
        return timelines;
      }
    }
  }
}
