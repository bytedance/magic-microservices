/**
 * Copyright (c) 2020 Bytedance Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import magic, { useProps, isModuleRegistered } from '@/index';
import LifeCycle from '@/lib/LifeCycle';

const componentTag = 'my-component';
const shadowComponentTag = 'my-component-shadow';
const pluginComponentTag = 'test-plugin-component';

const mockProps = {
  name: 'Jerry',
  age: 20,
  owner: false,
  guest: '',
  callback: (a: number, b: number) => a + b,
};

type MockProps = typeof mockProps;

describe('test magic', () => {
  function getDom(tagName: string): Element {
    return document.body.getElementsByTagName(tagName)[0];
  }

  test('test magic core', async (done) => {
    const testCustomHtmlTag = 'test-custom-tag';
    const testScriptLink = 'test-script';
    const testStyleLink = 'test-style';
    const testStyleRules = 'body {color: red;}';
    const mockFunction = jest.fn();

    const buttonElement = window.document.createElement(componentTag);
    document.body.appendChild(buttonElement);
    buttonElement.setAttribute('name', mockProps.name);
    buttonElement.setAttribute('age', String(mockProps.age));
    buttonElement.setAttribute('owner', String(mockProps.owner));
    buttonElement.setAttribute('guest', mockProps.guest);
    buttonElement.setAttribute('callback', useProps(mockProps.callback));
    await magic<MockProps>(
      componentTag,
      {
        bootstrap: mockFunction,
        mount: (container, props): void => {
          container.innerHTML = componentTag;
          expect(props.name).toBe(mockProps.name);
          expect(props.age).toBe(mockProps.age);
          expect(props.owner).toBe(mockProps.owner);
          expect(props.guest).toBeTruthy();
          expect(props.callback).toBe(mockProps.callback);
          expect(props.callback(1, 2)).toBe(3);
        },
        updated: (attributeName, propsValue, _container, props): void => {
          expect(attributeName).toBe('age');
          expect(propsValue).toBe(21);
          expect(props.age).toBe(21);
        },
        unmount: () => {
          expect(mockFunction).toHaveBeenCalledTimes(1);
          done();
        },
      },
      {
        propTypes: {
          name: String,
          age: Number,
          owner: Boolean,
          guest: Boolean,
          callback: Function,
        },
        scripts: [testScriptLink],
        styles: [
          testStyleLink,
          {
            tagName: 'style',
            innerHTML: testStyleRules,
          },
        ],
        htmlTags: [
          {
            tagName: 'div',
            attributes: {
              id: testCustomHtmlTag,
            },
            innerHTML: testCustomHtmlTag,
          },
        ],
      },
    );
    const magicDom = getDom(componentTag);
    const magicWrapper = magicDom.querySelector('#magic-wrapper');
    const scriptTag = magicDom.querySelector('script');
    const linkTag = magicDom.querySelector('link');
    const styleTag = magicDom.querySelector('style');
    const customTag = magicDom.querySelector(`#${testCustomHtmlTag}`);
    expect(magicWrapper?.innerHTML).toBe(componentTag);
    expect(scriptTag?.getAttribute('src')).toBe(testScriptLink);
    expect(linkTag?.getAttribute('href')).toBe(testStyleLink);
    expect(styleTag?.sheet?.cssRules[0].cssText).toBe(testStyleRules);
    expect(customTag?.innerHTML).toBe(testCustomHtmlTag);
    buttonElement.setAttribute('age', String(21));
    document.body.getElementsByTagName(componentTag)[0].remove();
  });

  test('test isModuleRegistered', () => {
    magic(componentTag, {
      mount: (container: HTMLElement): void => {
        container.innerHTML = componentTag;
      },
    });
    expect(isModuleRegistered(componentTag)).toBeTruthy();
    expect(isModuleRegistered(shadowComponentTag)).toBeFalsy();
  });

  test('test shadow DOM', async () => {
    const shadowElement = document.createElement(shadowComponentTag);
    document.body.appendChild(shadowElement);
    await magic(
      shadowComponentTag,
      {
        mount: (container: HTMLElement): void => {
          container.innerHTML = '<h1>Hello world</h1>';
        },
      },
      {
        shadow: true,
      },
    );
    const shadowDom = document.body.getElementsByTagName(shadowComponentTag)[0];
    const shadowH1 = shadowDom.shadowRoot?.querySelector('h1');
    expect(shadowH1?.innerHTML).toBe('Hello world');
    shadowDom.remove();
  });

  test('test plugins', (done) => {
    interface testLifeCycleType extends LifeCycle<Record<string, unknown>> {
      test: number;
    }
    const test = 1;
    class MagicPlugin {
      apply(lifeCycle: LifeCycle<Record<string, unknown>>) {
        lifeCycle.hooks.beforeOptionsInit.tap((lifeCycle: testLifeCycleType) => {
          expect(lifeCycle.test).toBeUndefined();
        });
        lifeCycle.hooks.alterHTMLTags.tap([
          (lifeCycle: testLifeCycleType) => {
            lifeCycle.test = test;
          },
          (lifeCycle: testLifeCycleType) => {
            expect(lifeCycle.test).toBe(test);
          },
        ]);
        lifeCycle.hooks.beforeElementDefinition.tap((lifeCycle: testLifeCycleType) => {
          expect(lifeCycle.test).toBe(test);
          done();
        });
      }
    }

    magic(
      pluginComponentTag,
      {
        mount: (container: HTMLElement): void => {
          container.innerHTML = '<h1>Hello world</h1>';
        },
      },
      {
        plugins: [new MagicPlugin()],
      },
    );
  });
});
