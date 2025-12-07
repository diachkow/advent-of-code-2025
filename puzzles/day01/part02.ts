import { readFileInLines } from "../utils/files";
import { Puzzle } from "../utils/puzzle";

export default class extends Puzzle {
  readonly expectedTestResult = 6;

  async solution(inputPath: string): Promise<number> {
    const d = new Dial();
    let zerosCounter = 0;

    for await (const line of readFileInLines(inputPath)) {
      const rotation = Rotation.fromString(line);

      const clicks = d.rotate(rotation);

      zerosCounter += clicks;
    }

    return zerosCounter;
  }
}

type Direction = "L" | "R";

class Dial {
  value: number;

  constructor() {
    this.value = 50;
  }

  rotate(r: Rotation): number {
    let zerosCounter = Math.floor(r.distance / 100);
    const rotationDistance = r.distance % 100;

    const initialValue = this.value;
    if (r.direction === "R") {
      this.value += rotationDistance;
    } else {
      this.value -= rotationDistance;
    }

    if (this.value < 0) {
      this.value += 100;
      if (initialValue !== 0) {
        zerosCounter++;
      }
    } else if (this.value >= 100) {
      this.value -= 100;
      if (this.value !== 0) {
        zerosCounter++;
      }
    }

    if (this.value === 0) {
      zerosCounter++;
    }

    return zerosCounter;
  }
}

class Rotation {
  direction: Direction;
  distance: number;

  constructor(dir: "L" | "R", dist: number) {
    this.direction = dir;
    this.distance = dist;
  }

  static fromString(s: string) {
    const [direction, ...distancePart] = s;
    const distanceAsString = distancePart.join("");

    if (direction !== "L" && direction !== "R") {
      throw new Error(`Unsupported direction "${direction}" (input: "${s}")`);
    }

    const distance = Number(distanceAsString);
    if (isNaN(distance)) {
      throw new Error(`Unexpected distance value: ${distanceAsString} (input: ${s})`);
    }

    return new Rotation(direction, distance);
  }
}
