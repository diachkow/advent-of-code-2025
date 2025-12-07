export abstract class Puzzle<T extends number | bigint = number> {
  /**
   * Expected result for the test input
   */
  abstract readonly expectedTestResult: T;

  /**
   * Solve the puzzle for the given input file
   */
  abstract solution(inputPath: string): Promise<T>;

  /**
   * Execute the puzzle - runs test, then actual with timing
   */
  async execute(dir: string): Promise<void> {
    const testInputPath = `${dir}/test.input.txt`;
    const actualInputPath = `${dir}/actual.input.txt`;

    // Run test
    const testStart = performance.now();
    let testResult: T;
    try {
      testResult = await this.solution(testInputPath);
    } catch (error) {
      console.error(`✗ Test failed with error:`);
      throw error;
    }
    const testDuration = performance.now() - testStart;

    if (testResult !== this.expectedTestResult) {
      console.error(`✗ Test failed`);
      console.error(`  Expected: ${this.expectedTestResult}`);
      console.error(`  Got: ${testResult}`);
      process.exit(1);
    }
    console.log(`✓ Test passed (${testDuration.toFixed(2)}ms)`);

    // Run actual
    const actualStart = performance.now();
    const actualResult = await this.solution(actualInputPath);
    const actualDuration = performance.now() - actualStart;

    console.log(`Actual result: ${actualResult} (${actualDuration.toFixed(2)}ms)`);
  }
}
