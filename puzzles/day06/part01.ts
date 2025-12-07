import { readEntireFile } from "../utils/files";
import { Puzzle } from "../utils/puzzle";

export default class extends Puzzle<bigint> {
  readonly expectedTestResult = 4277556n;

  async solution(inputPath: string): Promise<bigint> {
    const rawInput = await readEntireFile(inputPath);
    const cols = parseInput(rawInput);
    let result = 0n;
    for (const col of cols) {
      switch (col.operator) {
        case "*":
          result += col.args.reduce((acc, val) => acc * val, 1n);
          break;
        case "+":
          result += col.args.reduce((acc, val) => acc + val, 0n);
          break;
      }
    }
    return result;
  }
}

type Operator = "+" | "*";
type ParsedInput = Array<{ args: bigint[]; operator: "+" | "*" }>;

function parseInput(s: string): ParsedInput {
  const lines = s.split("\n").filter((line) => line !== "");

  const operatorLine = lines.at(lines.length - 1);
  if (operatorLine === undefined)
    throw new Error(`Operators line was not found in test input: ${lines}`);
  const operators = operatorLine
    .split(" ")
    .map((rawOp) => rawOp.trim())
    .filter((op) => op !== "") as Operator[];

  const rawNumberLines = lines.slice(0, lines.length - 1);
  const numberLines: bigint[][] = [];
  for (const line of rawNumberLines) {
    const rawNumbers = line.split(" ").filter((i) => i !== "");
    const numbers: bigint[] = [];
    for (const rawNumber of rawNumbers) {
      const number = BigInt(rawNumber.trim());
      if (number === undefined) throw new Error(`Invalid number: ${rawNumber}`);
      numbers.push(number);
    }
    numberLines.push(numbers);
  }

  const parsedInput: ParsedInput = operators.map((op) => {
    return { args: [], operator: op };
  });

  for (const numbers of numberLines) {
    for (let i = 0; i < parsedInput.length; i++) {
      const number = numbers.at(i);
      if (number === undefined)
        throw new Error(`Number at index ${i} not found for array ${numbers}`);
      parsedInput[i]?.args.push(number);
    }
  }

  return parsedInput;
}
