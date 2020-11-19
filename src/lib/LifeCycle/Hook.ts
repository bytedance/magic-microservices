/**
 * Copyright (c) 2020 Bytedance Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
export type HookCallback<T, K> = (args?: T, preReturn?: unknown) => K | void;

export class Hook<T, K> {
  tasks: HookCallback<T, K>[];

  constructor() {
    this.tasks = [];
  }

  tap = (tasks: HookCallback<T, K> | HookCallback<T, K>[]): void => {
    tasks instanceof Array ? this.tasks.push(...tasks) : this.tasks.push(tasks);
  };

  call = (args?: T): Promise<T | K | void> => {
    return this.tasks.reduce((preReturn, task) => {
      return preReturn.then((data) => task(args, data));
    }, Promise.resolve(args));
  };
}
