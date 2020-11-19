/**
  * Copyright (c) 2020 Bytedance Inc.
  *
  * This source code is licensed under the MIT license found in the
  * LICENSE file in the root directory of this source tree.
  */
import functionExecutor from '@/utils/functionExecutor';

describe('test functionExecutor', () => {
  test('not input function', () => {
    expect(functionExecutor(1)).toBe(1);
  });
  
  test('input function', () => {
    expect(functionExecutor((a: number, b: number) => a + b, 1, 2)).toBe(3);
  });
});
