import { readEntireFile } from "../utils/files";
import { Puzzle } from "../utils/puzzle";

export default class extends Puzzle {
  readonly expectedTestResult = 21;

  async solution(inputPath: string): Promise<number> {
    const rawInput = await readEntireFile(inputPath);
    const manifold = TachyonManifold.fromString(rawInput);
    const beam = new TachyonBeam(manifold.start);

    const splittersHit = new Set<string>();
    const visitedStarts = new Set<string>([manifold.start.toString()]);

    beam.run(manifold, splittersHit, visitedStarts);

    return splittersHit.size;
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
    return pos.y > 0 && this.grid[pos.x]?.[pos.y] !== undefined;
  }
}

class TachyonBeam {
  private currentPos: Position;

  constructor(readonly start: Position) {
    this.currentPos = start;
  }

  run(manifold: TachyonManifold, splittersHit: Set<string>, visitedStarts: Set<string>): void {
    while (true) {
      const nextPos = this.currentPos.moveDown();

      if (!manifold.isWithinRange(nextPos)) {
        break;
      }

      const cellType = manifold.at(nextPos);

      if (cellType === MANIFOLD_CELLS.EMPTY_SPACE) {
        this.currentPos = nextPos;
      } else if (cellType === MANIFOLD_CELLS.SPLITTER) {
        this.handleSplitter(nextPos, manifold, splittersHit, visitedStarts);
        break;
      }
    }
  }

  private handleSplitter(
    splitterPos: Position,
    manifold: TachyonManifold,
    splittersHit: Set<string>,
    visitedStarts: Set<string>,
  ): void {
    splittersHit.add(splitterPos.toString());

    this.spawnBeamIfUnvisited(splitterPos.moveRight(), manifold, splittersHit, visitedStarts);

    this.spawnBeamIfUnvisited(splitterPos.moveLeft(), manifold, splittersHit, visitedStarts);
  }

  private spawnBeamIfUnvisited(
    pos: Position,
    manifold: TachyonManifold,
    splittersHit: Set<string>,
    visitedStarts: Set<string>,
  ): void {
    const posKey = pos.toString();

    if (manifold.isWithinRange(pos) && !visitedStarts.has(posKey)) {
      visitedStarts.add(posKey);
      new TachyonBeam(pos).run(manifold, splittersHit, visitedStarts);
    }
  }
}
