import State from 'metal-state/src/State';

import core from 'metal/src/core';

/**
 * ImageEditor
 *
 * This class adds compatibility for YUI events, re-emitting events 
 * according to YUI naming and adding the capability of adding targets
 * to bubble events to them.
 *
 */
class CompatibilityEventProxy extends State {
	/**
	 * @inheritDoc
	 */
	constructor(opt_config, opt_element) {
		super(opt_config, opt_element);

		this.eventTargets_ = [];
		this.host = opt_config.host;
		this.namespace = opt_config.namespace;

		this.startCompatibility_();
	}

	/**
	 * Registers another EventTarget as a bubble target.
	 *
	 * @param  {!Object} target
	 */
	addTarget(target) {
		this.eventTargets_.push(target);
	}

	/**
	 * Check if the event is an attribute modification event and addapt
	 * the eventName.
	 *
	 */
	checkAttributeEvent_(eventName) {
		return eventName.replace(this.adaptedEvents.match, this.adaptedEvents.replace);
	}

	/**
	 * Emit the event adapted to yui
	 *
	 * @param  {!String} eventName
	 * @param  {!Event} event
	 */
	emitCompatibleEvents_(eventName, event) {
		this.eventTargets_.forEach((target) => {
			if (target.fire) {
				let prefixedEventName = this.namespace ? this.namespace + ':' + eventName : eventName;
				let yuiEvent = target._yuievt.events[prefixedEventName];

				if (core.isObject(event)) {
					try {
						event.target = this.host;
					} catch(err) {}
				}

				let emitFacadeReference;

				if (!this.emitFacade && yuiEvent) {
					emitFacadeReference = yuiEvent.emitFacade;
					yuiEvent.emitFacade = false;
				}

				target.fire(prefixedEventName, event);

				if (!this.emitFacade && yuiEvent) {
					yuiEvent.emitFacade = emitFacadeReference;
				}
			}
		});
	}

	/**
	 * Configuration to emit yui-based events to maintain
	 * backwards compatibility.
	 *
	 */
	startCompatibility_() {
		this.host.on(
			'*',
			(eventName, event) => {
				if (this.eventTargets_.length > 0) {
					this.emitCompatibleEvents_(this.checkAttributeEvent_(eventName), event);
				}
			}
		);
	}
}

CompatibilityEventProxy.STATE = {
	adaptedEvents: {
		value: {
			match: /(.*)(Changed)$/,
			replace: '$1Change'
		}
	},

	emitFacade: {
		value: false
	}
};

export default CompatibilityEventProxy;