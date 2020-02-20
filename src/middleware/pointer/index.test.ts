import Pointer from ".";

describe("pointer", () => {
  it("should create a new pointer", () => {
    const pointer = new Pointer(
      "uuid",
      { clientX: 64, clientY: 128, identifier: "mouse" },
      { device: "mouse", startTime: 0 },
    );

    expect(pointer.id).toBe("uuid");
    expect(pointer.detail).toEqual({
      clientX: 64,
      clientY: 128,
      identifier: "mouse",
    });
    expect(pointer.context).toEqual({ device: "mouse", startTime: 0 });
  });
});
