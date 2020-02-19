import Pointer from "./pointer";

describe("pointer", () => {
  it("should create a new pointer", () => {
    const pointer = new Pointer(
      "uuid",
      { clientX: 64, clientY: 128, identifier: "mouse" },
      "mouse",
    );
    expect(pointer.id).toBe("uuid");
    expect(pointer.detail).toEqual({
      clientX: 64,
      clientY: 128,
      identifier: "mouse",
    });
    expect(pointer.device).toBe("mouse");
  });
});
