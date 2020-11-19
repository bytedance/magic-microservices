/**
 * Copyright (c) 2020 Bytedance Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Hook } from '@/lib/LifeCycle/Hook';

test('test Hook', async () => {
  let result = 0;
  const mockFunction = jest.fn((x) => x);
  function dealWithItem(index: number) {
    return (_args: number, preReturn: number) =>
      new Promise((resolve) =>
        setTimeout(() => {
          mockFunction(index);
          result = result + 1;
          resolve(preReturn + 1);
        }, 300 * (3 - index)),
      );
  }
  const hook = new Hook();
  hook.tap(dealWithItem(1));
  hook.tap(dealWithItem(2));
  const hookRes = await hook.call(result);
  expect(mockFunction.mock.calls[0][0]).toBe(1);
  expect(mockFunction.mock.calls[1][0]).toBe(2);
  expect(result).toBe(2);
  expect(hookRes).toBe(2);
});
