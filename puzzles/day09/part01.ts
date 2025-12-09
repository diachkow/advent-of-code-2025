import { readFileInLines } from "../utils/files";
import { stringToNumber } from "../utils/numbers";
import { Puzzle } from "../utils/puzzle";

export default class extends Puzzle {
  override readonly expectedTestResult = 50;

  override async solution(inputPath: string): Promise<number> {
    const tiles = await this.processInput(inputPath);
    const rectangles = this.constructRectangles(tiles);
    return this.getMaxRectangleArea(rectangles);
  }

  private async processInput(inputPath: string): Promise<Tile[]> {
    const tiles: Tile[] = [];
    for await (const line of readFileInLines(inputPath)) {
      const parts = line.split(",");
      if (parts.length !== 2) throw new Error(`Unexpected input line: ${line}`);

      const x = stringToNumber(parts[0]!);
      const y = stringToNumber(parts[1]!);
      const tile = new Tile(x, y);
      tiles.push(tile);
    }
    return tiles;
  }

  private constructRectangles(tiles: Tile[]): Rectangle[] {
    const rectangles: Rectangle[] = [];
    for (let i = 0; i < tiles.length - 1; i++) {
      for (let j = i + 1; j < tiles.length; j++) {
        const rect = new Rectangle(tiles[i]!, tiles[j]!);
        rectangles.push(rect);
      }
    }
    return rectangles;
  }

  private getMaxRectangleArea(rectangles: Rectangle[]): number {
    if (rectangles.length === 0) return 0;
    if (rectangles.length === 1) return rectangles[0]!.area();

    return rectangles
      .map((r) => r.area())
      .toSorted((a, b) => b - a)
      .at(0)!;
  }
}

class Tile {
  constructor(
    public readonly x: number,
    public readonly y: number,
  ) {}

  toString(): string {
    return `[${this.x}:${this.y}]`;
  }
}

class Rectangle {
  readonly height: number;
  readonly width: number;

  private readonly a: Tile;
  private readonly b: Tile;

  constructor(a: Tile, b: Tile) {
    this.a = a;
    this.b = b;
    this.height = Math.max(a.x, b.x) - Math.min(a.x, b.x) + 1;
    this.width = Math.max(a.y, b.y) - Math.min(a.y, b.y) + 1;
  }

  area(): number {
    return this.height * this.width;
  }

  toString(): string {
    return `{ ${this.a}—${this.b} }`;
  }
}
