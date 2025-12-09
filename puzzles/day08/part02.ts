import { readFileInLines } from "../utils/files";
import { stringToNumber } from "../utils/numbers";
import { Puzzle } from "../utils/puzzle";

export default class extends Puzzle {
  override readonly expectedTestResult = 25272;

  override async solution(inputPath: string): Promise<number> {
    const [_, junctionBoxes] = await this.processInput(inputPath);
    const distances: BoxDistance[] = this.calculateDistances(junctionBoxes);
    distances.sort((a, b) => a.distance - b.distance);
    const lastConnection = this.mergeBoxesIntoCircuits(junctionBoxes, distances);
    return this.estimateExtensionCableSizes(lastConnection);
  }

  private async processInput(inputPath: string): Promise<[number, JunctionBox[]]> {
    let max_connections: number | null = null;
    const junctionBoxes: JunctionBox[] = [];
    for await (const line of readFileInLines(inputPath)) {
      if (max_connections === null) {
        max_connections = stringToNumber(line);
        continue;
      }
      junctionBoxes.push(JunctionBox.fromString(line));
    }

    return [max_connections!, junctionBoxes] as const;
  }

  private calculateDistances(junctionBoxes: JunctionBox[]): BoxDistance[] {
    const result: BoxDistance[] = [];
    for (let i = 0; i < junctionBoxes.length; i++) {
      for (let j = i + 1; j < junctionBoxes.length; j++) {
        const box = junctionBoxes[i]!;
        const otherBox = junctionBoxes[j]!;
        const distance = box.distanceTo(otherBox);
        result.push({ box, otherBox, distance });
      }
    }
    return result;
  }

  private mergeBoxesIntoCircuits(
    junctionBoxes: JunctionBox[],
    distances: BoxDistance[],
  ): BoxConnection {
    let uniqueCircuits: Set<Circuit>;
    let lastConnection: [JunctionBox, JunctionBox] | undefined = undefined;
    do {
      uniqueCircuits = new Set<Circuit>();

      for (const calculatedDistance of distances) {
        if (!calculatedDistance.box.hasSameCircuit(calculatedDistance.otherBox)) {
          calculatedDistance.box.merge(calculatedDistance.otherBox);
          lastConnection = [calculatedDistance.box, calculatedDistance.otherBox];
        }
      }

      for (const box of junctionBoxes) {
        if (box.circuit) uniqueCircuits.add(box.circuit);
      }
    } while (uniqueCircuits.size > 1);

    if (!lastConnection) throw new Error("Last connection is not recorded");

    return lastConnection;
  }

  private estimateExtensionCableSizes(lastConnection: BoxConnection): number {
    const [box, otherBox] = lastConnection;
    return box.x * otherBox.x;
  }
}

type BoxDistance = { box: JunctionBox; otherBox: JunctionBox; distance: number };
type BoxConnection = [JunctionBox, JunctionBox];

class Circuit {
  private items: JunctionBox[]; // string representation of Juntion boxes

  constructor(...boxes: JunctionBox[]) {
    this.items = [];
    for (const box of boxes) {
      this.items.push(box);
      box.circuit = this;
    }
  }

  add(box: JunctionBox): void {
    if (box.circuit !== null) throw new Error(`Box ${box} is already assigned to another circuit`);
    this.items.push(box);
    box.circuit = this;
  }

  size(): number {
    return this.items.length;
  }

  merge(other: Circuit): void {
    for (const box of other.items) {
      box.circuit = null;
      this.add(box);
    }
  }
}

class JunctionBox {
  x: number;
  y: number;
  z: number;

  circuit: Circuit | null = null;

  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  static fromString(s: string): JunctionBox {
    const parts = s.split(",");
    if (parts.length !== 3) throw new Error(`Input ${s} does not contain three numbers`);
    const [x, y, z] = parts.map((i) => stringToNumber(i)) as [number, number, number];
    return new JunctionBox(x, y, z);
  }

  toString(): string {
    return `[${this.x}:${this.y}:${this.z}]`;
  }

  distanceTo(other: JunctionBox): number {
    return Math.sqrt(
      Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2) + Math.pow(this.z - other.z, 2),
    );
  }

  hasSameCircuit(other: JunctionBox): boolean {
    return this.circuit !== null && this.circuit === other.circuit;
  }

  merge(other: JunctionBox): void {
    if (this.circuit === null && other.circuit === null) {
      new Circuit(this, other);
    } else if (this.circuit === null && other.circuit !== null) {
      other.circuit.add(this);
    } else if (this.circuit !== null && other.circuit === null) {
      this.circuit.add(other);
    } else if (this.circuit !== null && other.circuit !== null && this.circuit !== other.circuit) {
      this.circuit.merge(other.circuit);
    } else {
      throw new Error(`Cannot merge ${this} with ${other} into circuit`);
    }
  }
}
