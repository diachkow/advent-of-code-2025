import { readFileInLines } from "../utils/files";
import { Puzzle } from "../utils/puzzle";

export default class extends Puzzle {
  readonly expectedTestResult = 3;

  async solution(inputPath: string): Promise<number> {
    const d = new Dial();
    let zerosCounter = 0;

    for await (const line of readFileInLines(inputPath)) {
      const rotation = Rotation.fromString(line);

      d.rotate(rotation);
      // console.log(`The dial is rotated ${line} to point at ${d.value}`);
      // assert(d.value >= 0 && d.value <= 99, `Invalid value: ${d.value}`);

      if (d.value === 0) {
        zerosCounter++;
      }
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

  rotate(r: Rotation): void {
    const rotationDistance = r.distance > 100 ? r.distance % 100 : r.distance;

    if (r.direction === "L") {
      this.value -= rotationDistance;
    } else if (r.direction === "R") {
      this.value += rotationDistance;
    }

    if (this.value >= 100) {
      this.value -= 100;
    } else if (this.value < 0) {
      this.value = 100 + this.value;
    }
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
