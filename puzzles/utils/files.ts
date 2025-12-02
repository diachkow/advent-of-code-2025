export async function* readFileInLines(path: string): AsyncGenerator<string> {
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

export async function readEntireFile(path: string): Promise<string> {
  const file = Bun.file(path);
  return await file.text();
}
