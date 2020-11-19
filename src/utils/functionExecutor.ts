/**
  * Copyright (c) 2020 Bytedance Inc.
  *
  * This source code is licensed under the MIT license found in the
  * LICENSE file in the root directory of this source tree.
  */
type CallbackFunc<T> = (...params: unknown[]) => T;

export default function functionExecutor<T>(callback: CallbackFunc<T> | T, ...args: unknown[]): T {
  return typeof callback === 'function' ? (callback as CallbackFunc<T>)(...args) : callback;
}
