import { flattenArray, doesMatchFilter } from "./utils";

describe("flattenArray", () => {
  it("should keep flat arrays flat", () => {
    expect(flattenArray([])).toEqual([]);
    expect(flattenArray([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it("should flatten nested arrays", () => {
    expect(flattenArray([[]])).toEqual([]);
    expect(flattenArray([1, [2], 3])).toEqual([1, 2, 3]);
    expect(flattenArray([1, [2, 3]])).toEqual([1, 2, 3]);
    expect(flattenArray([[1, [2, [[3], [[4]]]]]])).toEqual([1, 2, 3, 4]);
  });
});

describe("doesMatchFilter", () => {
  it("should return true if no filter is given", () => {
    expect(doesMatchFilter("string")).toBe(true);
    expect(doesMatchFilter(false)).toBe(true);
  });

  it("should return true if the element equals the filter value", () => {
    expect(doesMatchFilter(12, 12)).toBe(true);
    expect(doesMatchFilter(false, false)).toBe(true);
  });

  it("should return false if the element does not equal the filter value", () => {
    expect(doesMatchFilter(12, 3)).toBe(false);
    expect(doesMatchFilter(true, false)).toBe(false);
  });

  it("should return true if the element is included in the filter array", () => {
    expect(doesMatchFilter(0, [0, 2, 3])).toBe(true);
    expect(doesMatchFilter("test", ["test"])).toBe(true);
  });

  it("should return false if the element is not included in the filter array", () => {
    expect(doesMatchFilter(0, [1, 2, 3])).toBe(false);
    expect(doesMatchFilter("test", [])).toBe(false);
  });
});
