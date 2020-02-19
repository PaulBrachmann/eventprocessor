import { flattenArray } from "./utils";

describe("utilities", () => {
  it("should flatten arrays", () => {
    expect(flattenArray([])).toEqual([]);
    expect(flattenArray([1, 2, 3])).toEqual([1, 2, 3]);

    expect(flattenArray([[]])).toEqual([]);
    expect(flattenArray([1, [2], 3])).toEqual([1, 2, 3]);
    expect(flattenArray([1, [2, 3]])).toEqual([1, 2, 3]);
    expect(flattenArray([[1, [2, [[3], [[4]]]]]])).toEqual([1, 2, 3, 4]);
  });
});
