<p align="center">
    <img width="300" src="https://sf16-sg.tiktokcdn.com/obj/eden-sg/lpqulynulog/Magic/logo.qW4rU0mH6aL8.svg">
</p>

<h1 align="center">Magic Microservices</h1>

<div align="center">

Micro frontends made easy.

[![Build Status](https://www.travis-ci.org/bytedance/magic-microservices.svg?branch=main)](https://www.travis-ci.org/bytedance/magic-microservices) [![codecov](https://codecov.io/gh/bytedance/magic-microservices/branch/main/graph/badge.svg?token=FmpE8fWxEu)](https://codecov.io/gh/bytedance/magic-microservices) [![npm](https://img.shields.io/npm/v/@magic-microservices/magic)](https://www.npmjs.com/package/@magic-microservices/magic) [![GitHub](https://img.shields.io/github/license/bytedance/magic-microservices?color=blue)](https://github.com/bytedance/magic-microservices/blob/main/LICENSE)

English | [简体中文](./README-zh_CN.md)

</div>

## Overview

A lightweight micro-frontends function factory based on Web Components.

## Features

- ⚡ Small: small bundle size (ESM Browser: 2.4KB；ESM/CJS：3.7KB；UMD：3.7KB)
- 🚀 Portability: write your code and use it with any frameworks.
- 🔨 Adaptable: an adapter for any JS module, friendly to existing code.
- 💪 Web Components +: empower native Web Components

## Quick Start

1. Download and include the magic functions with a script tag.

```html
<html>
  <body>
    <script src="https://unpkg.com/@magic-microservices/magic@latest/dist/index.umd.js"></script>
  </body>
</html>
```

2. Register your first micro-frontends application.

```html
<html>
  <body>
    <script src="https://unpkg.com/@magic-microservices/magic@latest/dist/index.umd.js"></script>
    <script>
      magic('custom-component', {
        mount: (container) => (container.innerHTML = 'Hello magic!'),
      });
    </script>
  </body>
</html>
```

3. Use your registered micro-frontends application with an HTML tag.

```html
<html>
  <body>
    <custom-component></custom-component>
    <script src="https://unpkg.com/@magic-microservices/magic@latest/dist/index.umd.js"></script>
    <script>
      magic('custom-component', {
        mount: (container) => (container.innerHTML = 'Hello magic!'),
      });
    </script>
  </body>
</html>
```

## Install

### Compatibility Note

Magic Microservices is built upon Web Components. The compatibility of Magic is thus equivalent to that of Web Components.

### Core Logic Compatibility

> from [caniuse.com](http://caniuse.com)

- Modern browsers and Internet Explorer 11 (with [polyfills](https://github.com/webcomponents/polyfills/tree/master/packages/webcomponentsjs))
- Web Components([Custom Elements](https://caniuse.com/custom-elementsv1))
- Web Components([Shadow DOM](https://caniuse.com/shadowdomv1)) (Used when opening sandbox feature)

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" alt="Opera" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Opera |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IE11, Edge                                                                                                                                                                                                      | last 2 versions                                                                                                                                                                                                   | last 2 versions                                                                                                                                                                                               | last 2 versions                                                                                                                                                                                               | last 2 versions                                                                                                                                                                                           |

If you need to support IE11 or pre-Chromium Edge, this library isn't for you. Although Web Components can (to some degree) be polyfilled for legacy browsers, supporting them is outside the scope of this project. If you're using Magic in such a browser, you're gonna have a bad time.

#### Directly `<script>` Include

##### UMD

We have built a UMD package which can be included directly into your HTML:

```html
<script src="https://unpkg.com/@magic-microservices/magic@latest/dist/index.umd.js"></script>
```

The _window_ object has `window.magic` and `window.magic.useProps` functions, which can be used with the externals mechanism.

We also provide compressed packages. If you are in **production** mode, please replace `index.umd.js` with `index.umd.min.js`, which is optimized for speed instead of the development experience.

##### ES Module

For modern browsers, you can also use the ES Module approach to introduce the core logic:

```html
<script type="module">
  import magic, { useProps } from 'https://unpkg.com/@magic-microservices/magic@latest/dist/index.esm.browser.js';
</script>
```

We can use our methods directly.
_PS: ES Module Compatibility: https://caniuse.com/es6-module_

#### NPM

If you want Magic to follow your project with module bundlers like webpack, you can also install our NPM package:

```shell
# the latest version
$ npm i @magic-microservices/magic
```

and use our functions as below:

```javascript
import magic, { useProps } from '@magic-microservices/magic';
```

### Develop your microfrontends application

#### Transform

> Transform your JS module into a "Magic"

The difference between a Magic module and a normal JS Module is that you need to export specific functions to make the required response to the module's rendering, update or unmount steps in the Magic module, and these functions need to conform to the definition of Magic lifecycle.

##### Module lifecycle

Each module will go through a series of mount, update and unmount, similar to every HTML element. You can define what happens at each life stage of your module.

##### LifeCycle Interface

You can define those lifecycle functions as indicated below in your JS module. These functions will be triggered at different application stages.

```typescript
type ValueOf<T> = T[keyof T];

interface Module<Props extends Record<string, unknown>> {
  bootstrap?: () => void;
  firstUpdated?: (attributeName: keyof Props, propsValue: ValueOf<Props>, container: Element, props: Props) => void;
  mount: (container: Element, props: Props) => void;
  updated?: (attributeName: keyof Props, propsValue: ValueOf<Props>, container: Element, props: Props) => void;
  unmount?: () => void;
}
```

##### Lifecycle details

###### Bootstrap

You can execute some logic which is required by micro application before DOM mounted, such as pulling and initializing i18n resource.

###### FirstUpdated

Called will be triggered when initializing every single prop field from DOM attributes before micro-application mount to the DOM. References can be found on Web Components' attributeChangedCallback API.

###### Mount

This function is used to mount your application. Similar to react-dom's render function, this function takes a container element and the props you want to pass to your app, and renders your application into the container. If you are familiar with Web Components, you may find this function do the same thing as the connectedCallback API.

###### Updated

The updated function will be called every time a DOM attribute has changed. You can use it to manage the derived data. It does the same job as Web Components' attributeChangedCallback API.

###### Unmount

The unmount function is called when the application is about to be unmounted or destroyed. It is primarily used for cleanups, such as cancelling timers, dropping network requests, and unsubscribing event listeners.

##### Lifecycle diagram

Below is a diagram for the instance lifecycle. You don’t need to fully understand everything going on right now, but as you learn and build more, it will be a useful reference.

![lifecycle diagram](https://sf16-va.tiktokcdn.com/obj/eden-va2/lpqulynulog/magic/module-lifecycle.png)

#### Code Example

You can refer to the two code snippets using React and Vue (3) below to implement your own JS module.

##### React：

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import List from './component/List.jsx';

const dataList = [{ name: 'hello' }, { name: 'world' }, { name: 'react' }, { name: 'react-dom' }];

export async function bootstrap() {
  console.log('magic-microservices-component bootstraped');
}

export async function mount(container, props) {
  console.log('magic-microservices-component mount >>> ', props);
  ReactDOM.render(React.createElement(List, { ...props, dataList }, null), container);
}

export async function updated(attrName, value, container, props) {
  console.log('magic-microservices-component update >>> ', props);
  ReactDOM.render(React.createElement(List, { ...props, dataList }, null), container);
}

export async function unmount() {
  console.log('magic-microservices-component will unmount');
}
```

##### Vue (3):

```javascript
import Vue from 'vue/index';
import App from './component/Hello.vue';

let vueInstance = null;

export async function bootstrap() {
  console.log('vue app bootstraped');
}

export async function mount(container, props) {
  console.log('magic-microservices-component-vue mount >>> ', props);
  vueInstance = Vue.createApp({
    ...App,
    data() {
      return props;
    },
  }).mount(container);
}

export async function updated(attrName, value) {
  console.log('magic-microservices-component-vue update', attrName, ' >>> ', value);
  vueInstance[attrName] = value;
  vueInstance.$forceUpdate();
}

export async function unmount() {
  console.log('vue app will unmount');
}
```

### Register

> Register: Register your Magic modules as a "microfrontends applications" which HTML natively supported.

#### Get your Magic module

##### Local package

You can import your Magic module (published packages or local module) and pass it as the second argument into magic function:

```javascript
import magic from '@magic-microservices/magic';
import MyModule from '/path/to/your/module';

magic('custom-component', MyModule);
```

##### Remote Package (UMD)

You can get your Magic module directly if it's already been deployed remotely via UMD.
Include your remote UMD module through HTML script tag like:

```html
<script src="https://somewhere/to/your/module/index.umd.js"></script>
```

If your Magic module is already registered on the window, you can use it directly via global variables:

```javascript
magic('custom-component', window.MyModule);
```

##### Remote Package (ES Module)

Of course, similar to UMD, you can also use the ES Module remote package directly like:

```html
<script type="module">
  import MyModule from 'https://somewhere/to/your/module/index.esm.js';
  magic('custom-component', MyModule);
</script>
```

##### SystemJS

If you are using a package registered with [SystemJS](https://github.com/systemjs/systemjs), then everything becomes easier:

```javascript
magic('custom-component', System.import('https://somewhere/to/your/module/index.system.js'));
```

> PS: Advantages of System JS：
>
> - It can load both remote packages and local packages
> - It does not require npm install compared to CJS
> - It does not need to focus on global variables on windows compared to UMD
> - It doesn't need to care about compatibility issues compared to ESM

Your Magic module can now finally be built into a module of any mode, such as NPM package, ES Module package, UMD package or SystemJS package, etc., as long as it can be fetched from the remote at the time of registration.

We recommend using **SystemJS** as your first choice for modularity, because this solution is more friendly to the package-include experience and compatibility of remote-package components.

#### Props

You need to specify the types of all the props for your micro-application in the propTypes attribute as highlighted below. Otherwise, you won't be able to pass down the props, which also means your Web Components' event listeners won't be triggered at all ([WebComponents specification](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#Using_the_lifecycle_callbacks) constraints). This is an example:

```javascript
magic('my-component', window.MyModule, {
  propTypes: {
    id: Number,
    test: Boolean,
    callback: Function,
    count: Number,
  },
});
```

The definition of the type PropTypesMap for propTypes is as follows:

```typescript
type PropTypes = typeof Number | typeof Boolean | typeof String | typeof Array | typeof Function | typeof Object;

interface PropTypesMap {
  [propsName: string]: PropTypes;
}
```

- propsName: name of props
- PropsTy[es: the type of props (using the JS native type constructor, for example: Number)

##### Special handling of reference type data in props

We all have known that WebComponents is an **HTML** specification, so our generated Custom Component (Custom Element) **can only support character string to pass attributes**.

Magic enables WebComponents to pass reference type attributes by using useProps method. If you want to use reference type data in scripting languages(jsx、vue、etc.), you can wrap it in a registered microapplication, such as Array、Function and Object. Of course, there is no need for you to format unreferenced data, because propTypes will help you to do the type conversion together.

**For browser memory management, it is highly recommended to strictly distinguish reference and unreference data and avoid to wrap unreferenced data using useProps.**

Here is a code example:

```javascript
// Register
import magic from '@magic-microservices/magic';

const MyModule = {
  mount: (container, props) => {
    console.log('props >>> ', props);
  },
};

magic('my-application', MyModule, {
  propTypes: {
    id: Number,
    test: Boolean,
    callback: Function,
  },
});

// Use
import { useProps } from '@magic-microservices/magic';

ReactDOM.render(
  <my-application
    id="2"
    test
    callback={useProps(function () {
      return 'test';
    })}
  ></my-application>,
  MOUNT_NODE,
);
```

The final output in the mount function of the "my-application" in the browser is in line with expectations:

![props output](https://sf16-va.tiktokcdn.com/obj/eden-va2/lpqulynulog/magic/props-output.png)

### Use

> Use your micro-application directly via HTML tags

After registration, you can use your magic micro-application directly in the form of HTML tags.
In HTML, for example:

```html
<custom-component id="2" test></custom-component>
```

Or in the script (like React):

```javascript
ReactDOM.render(
  <custom-component id="123" test count={count} callback={useProps(() => 'test')}></custom-component>,
  MOUNT_NODE,
);
```
