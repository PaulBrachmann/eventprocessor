import Pointer from ".";

describe("pointer", () => {
  it("should create a new pointer", () => {
    const pointer = new Pointer(
      "uuid",
      {
        buttons: 1,
        clientX: 64,
        clientY: 128,
        identifier: "mouse",
        pressure: 1,
      },
      { device: "mouse", startTime: 0 },
    );

    expect(pointer.id).toBe("uuid");
    expect(pointer.detail).toEqual({
      buttons: 1,
      clientX: 64,
      clientY: 128,
      identifier: "mouse",
      pressure: 1,
    });
    expect(pointer.context).toEqual({ device: "mouse", startTime: 0 });
  });
});
