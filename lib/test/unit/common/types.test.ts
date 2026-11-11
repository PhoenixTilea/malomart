import { MultilineText, PlainText } from "../../../src/common";

describe("PlainText", () => {
  it("keeps punctuation and non-Latin letters", () => {
    expect(PlainText.parse("Zelda O'Brien & Sons — Ga\u0301nondorf 日本")).toBe(
      "Zelda O'Brien & Sons — Gánondorf 日本"
    );
  });

  it.each([
    ["a line break", "Link\nZelda"],
    ["a tab", "Link\tZelda"],
    ["a null character", "Link\u0000"],
    ["a right-to-left override", "Link\u202Efdp.exe"],
    ["a bidi isolate", "\u2067Link\u2069"]
  ])("rejects %s", (_, value) => {
    expect(PlainText.safeParse(value).success).toBe(false);
  });
});

describe("MultilineText", () => {
  it("allows line breaks", () => {
    expect(MultilineText.parse("First line\nSecond line")).toBe("First line\nSecond line");
  });

  it.each([
    ["a tab", "First line\tSecond"],
    ["a right-to-left override", "First line\n\u202ESecond"]
  ])("rejects %s", (_, value) => {
    expect(MultilineText.safeParse(value).success).toBe(false);
  });
});
