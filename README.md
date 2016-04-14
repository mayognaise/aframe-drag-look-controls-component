# AFrame Drag Look Controls Component

This is basically same as `look-controls` component besides the canvas moves to the way you drag.

For detail, please check [look-controls page](https://aframe.io/docs/components/look-controls.html).

**[DEMO](https://mayognaise.github.io/aframe-drag-look-controls-component/basic/index.html)**

![example](example.gif)

## Properties

| Property | Description | Default Value |
| -------- | ----------- | ------------- |
|`enabled`|Whether look controls are enabled.|true|


## Usage

**The `drag-look-controls` component is usually used alongside the [camera component][components-camera].**

### Browser Installation

Install and use by directly including the [browser files](dist):

```html
<head>
  <title>My A-Frame Scene</title>
  <script src="https://aframe.io/releases/0.2.0/aframe.min.js"></script>
  <script src="https://rawgit.com/mayognaise/aframe-drag-look-controls-component/master/dist/aframe-drag-look-controls-component.min.js"></script>
</head>

<body>
  <a-scene>
    <a-entity camera drag-look-controls></a-entity>
  </a-scene>
</body>
```

### NPM Installation

Install via NPM:

```bash
npm i -D aframe-drag-look-controls-component
```

Then register and use.

```js
import 'aframe'
import 'aframe-drag-look-controls-component'
```



