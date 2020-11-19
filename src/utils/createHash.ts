/**
  * Copyright (c) 2020 Bytedance Inc.
  *
  * This source code is licensed under the MIT license found in the
  * LICENSE file in the root directory of this source tree.
  */
function createHash(num: number): string {
  const hashArr = new Array(num);
  for (let i = 0; i < num; i++) {
    hashArr[i] = ((Math.random() * 16) | 0).toString(16);
  }
  return hashArr.join('');
}

export default createHash;
