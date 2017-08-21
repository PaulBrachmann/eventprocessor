/**
 * @file Gesture test suite
 * @author Paul Brachmann
 * @license Copyright (c) 2017 Malpaux IoT All Rights Reserved.
 */

import Gesture from './gesture';
import TransformData from './transformdata';

describe('gesture', () => {
  it('should create a new gesture', () => {
    const gesture = new Gesture();
    expect(gesture.initial).toBeInstanceOf(TransformData);
    expect(gesture.context).toEqual({});
    expect(gesture.current).toBeInstanceOf(TransformData);
    expect(gesture.offset).toBeInstanceOf(TransformData);

    const gesture2 = new Gesture(new TransformData(24, 256, 1, 0));
    const transformData = gesture2.getOffset();
    expect(transformData.translateX).toBe(0);
    expect(transformData.translateY).toBe(0);
    expect(transformData.scale).toBe(1);
    expect(transformData.rotate2d).toBe(0);

    expect(new Gesture(new TransformData(), { key: 'value' }));
  });

  it('should set pointer data & get the transform offset', () => {
    const gesture = new Gesture(new TransformData(0, 256, 1, 0));
    const gesture2 = gesture.setPointer(new TransformData(64, 128, 4, -45));
    const transformData = gesture2.getOffset();
    expect(transformData.translateX).toBe(64);
    expect(transformData.translateY).toBe(-128);
    expect(transformData.scale).toBe(4);
    expect(transformData.rotate2d).toBe(-45);
    expect(gesture2).toBe(gesture);
  });

  it('should rebase a gesture', () => {
    const gesture = new Gesture(new TransformData(128, 256, 64, 0))
      .setPointer(new TransformData(128, 128, 32, 0));

    gesture.rebase(new TransformData(128, 256, 64, 0));
    expect(gesture.initial.translateX).toBe(128);
    expect(gesture.initial.translateY).toBe(256);
    expect(gesture.initial.scale).toBe(64);
    expect(gesture.initial.rotate2d).toBe(0);
    expect(gesture.offset.translateX).toBe(0);
    expect(gesture.offset.translateY).toBe(0);
    expect(gesture.offset.scale).toBe(1);
    expect(gesture.offset.rotate2d).toBe(0);

    const transformData = gesture.getOffset();
    expect(transformData.translateX).toBe(0);
    expect(transformData.translateY).toBe(-128);
    expect(transformData.scale).toBe(0.5);
    expect(transformData.rotate2d).toBe(0);

    gesture.rebase(new TransformData(64, 0, 0, 23));
    expect(gesture.initial.translateX).toBe(64);
    expect(gesture.initial.translateY).toBe(0);
    expect(gesture.initial.scale).toBe(1);
    expect(gesture.initial.rotate2d).toBe(23);
    expect(gesture.offset.translateX).toBe(-64);
    expect(gesture.offset.translateY).toBe(-256);
    expect(gesture.offset.scale).toBe(1 / 64);
    expect(gesture.offset.rotate2d).toBe(23);

    const transformData2 = gesture.getOffset();
    expect(transformData2.translateX).toBe(0);
    expect(transformData2.translateY).toBe(-128);
    expect(transformData2.scale).toBe(0.5);
    expect(transformData2.rotate2d).toBe(0);
  });
});
