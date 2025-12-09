import { readFileInLines } from "../utils/files";
import { stringToNumber } from "../utils/numbers";
import { Puzzle } from "../utils/puzzle";

export default class extends Puzzle {
  override readonly expectedTestResult = 24;

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
    const greenTiles = this.buildGreenTiles(tiles);

    const tilesSet = tiles
      .concat(greenTiles)
      .reduce((set, tile) => set.add(tile.toString()), new Set<string>());

    for (let i = 0; i < tiles.length - 1; i++) {
      for (let j = i + 1; j < tiles.length; j++) {
        const rect = new Rectangle(tiles[i]!, tiles[j]!);
        if (this.isValidRectangle(rect, tilesSet)) {
          rectangles.push(rect);
        }
      }
    }

    return rectangles;
  }

  private buildGreenTiles(redTiles: Tile[]): Tile[] {
    // const pathTiles = this.buildGreenPathTiles(redTiles);
    // const interiorTiles = this.buildGreenInteriorTiles(redTiles);
    // return pathTiles.concat(interiorTiles);
    return this.buildGreenPathTiles(redTiles);
  }

  private buildGreenPathTiles(redTiles: Tile[]): Tile[] {
    const greenPathTiles: Tile[] = [];

    for (let i = 0; i < redTiles.length; i++) {
      const current = redTiles[i]!;
      const next = redTiles[(i + 1) % redTiles.length]!;

      if (current.x === next.x) {
        const minY = Math.min(current.y, next.y);
        const maxY = Math.max(current.y, next.y);
        for (let y = minY; y < maxY; y++) {
          greenPathTiles.push(new Tile(current.x, y));
        }
      } else if (current.y === next.y) {
        const minX = Math.min(current.x, next.x);
        const maxX = Math.max(current.x, next.x);
        for (let x = minX; x < maxX; x++) {
          greenPathTiles.push(new Tile(x, current.y));
        }
      }
    }

    return greenPathTiles;
  }

  private isInsidePolygon(x: number, y: number, polygon: Tile[]): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i]!.x,
        yi = polygon[i]!.y;
      const xj = polygon[j]!.x,
        yj = polygon[j]!.y;

      const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  private isValidRectangle(rect: Rectangle, tilesSet: Set<string>): boolean {
    // Check top and bottom edges
    for (let y = rect.topLeft.y; y <= rect.topRight.y; y++) {
      if (!tilesSet.has(new Tile(rect.topLeft.x, y).toString())) return false; // top
      if (!tilesSet.has(new Tile(rect.bottomLeft.x, y).toString())) return false; // bottom
    }

    // Check left and right edges
    for (let x = rect.topLeft.x; x <= rect.bottomLeft.x; x++) {
      if (!tilesSet.has(new Tile(x, rect.topLeft.y).toString())) return false; // left
      if (!tilesSet.has(new Tile(x, rect.topRight.y).toString())) return false; // right
    }

    return true;
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

  private readonly originalTileA: Tile;
  private readonly originalTileB: Tile;

  readonly topLeft: Tile;
  readonly topRight: Tile;
  readonly bottomLeft: Tile;
  readonly bottomRight: Tile;

  constructor(a: Tile, b: Tile) {
    this.originalTileA = a;
    this.originalTileB = b;

    this.topLeft = new Tile(Math.min(a.x, b.x), Math.min(a.y, b.y));
    this.topRight = new Tile(Math.min(a.x, b.x), Math.max(a.y, b.y));
    this.bottomLeft = new Tile(Math.max(a.x, b.x), Math.min(a.y, b.y));
    this.bottomRight = new Tile(Math.max(a.x, b.x), Math.max(a.y, b.y));

    this.height = this.bottomRight.x - this.topRight.x + 1;
    this.width = this.topRight.y - this.topLeft.y + 1;
  }

  area(): number {
    return this.height * this.width;
  }

  toString(): string {
    return `{ ${this.originalTileA}—${this.originalTileB} }`;
  }
}
