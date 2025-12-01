import assert from "../utils/assert";

export async function solve(): Promise<void> {
  const testResult = await findPassword(`${import.meta.dir}/test.input.txt`);
  assert(testResult == 3, `Unexpected test result. Expected: 3, got: ${testResult}`);
  console.log(`Test output matched!`);

  const actualResult = await findPassword(`${import.meta.dir}/actual.input.txt`);
  console.log(`Password is ${actualResult}`);
}

async function findPassword(inputFilePath: string): Promise<number> {
  const d = new Dial();
  let zerosCounter = 0;

  for await (const line of readInLines(inputFilePath)) {
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

async function* readInLines(path: string): AsyncGenerator<string> {
  const stream = Bun.file(path).stream();
  const d = new TextDecoder();

  let rest = "";

  for await (const chunk of stream) {
    const str = d.decode(chunk);

    rest += str;

    let lines = rest.split(/\r?\n/);
    while (lines.length > 1) {
      yield lines.shift() as string;
    }

    rest = lines[0] as string;
  }

  return;
}
