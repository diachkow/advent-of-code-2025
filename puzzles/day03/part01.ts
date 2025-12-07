import { readFileInLines } from "../utils/files";
import { stringToNumber } from "../utils/numbers";
import { Puzzle } from "../utils/puzzle";

export default class extends Puzzle {
  readonly expectedTestResult = 357;

  async solution(inputPath: string): Promise<number> {
    let total = 0;
    for await (const line of readFileInLines(inputPath)) {
      const batteryBank = BatteryBank.fromString(line);
      const lpj = batteryBank.largestPossibleJoltage();
      // console.log(`Battery bank ${batteryBank.toString()} largest possible joltage is ${lpj}`);
      total += lpj;
    }
    return total;
  }
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

  largestPossibleJoltage(): number {
    for (let n = 9; n > 0; n--) {
      for (let i = 0; i < this.joltages.length - 1; i++) {
        if (this.joltages[i] === n) {
          let max = 0;
          for (let j = i + 1; j < this.joltages.length; j++) {
            if (i !== j && this.joltages[i]! * 10 + this.joltages[j]! > max) {
              max = this.joltages[i]! * 10 + this.joltages[j]!;
            }
          }
          if (max !== 0) return max;
        }
      }
    }
    throw new Error("Cannot find largest possible joltage");
  }
}
