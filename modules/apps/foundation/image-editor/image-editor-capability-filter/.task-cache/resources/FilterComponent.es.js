define("liferay-image-editor-capability-filter@1.0.0/FilterComponent.es", ['exports', 'metal-component/src/Component', 'metal-soy/src/Soy', 'metal/src/core', 'metal-promise/src/promise/Promise', './FilterComponent.soy', './FilterControls.soy'], function (exports, _Component2, _Soy, _core, _Promise, _FilterComponent, _FilterControls) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _Component3 = _interopRequireDefault(_Component2);

	var _Soy2 = _interopRequireDefault(_Soy);

	var _core2 = _interopRequireDefault(_core);

	var _FilterComponent2 = _interopRequireDefault(_FilterComponent);

	var _FilterControls2 = _interopRequireDefault(_FilterControls);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	function _classCallCheck(instance, Constructor) {
		if (!(instance instanceof Constructor)) {
			throw new TypeError("Cannot call a class as a function");
		}
	}

	function _possibleConstructorReturn(self, call) {
		if (!self) {
			throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
		}

		return call && (typeof call === "object" || typeof call === "function") ? call : self;
	}

	function _inherits(subClass, superClass) {
		if (typeof superClass !== "function" && superClass !== null) {
			throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
		}

		subClass.prototype = Object.create(superClass && superClass.prototype, {
			constructor: {
				value: subClass,
				enumerable: false,
				writable: true,
				configurable: true
			}
		});
		if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
	}

	var FilterComponent = function (_Component) {
		_inherits(FilterComponent, _Component);

		function FilterComponent() {
			_classCallCheck(this, FilterComponent);

			return _possibleConstructorReturn(this, _Component.apply(this, arguments));
		}

		FilterComponent.prototype.attached = function attached() {
			var _this2 = this;

			this.cache_ = {};

			var filters = [{
				id: 'sepia',
				uri: this.modulePath + '/FilterWorkerSepia.js'
			}, {
				id: 'polaroid',
				uri: this.modulePath + '/FilterWorkerPolaroid.js'
			}, {
				id: 'invert',
				uri: this.modulePath + '/FilterWorkerInvert.js'
			}, {
				id: 'grayscale',
				uri: this.modulePath + '/FilterWorkerGrayscale.js'
			}];

			this.getEditorImageData().then(function (imageData) {
				filters.forEach(function (filter) {
					_this2.spawnWorker_(filter.uri, { imageData: imageData.preview }).then(function (filteredImageData) {
						var offscreenCanvas = document.createElement('canvas');
						offscreenCanvas.height = filteredImageData.height;
						offscreenCanvas.width = filteredImageData.width;
						offscreenCanvas.getContext('2d').putImageData(filteredImageData, 0, 0);

						var canvas = _this2.element.querySelector('#' + _this2.key + filter.id + ' canvas');
						canvas.getContext('2d').drawImage(offscreenCanvas, 0, 0, filteredImageData.width, filteredImageData.height, 0, 0, canvas.width, canvas.height);
					});
				});
			});
		};

		FilterComponent.prototype.detached = function detached() {
			this.cache_ = {};
		};

		FilterComponent.prototype.preview = function preview(imageData) {
			var filters = {
				sepia: this.modulePath + '/FilterWorkerSepia.js',
				invert: this.modulePath + '/FilterWorkerInvert.js',
				grayscale: this.modulePath + '/FilterWorkerGrayscale.js',
				polaroid: this.modulePath + '/FilterWorkerPolaroid.js'
			};

			var promise = this.cache_[this.filter_];

			if (!promise) {
				promise = this.spawnWorker_(filters[this.filter_], {
					imageData: imageData.preview
				});

				this.cache_[this.filter_] = promise;
			}

			return promise;
		};

		FilterComponent.prototype.process = function process(imageData) {
			var _this3 = this;

			var filters = {
				sepia: this.modulePath + '/FilterWorkerSepia.js',
				invert: this.modulePath + '/FilterWorkerInvert.js',
				grayscale: this.modulePath + '/FilterWorkerGrayscale.js',
				polaroid: this.modulePath + '/FilterWorkerPolaroid.js'
			};

			return new _Promise.CancellablePromise(function (resolve, reject) {
				_this3.spawnWorker_(filters[_this3.filter_], {
					imageData: imageData.raw
				}).then(function (result) {
					return resolve(imageData.toURL(result));
				});
			});
		};

		FilterComponent.prototype.previewFilter = function previewFilter(event) {
			this.filter_ = event.delegateTarget.getAttribute('data-filter');
			this.requestEditorPreview();
		};

		FilterComponent.prototype.spawnWorker_ = function spawnWorker_(workerURI, message) {
			return new _Promise.CancellablePromise(function (resolve, reject) {
				var processWorker = new Worker(workerURI);

				processWorker.onmessage = function (event) {
					return resolve(event.data);
				};
				processWorker.postMessage(message);
			});
		};

		return FilterComponent;
	}(_Component3.default);

	/**
  * State definition.
  * @type {!Object}
  * @static
  */
	FilterComponent.STATE = {
		/**
   * Injected helper to get the editor image data
   * @type {Function}
   */
		getEditorImageData: {
			validator: _core2.default.isFunction
		},

		/**
   * Injected helper to get the editor image data
   * @type {Function}
   */
		requestEditorPreview: {
			validator: _core2.default.isFunction
		},

		/**
   * Path of this module
   * @type {Function}
   */
		modulePath: {
			validator: _core2.default.isString
		}
	};

	// Register component
	_Soy2.default.register(FilterComponent, _FilterComponent2.default);

	exports.default = FilterComponent;
});
//# sourceMappingURL=FilterComponent.es.js.map