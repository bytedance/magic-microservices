/**
 * Copyright (c) 2020 Bytedance Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import magic, { useProps, isModuleRegistered, MagicInstanceType } from '@/index';
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

function getDomByTagName(tagName: string): Element {
  return document.body.getElementsByTagName(tagName)[0];
}

describe('test magic', () => {
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

    let magicInstance: MagicInstanceType;

    await magic<MockProps>(
      componentTag,
      {
        bootstrap: mockFunction,
        mount: (container, props, instance): void => {
          container.innerHTML = componentTag;
          expect(props.name).toBe(mockProps.name);
          expect(props.age).toBe(mockProps.age);
          expect(props.owner).toBe(mockProps.owner);
          expect(props.guest).toBeTruthy();
          expect(props.callback).toBe(mockProps.callback);
          expect(props.callback(1, 2)).toBe(3);
          magicInstance = instance;
        },
        updated: (attributeName, propsValue, _container, props, instance): void => {
          expect(attributeName).toBe('age');
          expect(propsValue).toBe(21);
          expect(props.age).toBe(21);
          expect(instance).toBe(magicInstance);
        },
        unmount: (instance) => {
          expect(mockFunction).toHaveBeenCalledTimes(1);
          expect(mockFunction).toHaveBeenCalledWith(magicInstance);
          expect(instance).toBe(magicInstance);
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

    const magicDom = getDomByTagName(componentTag);
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

  test('test isModuleRegistered', async () => {
    expect(isModuleRegistered(componentTag)).toBeTruthy();
    expect(isModuleRegistered(shadowComponentTag)).toBeFalsy();
  });

  // https://stackoverflow.com/questions/40181683/failed-to-execute-createelement-on-document-the-result-must-not-have-childr
  test('test createElement', async () => {
    const createElementTest = 'create-element-test';
    const testElementId = 'create-element-test' + 1;
    await magic(createElementTest, {
      mount: (container: HTMLElement): void => {
        container.innerHTML = createElementTest;
      },
    });
    const createElementTestEle = document.createElement(createElementTest);
    createElementTestEle.setAttribute('id', testElementId);
    document.body.appendChild(createElementTestEle);
    const magicDom = document.body.getElementsByTagName(createElementTest)[0];
    const magicWrapper = magicDom.querySelector('#magic-wrapper');
    expect(magicWrapper?.innerHTML).toBe(createElementTest);
  });

  test('muti createElement', () => {
    const createElementTest = 'create-element-test';
    const testElementId = 'create-element-test' + 2;
    const createElementTestEle = document.createElement(createElementTest);
    createElementTestEle.setAttribute('id', testElementId);
    document.body.appendChild(createElementTestEle);
    const magicDom = document.body.getElementsByTagName(createElementTest)[1];
    // const magicDom = getDomById(createElementTest) as Element;
    const magicWrapper = magicDom.querySelector('#magic-wrapper');
    expect(magicWrapper?.innerHTML).toBe(createElementTest);
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
