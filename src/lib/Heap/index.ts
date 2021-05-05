/**
 * Copyright (c) 2020 Bytedance Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import createHash from '@/utils/createHash';

const globalHeapKey = '__MAGIC_HEAP__';

type DataMapType = Record<string, unknown>;

declare global {
  interface Window {
    __MAGIC_HEAP__: DataMapType;
  }
}

type PropTypes = typeof Number | typeof Boolean | typeof String | typeof Array | typeof Function | typeof Object;

export type PropTypesMap<Props extends {} = Record<string, unknown>> = Record<keyof Props, PropTypes>;

export type ValueOf<Props> = Props[keyof Props];

class Heap {
  dataMap: DataMapType = {};

  constructor() {
    if (!window[globalHeapKey]) {
      window[globalHeapKey] = {};
    }
    this.dataMap = window[globalHeapKey];
  }

  useProps = <T>(value: T): string => {
    let propId = createHash(12);
    // 确保地址不重复
    while (Object.prototype.hasOwnProperty.call(this.dataMap, propId)) {
      /* istanbul ignore next */
      propId = createHash(12);
    }
    // 数据入堆
    this.dataMap[propId] = value;
    return propId;
  };

  getPropsValue = <Props extends {} = Record<string, unknown>>(
    name: keyof Props,
    value: string,
    propTypes: PropTypesMap<Props> = {} as PropTypesMap<Props>,
  ): ValueOf<Props> => {
    if (propTypes[name] === Boolean) {
      if (value === 'false') {
        return (false as unknown) as ValueOf<Props>;
      }
      return (true as unknown) as ValueOf<Props>;
    } else if (propTypes[name] === Number) {
      return (Number(value) as unknown) as ValueOf<Props>;
    }
    if (this.dataMap[value]) {
      // 放在堆中的引用类型数据
      const heapValue = this.dataMap[value];
      // 取出即回收
      delete this.dataMap[value];
      return heapValue as ValueOf<Props>;
    }
    return (value as unknown) as ValueOf<Props>;
  };
}

export default new Heap();
