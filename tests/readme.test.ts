import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { expect, test, vi } from "vitest";

test("README examples run and print what they promise", async () => {
  const readme = readFileSync("README.md", "utf8");
  const example = readme.match(/```ts\n([\s\S]*?)```/)?.[1] ?? "";
  const promisedOutputs = [...example.matchAll(/\/\/ => (.+)/g)].map((match) => match[1].trim());
  expect(promisedOutputs, "the example must show its output with `// => value`").not.toEqual([]);

  mkdirSync("tests/.generated", { recursive: true });
  writeFileSync(
    "tests/.generated/readme-example.ts",
    example.replace(`from "order-pricing"`, `from "../../src/order"`),
  );
  const log = vi.spyOn(console, "log").mockImplementation(() => {});
  await import(/* @vite-ignore */ "./.generated/readme-example");
  const printedOutputs = log.mock.calls.map((args) => String(args[0]));
  log.mockRestore();

  expect(printedOutputs).toEqual(promisedOutputs);
});
