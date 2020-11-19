/**
  * Copyright (c) 2020 Bytedance Inc.
  *
  * This source code is licensed under the MIT license found in the
  * LICENSE file in the root directory of this source tree.
  */
import createHash from '@/utils/createHash';

test('test createHash', () => {
  const random = Math.ceil(Math.random() * 16);
  expect(createHash(random).length).toBe(random);
});
