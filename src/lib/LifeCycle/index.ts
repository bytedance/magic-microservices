/**
 * Copyright (c) 2020 Bytedance Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import functionExecutor from '@/utils/functionExecutor';
import {
  createHtmlTagObject,
  formatScripts8StylesTagAlias,
  HtmlTagObject,
  renderHtmlTagObjectsToFragment,
  renderHtmlTagObjectToHtmlElement,
} from '@/utils/htmlTag';
import { MagicOptions, Module, ModuleType } from '../../';
import heap from '../Heap';
import { Hook } from './Hook';

export enum MagicHooks {
  beforeOptionsInit = 'beforeOptionsInit',
  alterHTMLTags = 'alterHTMLTags',
  beforeElementDefinition = 'beforeElementDefinition',
}

const hooks = Object.values(MagicHooks);

export interface MagicPluginTypes<Props extends {} = Record<string, unknown>> {
  apply: (lifeCycle: LifeCycle<Props>) => void;
}

export enum AliasTagTypes {
  scripts = 'scripts',
  styles = 'styles',
}

export interface MagicInput<Props extends {} = Record<string, unknown>> {
  name: string;
  module: ModuleType<Props>;
  options: MagicOptions<Props>;
}

export class CustomElementType extends HTMLElement {
  shadow: ShadowRoot;
}

export interface AttributeUpdateConfigType {
  attributeName: string;
  newValue: unknown;
}

export type LifeCycleHookType<Props extends {} = Record<string, unknown>> = Record<
  MagicHooks,
  Hook<LifeCycle<Props>, LifeCycle<Props>>
>;

interface IBuildFragmentOutput {
  htmlTagFragment: DocumentFragment;
  contentWrapper: HTMLElement;
}

export default class LifeCycle<Props extends {} = Record<string, unknown>> {
  public magicInput: MagicInput<Props>;
  public name: string;
  public options: MagicOptions<Props>;
  public module: Module<Props>;
  public customElement: typeof CustomElementType;
  public hooks: LifeCycleHookType<Props> = {} as LifeCycleHookType<Props>;
  public componentBuilder = (): void => customElements.define(this.name, this.customElement);

  constructor(magicInput: MagicInput<Props>) {
    this.magicInput = magicInput;
    this.name = this.magicInput.name;
    this.options = this.magicInput.options;
    hooks.forEach((hook) => {
      this.hooks[hook] = new Hook();
    });
    const plugins = this.options.plugins || [];
    plugins.forEach((plugin) => plugin.apply(this));
  }

  public run = (): Promise<unknown> => {
    const runHook = new Hook();
    runHook.tap([this.generateModule, this.formatAliasTagTypes, this.defineCustomElement]);
    return runHook.call();
  };

  private generateModule = (): Promise<void> => {
    return this.hooks.beforeOptionsInit.call(this).then(() =>
      Promise.resolve(functionExecutor(this.magicInput.module, this.name, this.options)).then((moduleObj) => {
        this.module = moduleObj;
      }),
    );
  };

  private formatAliasTagTypes = (): Promise<LifeCycle<Props>> => {
    const { options } = this;
    Object.values(AliasTagTypes).forEach((tag) => {
      options[tag] = options[tag]?.map((item) => formatScripts8StylesTagAlias(tag, item)) || [];
    });
    return this.hooks.alterHTMLTags.call(this) as Promise<LifeCycle<Props>>;
  };

  private buildFragment = (): IBuildFragmentOutput => {
    const { options } = this;
    const renderHtmlTags = (options.htmlTags || []).concat(
      ...Object.values(AliasTagTypes).map((tagType) => options[tagType] as HtmlTagObject[]),
    );
    const htmlTagFragment = renderHtmlTagObjectsToFragment(renderHtmlTags);
    const contentWrapper = renderHtmlTagObjectToHtmlElement(
      createHtmlTagObject('div', {
        id: 'magic-wrapper',
        style: 'height: 100%; width: 100%;',
      }),
    );
    htmlTagFragment.appendChild(contentWrapper);
    return {
      htmlTagFragment,
      contentWrapper,
    };
  };

  private defineCustomElement = (): Promise<void> => {
    this.customElement = this.generateCustomElement();
    return this.hooks.beforeElementDefinition.call(this).then(this.componentBuilder);
  };

  private generateCustomElement = () => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const { options, module, buildFragment } = this;
    return class CustomElement extends CustomElementType {
      public attributesObj: Props = {} as Props;
      public webComponentsIns: ShadowRoot | HTMLElement;
      public contentWrapper: HTMLElement;
      public htmlTagFragment: DocumentFragment;
      // for attributeChangedCallback
      static get observedAttributes() {
        return Object.keys(options.propTypes || {});
      }

      constructor() {
        super();
        this.webComponentsIns = options.shadow ? this.attachShadow({ mode: 'open' }) : this;
        module.bootstrap && module.bootstrap(this);
      }

      connectedCallback() {
        const { contentWrapper, htmlTagFragment } = buildFragment();
        this.contentWrapper = contentWrapper;
        this.htmlTagFragment = htmlTagFragment;
        this.webComponentsIns.appendChild(this.htmlTagFragment);
        module.mount(this.contentWrapper, this.attributesObj, this);
      }

      disconnectedCallback() {
        module.unmount && module.unmount(this, this.contentWrapper);
      }

      attributeChangedCallback(attributeName: keyof Props, _oldValue: string, newValue: string) {
        const oldAttributesObj = {
          ...this.attributesObj,
        };
        const propsValue = heap.getPropsValue<Props>(attributeName, newValue, options.propTypes);
        const prevValue = this.attributesObj[attributeName];
        this.attributesObj[attributeName] = propsValue;
        (attributeName in oldAttributesObj ? module.updated : module.firstUpdated)?.(
          attributeName,
          propsValue,
          this.contentWrapper,
          this.attributesObj,
          this,
          prevValue,
        );
      }
    };
  };
}
