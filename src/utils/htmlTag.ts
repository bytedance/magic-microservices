/**
 * Copyright (c) 2020 Bytedance Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
export interface HtmlTagObject {
  /**
   * Attributes of the html tag
   * E.g. `{'disabled': true, 'value': 'demo'}`
   */
  attributes?: Record<string, string>;
  /**
   * The tag name e.g. `'div'`
   */
  tagName: string;
  /**
   * The inner HTML
   */
  innerHTML?: string;
  /**
   * Whether this html must not contain innerHTML
   * @see https://www.w3.org/TR/html5/syntax.html#void-elements
   */
  voidTag?: boolean;
}

/**
 * All html tag elements which must not contain innerHTML
 * @see https://www.w3.org/TR/html5/syntax.html#void-elements
 */
const voidTags = [
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
];

export function renderHtmlTagObjectToHtmlElement(tagDefinition: HtmlTagObject): HTMLElement {
  const tagElement = document.createElement(tagDefinition.tagName);
  Object.keys(tagDefinition.attributes || {}).forEach((attributeName) => {
    tagElement.setAttribute(attributeName, tagDefinition.attributes?.[attributeName] || '');
  });
  if (!tagDefinition.voidTag && tagDefinition.innerHTML) {
    tagElement.innerHTML = tagDefinition.innerHTML;
  }
  return tagElement;
}

export function renderHtmlTagObjectsToFragment(tagDefinitions: HtmlTagObject[]): DocumentFragment {
  const fragment = document.createDocumentFragment();
  tagDefinitions.forEach((tagDefinition) => {
    const element = renderHtmlTagObjectToHtmlElement(tagDefinition);
    fragment.appendChild(element);
  });
  return fragment;
}

type AttributesType = Record<string, string>;

export function createHtmlTagObject(tagName: string, attributes: AttributesType, innerHTML?: string): HtmlTagObject {
  return {
    tagName,
    voidTag: voidTags.indexOf(tagName) !== -1,
    attributes: attributes,
    innerHTML,
  };
}

const tagMetaData = {
  scripts: (sourceUrl: string): HtmlTagObject =>
    createHtmlTagObject('script', {
      type: 'text/javascript',
      src: sourceUrl,
    }),
  styles: (sourceUrl: string): HtmlTagObject =>
    createHtmlTagObject('link', {
      rel: 'stylesheet',
      type: 'text/css',
      href: sourceUrl,
    }),
};

export function formatScripts8StylesTagAlias(
  type: 'scripts' | 'styles',
  tagOption: HtmlTagObject | string,
): HtmlTagObject {
  if (typeof tagOption === 'string') {
    return tagMetaData[type](tagOption);
  }
  return tagOption;
}
