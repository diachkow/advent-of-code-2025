import assert from "../utils/assert";
import { readFileInLines } from "../utils/files";
import { stringToNumber } from "../utils/numbers";

export async function solve(): Promise<void> {
  const testResult = await countFreshProducts(`${import.meta.dir}/test.input.txt`);
  assert(testResult === 3, `Test result is not matched. Expected: 3, Got: ${testResult}`);
  console.log(`Test result matched`);

  const actualResult = await countFreshProducts(`${import.meta.dir}/actual.input.txt`);
  console.log(`Actual result is ${actualResult}`);
}

async function countFreshProducts(inputPath: string): Promise<number> {
  const { ranges, ids } = await processInput(inputPath);
  let counter = 0;

  for (const id of ids) {
    for (const range of ranges) {
      if (range.includes(id)) {
        counter++;
        break;
      }
    }
  }

  return counter;
}

async function processInput(inputPath: string): Promise<{ ranges: IDRange[]; ids: number[] }> {
  let isIDRangesRead = false;
  const ranges: IDRange[] = [];
  const ids: number[] = [];

  for await (const line of readFileInLines(inputPath)) {
    if (line === "") {
      isIDRangesRead = true;
      continue;
    }

    if (!isIDRangesRead) {
      const range = IDRange.fromString(line);
      ranges.push(range);
    } else {
      const id = stringToNumber(line);
      ids.push(id);
    }
  }

  return { ranges, ids };
}

class IDRange {
  readonly start: number;
  readonly end: number;

  constructor(start: number, end: number) {
    this.start = start;
    this.end = end;
  }

  static fromString(s: string): IDRange {
    const parts = s.split("-");
    if (parts.length !== 2) throw new Error(`Invalid ID range format, expected x-y, got: ${s}`);

    const start = stringToNumber(parts[0]!);
    const end = stringToNumber(parts[1]!);

    return new IDRange(start, end);
  }

  includes(n: number): boolean {
    return n >= this.start && n <= this.end;
  }
}
