import Component from 'metal-component/src/Component';
import Soy from 'metal-soy/src/Soy';

import core from 'metal/src/core';
import { CancellablePromise } from 'metal-promise/src/promise/Promise';

import componentTemplates from './FilterComponent.soy';
import controlsTemplates from './FilterControls.soy';

/**
 * Filter Component
 */
class FilterComponent extends Component {
	/**
	 * @inheritDoc
	 */
	attached() {
		this.cache_ = {};

		let filters = [{
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

		this.getEditorImageData()
			.then(imageData => {
				filters.forEach(filter => {
					this.spawnWorker_(filter.uri, {imageData: imageData.preview})
						.then(filteredImageData => {
							let offscreenCanvas = document.createElement('canvas');
							offscreenCanvas.height = filteredImageData.height;
							offscreenCanvas.width = filteredImageData.width;
							offscreenCanvas.getContext('2d').putImageData(filteredImageData, 0, 0);

							let canvas = this.element.querySelector('#' + this.key + filter.id + ' canvas');
							canvas.getContext('2d').drawImage(offscreenCanvas, 0, 0, filteredImageData.width, filteredImageData.height, 0, 0, canvas.width, canvas.height);
						});
				});
			});
	}

	/**
	 * @inheritDoc
	 */
	detached() {
		this.cache_ = {};
	}

	/**
	 * Applies the brighntess filter to generate a final version of the
	 * image. It caches intermediate results to avoid processing again in
	 * case the same brightnessValue is requested again for the same image.
	 *
	 * @param  {Object} imageData An object with several image representations.
	 * @return {CancellablePromise} A promise that will resolve when the webworker
	 * finishes processing the image for preview.
	 */
	preview(imageData) {
		let filters = {
			sepia: this.modulePath + '/FilterWorkerSepia.js',
			invert: this.modulePath + '/FilterWorkerInvert.js',
			grayscale: this.modulePath + '/FilterWorkerGrayscale.js',
			polaroid: this.modulePath + '/FilterWorkerPolaroid.js'
		};

		let promise = this.cache_[this.filter_];

		if (!promise) {
			promise = this.spawnWorker_(filters[this.filter_], {
				imageData: imageData.preview
			});

			this.cache_[this.filter_] = promise;
		}

		return promise;
	}

	/**
	 * Applies the brighntess filter to generate a final
	 * version of the image.
	 *
	 * @param  {Object} imageData An object with several image representations.
	 * @return {CancellablePromise} A promise that will resolve when the webworker
	 * finishes processing the image for preview.
	 */
	process(imageData) {
		let filters = {
			sepia: this.modulePath + '/FilterWorkerSepia.js',
			invert: this.modulePath + '/FilterWorkerInvert.js',
			grayscale: this.modulePath + '/FilterWorkerGrayscale.js',
			polaroid: this.modulePath + '/FilterWorkerPolaroid.js'
		};

		return new CancellablePromise((resolve, reject) => {
			this.spawnWorker_(filters[this.filter_], {
				imageData: imageData.raw
			})
				.then(result => resolve(imageData.toURL(result)));
		});
	}

	previewFilter(event) {
		this.filter_ = event.delegateTarget.getAttribute('data-filter');
		this.requestEditorPreview();
	}

	/**
	 * Spawns the a webworker to do the image processing in a different thread.
	 *
	 * @param  {String} workerURI URI of the worker to spawn.
	 * @param  {Object} message An object with the image and brightness value.
	 * @return {CancellablePromise} A promise that will resolve when the webworker
	 * finishes processing the image.
	 */
	spawnWorker_(workerURI, message) {
		return new CancellablePromise((resolve, reject) => {
			let processWorker = new Worker(workerURI);

			processWorker.onmessage = (event) => resolve(event.data);
			processWorker.postMessage(message);
		});
	}
}

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
		validator: core.isFunction
	},

	/**
	 * Injected helper to get the editor image data
	 * @type {Function}
	 */
	requestEditorPreview: {
		validator: core.isFunction
	},

	/**
	 * Path of this module
	 * @type {Function}
	 */
	modulePath: {
		validator: core.isString
	}
};

// Register component
Soy.register(FilterComponent, componentTemplates);

export default FilterComponent;