/**
 * Copyright (c) 2020 Bytedance Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { HtmlTagObject } from '@/utils/htmlTag';
import heap, { PropTypesMap, ValueOf } from '@/lib/Heap';
import LifeCycle, { AliasTagTypes, MagicPluginTypes } from '@/lib/LifeCycle';

export type { LifeCycle };

export type MagicInstanceType<T extends {} = Record<string, unknown>> = InstanceType<
  ReturnType<LifeCycle<T>['generateCustomElement']>
>;

export interface Module<Props extends {} = Record<string, unknown>> {
  bootstrap?: (magicInstance: MagicInstanceType<Props>) => void;
  mount: (container: Element, props: Props, magicInstance: MagicInstanceType<Props>) => void;
  firstUpdated?: (
    attributeName: keyof Props,
    propsValue: ValueOf<Props>,
    container: Element,
    props: Props,
    magicInstance: MagicInstanceType<Props>,
  ) => void;
  updated?: (
    attributeName: keyof Props,
    propsValue: ValueOf<Props>,
    container: Element,
    props: Props,
    magicInstance: MagicInstanceType<Props>,
    prevValue: ValueOf<Props>,
  ) => void;
  unmount?: (magicInstance: MagicInstanceType<Props>, container: Element) => void;
}

export type ModuleType<Props extends {} = Record<string, unknown>> =
  | Module<Props>
  | Promise<Module<Props>>
  | ((name: string, options: MagicOptions<Props>) => Promise<Module<Props>>);

export type AliasTagTypesOptions = {
  [key in AliasTagTypes]?: (HtmlTagObject | string)[];
};

export interface MagicOptions<Props extends {} = Record<string, unknown>> extends AliasTagTypesOptions {
  htmlTags?: HtmlTagObject[];
  propTypes?: PropTypesMap<Props>;
  shadow?: boolean;
  plugins?: MagicPluginTypes<Props>[];
}

function magic<Props extends {} = Record<string, unknown>>(
  name: string,
  module: ModuleType<Props>,
  options: MagicOptions<Props> = {},
): Promise<unknown> {
  const lifeCycle = new LifeCycle({ name, module, options });
  return lifeCycle.run();
}

export const useProps = heap.useProps;

export const isModuleRegistered = (name: string): boolean => !(customElements.get(name) === undefined);

export default magic;
