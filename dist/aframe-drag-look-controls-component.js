/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	'use strict';

	if (typeof AFRAME === 'undefined') {
	  throw 'Component attempted to register before AFRAME was available.';
	}

	/**
	 * Drag Look Controls component for A-Frame VR.
	 */
	AFRAME.registerComponent('drag-look-controls', {

	  dependencies: ['position', 'rotation'],

	  schema: {
	    enabled: { default: true }
	  },

	  /**
	   * Called once when component is attached. Generally for initial setup.
	   */
	  init: function init() {
	    this.previousPosition = new THREE.Vector3();
	    this.deltaPosition = new THREE.Vector3();
	    this.setupMouseControls();
	    this.setupHMDControls();
	    this.__addStylesheetRules();
	    this.__updateCursor();
	  },


	  /**
	   * Called when component is attached and when component data changes.
	   * Generally modifies the entity based on the data.
	   */
	  update: function update(oldData) {
	    this.__updateCursor();
	    if (!this.data.enabled) {
	      return;
	    }
	    this.controls.update();
	    this.updateOrientation();
	    this.updatePosition();
	  },


	  /**
	   * Called when a component is removed (e.g., via removeAttribute).
	   * Generally undoes all modifications to the entity.
	   */
	  remove: function remove() {
	    this.pause();
	    this.__removeStylesheetRules();
	  },


	  /**
	   * Called on each scene tick.
	   */
	  tick: function tick(t) {
	    this.update();
	  },


	  /**
	   * Called when entity pauses.
	   * Use to stop or remove any dynamic or background behavior such as events.
	   */
	  pause: function pause() {
	    this.removeEventListeners();
	  },


	  /**
	   * Called when entity resumes.
	   * Use to continue or add any dynamic or background behavior such as events.
	   */
	  play: function play() {
	    this.previousPosition.set(0, 0, 0);
	    this.addEventListeners();
	  },


	  /*======================================
	  =            setup controls            =
	  ======================================*/

	  setupMouseControls: function setupMouseControls() {
	    /* The canvas where the scene is painted */
	    this.mouseDown = false;
	    this.pitchObject = new THREE.Object3D();
	    this.yawObject = new THREE.Object3D();
	    this.yawObject.position.y = 10;
	    this.yawObject.add(this.pitchObject);
	  },
	  setupHMDControls: function setupHMDControls() {
	    this.dolly = new THREE.Object3D();
	    this.euler = new THREE.Euler();
	    this.controls = new THREE.VRControls(this.dolly);
	    this.zeroQuaternion = new THREE.Quaternion();
	  },


	  /*===================================
	  =            orientation            =
	  ===================================*/

	  updateOrientation: function () {
	    var hmdEuler = new THREE.Euler();
	    hmdEuler.order = 'YXZ';
	    return function () {
	      var pitchObject = this.pitchObject;
	      var yawObject = this.yawObject;

	      var hmdQuaternion = this.calculateHMDQuaternion();
	      hmdEuler.setFromQuaternion(hmdQuaternion);
	      this.el.setAttribute('rotation', {
	        x: THREE.Math.radToDeg(hmdEuler.x) + THREE.Math.radToDeg(pitchObject.rotation.x),
	        y: THREE.Math.radToDeg(hmdEuler.y) + THREE.Math.radToDeg(yawObject.rotation.y),
	        z: THREE.Math.radToDeg(hmdEuler.z)
	      });
	    };
	  }(),

	  zeroOrientation: function zeroOrientation() {
	    var euler = new THREE.Euler();
	    euler.setFromQuaternion(this.dolly.quaternion.clone().inverse());
	    /* Cancel out roll and pitch. We want to only reset yaw */
	    euler.z = 0;
	    euler.x = 0;
	    this.zeroQuaternion.setFromEuler(euler);
	  },


	  /*==================================
	  =            quaternion            =
	  ==================================*/

	  calculateHMDQuaternion: function () {
	    var hmdQuaternion = new THREE.Quaternion();
	    return function () {
	      var dolly = this.dolly;

	      if (!this.zeroed && !dolly.quaternion.equals(this.zeroQuaternion)) {
	        this.zeroOrientation();
	        this.zeroed = true;
	      }
	      hmdQuaternion.copy(this.zeroQuaternion).multiply(dolly.quaternion);
	      return hmdQuaternion;
	    };
	  }(),

	  updateHMDQuaternion: function () {
	    var hmdQuaternion = new THREE.Quaternion();
	    return function () {
	      var dolly = this.dolly;

	      this.controls.update();
	      if (!this.zeroed && !dolly.quaternion.equals(this.zeroQuaternion)) {
	        this.zeroOrientation();
	        this.zeroed = true;
	      }
	      hmdQuaternion.copy(this.zeroQuaternion).multiply(dolly.quaternion);
	      return hmdQuaternion;
	    };
	  }(),

	  /*================================
	  =            position            =
	  ================================*/

	  updatePosition: function updatePosition() {
	    var el = this.el;

	    var deltaPosition = this.calculateDeltaPosition();
	    var currentPosition = el.getComputedAttribute('position');
	    el.setAttribute('position', {
	      x: currentPosition.x + deltaPosition.x,
	      y: currentPosition.y + deltaPosition.y,
	      z: currentPosition.z + deltaPosition.z
	    });
	  },
	  calculateDeltaPosition: function calculateDeltaPosition() {
	    var dolly = this.dolly;
	    var deltaPosition = this.deltaPosition;
	    var previousPosition = this.previousPosition;

	    deltaPosition.copy(dolly.position);
	    deltaPosition.sub(previousPosition);
	    previousPosition.copy(dolly.position);
	    return deltaPosition;
	  },


	  /*==============================
	  =            events            =
	  ==============================*/

	  addEventListeners: function addEventListeners() {
	    var sceneEl = this.el.sceneEl;
	    var canvas = sceneEl.canvas;

	    /* listen for canvas to load. */

	    if (!canvas) {
	      sceneEl.addEventListener('render-target-loaded', this.addEventListeners.bind(this));
	      return;
	    }

	    /* Mouse Events */
	    canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
	    canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
	    canvas.addEventListener('mouseup', this.releaseMouse.bind(this));
	    canvas.addEventListener('mouseout', this.releaseMouse.bind(this));

	    /* Touch events */
	    canvas.addEventListener('touchstart', this.onTouchStart.bind(this));
	    canvas.addEventListener('touchmove', this.onTouchMove.bind(this));
	    canvas.addEventListener('touchend', this.onTouchEnd.bind(this));

	    this.__updateCursor();
	  },
	  removeEventListeners: function removeEventListeners() {
	    var sceneEl = this.el.sceneEl;
	    var canvas = sceneEl.canvas;

	    if (!canvas) {
	      return;
	    }

	    /* Mouse Events */
	    canvas.removeEventListener('mousedown', this.onMouseDown.bind(this));
	    canvas.removeEventListener('mousemove', this.onMouseMove.bind(this));
	    canvas.removeEventListener('mouseup', this.releaseMouse.bind(this));
	    canvas.removeEventListener('mouseout', this.releaseMouse.bind(this));

	    /* Touch events */
	    canvas.removeEventListener('touchstart', this.onTouchStart.bind(this));
	    canvas.removeEventListener('touchmove', this.onTouchMove.bind(this));
	    canvas.removeEventListener('touchend', this.onTouchEnd.bind(this));
	  },
	  onMouseMove: function onMouseMove(event) {

	    var PI_2 = Math.PI / 2;

	    var pitchObject = this.pitchObject;
	    var yawObject = this.yawObject;
	    var previousMouseEvent = this.previousMouseEvent;

	    if (!this.mouseDown || !this.data.enabled) {
	      return;
	    }

	    var movementX = event.movementX || event.mozMovementX;
	    var movementY = event.movementY || event.mozMovementY;

	    if (movementX === undefined || movementY === undefined) {
	      movementX = event.screenX - previousMouseEvent.screenX;
	      movementY = event.screenY - previousMouseEvent.screenY;
	    }
	    this.previousMouseEvent = event;

	    yawObject.rotation.y += movementX * 0.002;
	    pitchObject.rotation.x += movementY * 0.002;
	    pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));
	  },
	  onMouseDown: function onMouseDown(event) {
	    this.mouseDown = true;
	    this.previousMouseEvent = event;
	    this.__updateCursor();
	  },
	  releaseMouse: function releaseMouse() {
	    this.mouseDown = false;
	    this.__updateCursor();
	  },
	  onTouchStart: function onTouchStart(e) {
	    if (e.touches.length !== 1) {
	      return;
	    }
	    this.touchStart = {
	      x: e.touches[0].pageX,
	      y: e.touches[0].pageY
	    };
	    this.touchStarted = true;
	  },
	  onTouchMove: function onTouchMove(e) {
	    var deltaY = void 0;
	    var yawObject = this.yawObject;
	    if (!this.touchStarted) {
	      return;
	    }
	    deltaY = 2 * Math.PI * (e.touches[0].pageX - this.touchStart.x) / this.el.sceneEl.canvas.clientWidth;
	    /* Limits touch orientaion to to yaw (y axis) */
	    yawObject.rotation.y += deltaY * 0.5;
	    this.touchStart = {
	      x: e.touches[0].pageX,
	      y: e.touches[0].pageY
	    };
	  },
	  onTouchEnd: function onTouchEnd() {
	    this.touchStarted = false;
	  },


	  /*=============================
	  =            style            =
	  =============================*/

	  __removeStylesheetRules: function __removeStylesheetRules() {
	    if (this.__styleEl) document.head.removeChild(this.__styleEl);
	  },
	  __addStylesheetRules: function __addStylesheetRules() {
	    this.__styleEl = document.createElement('style');
	    document.head.appendChild(this.__styleEl);
	    var styleSheet = this.__styleEl.sheet;

	    styleSheet.insertRule('.aframe-grab{cursor:-moz-grab;cursor:-webkit-grab;cursor:grab;}', styleSheet.cssRules.length);
	    styleSheet.insertRule('.aframe-grabbing{cursor:-moz-grabbing;cursor:-webkit-grabbing;cursor:grabbing;}', styleSheet.cssRules.length);
	  },


	  /*==============================
	  =            cursor            =
	  ==============================*/

	  __updateCursor: function __updateCursor() {
	    var canvas = this.el.sceneEl.canvas;

	    if (!canvas) return;
	    if (!this.data.enabled) {
	      canvas.classList.remove('aframe-grab');
	      canvas.classList.remove('aframe-grabbing');
	    } else {
	      if (this.mouseDown) {
	        canvas.classList.remove('aframe-grab');
	        canvas.classList.add('aframe-grabbing');
	      } else {
	        canvas.classList.add('aframe-grab');
	        canvas.classList.remove('aframe-grabbing');
	      }
	    }
	  }
	});

/***/ }
/******/ ]);