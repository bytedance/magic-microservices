/**
 * Copyright (c) 2020 Bytedance Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import magic, { useProps, isModuleRegistered, ModuleType, MagicOptions } from './index';

export interface MagicModule<Props extends {} = Record<string, unknown>> {
  (name: string, module: ModuleType<Props>, options: MagicOptions<Props>): void;
  useProps: (value: unknown) => string;
  isModuleRegistered: (name: string) => boolean;
}

export default Object.assign(magic, { useProps, isModuleRegistered });
