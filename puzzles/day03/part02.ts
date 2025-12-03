import assert from "../utils/assert";
import { readFileInLines } from "../utils/files";
import { stringToNumber } from "../utils/numbers";

export async function solve(): Promise<void> {
  const testResult = await calculateTotalOutputJoltage(`${import.meta.dir}/test.input.txt`);
  assert(
    testResult === 3121910778619n,
    `Unexpected testResult. Expected: 3121910778619. Got: ${testResult}`,
  );
  console.log("testResult output was successfully matched");

  const actualResult = await calculateTotalOutputJoltage(`${import.meta.dir}/actual.input.txt`);
  console.log(`Actual output is ${actualResult}`);
}

async function calculateTotalOutputJoltage(inputPath: string): Promise<bigint> {
  let total = 0n;
  for await (const line of readFileInLines(inputPath)) {
    const batteryBank = BatteryBank.fromString(line);
    const lpj = batteryBank.largestPossibleJoltage();
    total += lpj;
  }
  return total;
}

class BatteryBank {
  joltages: number[];

  constructor(joltages: number[]) {
    this.joltages = joltages;
  }

  static fromString(s: string): BatteryBank {
    const joltages: number[] = [];
    for (let i = 0; i < s.length; i++) {
      joltages[i] = stringToNumber(s[i]!);
    }
    return new BatteryBank(joltages);
  }

  toString(): string {
    return this.joltages.map((j) => j.toString()).join("");
  }

  largestPossibleJoltage(): bigint {
    const batteriesToSelectCount = 12;
    const batteriesCount = this.joltages.length;

    const selected: number[] = [];
    let pointer = 0;

    while (selected.length < batteriesToSelectCount) {
      const remainingToSelect = batteriesToSelectCount - selected.length;
      const selectFrom = batteriesCount - remainingToSelect;

      // If the remaining unselected batteries count is the same as missing selected batteries, we
      // just enable all the rest.
      if (pointer >= selectFrom) {
        for (let i = pointer; i < batteriesCount && selected.length < batteriesToSelectCount; i++) {
          selected.push(this.joltages[i]!);
        }
        break;
      }

      let maxValue = 0;
      let maxIndex = pointer;

      for (let i = pointer; i <= selectFrom; i++) {
        if (this.joltages[i]! > maxValue) {
          maxValue = this.joltages[i]!;
          maxIndex = i;
        }
      }

      selected.push(maxValue);
      pointer = maxIndex + 1;
    }

    return selected.reduce((acc, val) => acc * 10n + BigInt(val), 0n);
  }
}
