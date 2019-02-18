import 'clay-modal';
import Component from 'metal-component';
import Soy, {Config} from 'metal-soy';
import './SegmentSelector.es';

import {setIn} from '../../utils/FragmentsEditorUpdateUtils.es';
import getConnectedComponent from '../../store/ConnectedComponent.es';
import templates from './ExperienceSelector.soy';
import { SELECT_EXPERIENCE } from '../../actions/actions.es';

/**
 * SegmentSelector
 */
class ExperienceSelector extends Component {
	_toggleDropdown(newState = !this.openDropdown) {
		this.openDropdown = newState;
	}
	_handleButtonClick(event) {
		event.preventDefault();
		this._toggleDropdown();
	}
	_handleButtonBlur() {
		clearTimeout(this.willToggleDropdownId);
		this.willToggleDropdownId = setTimeout(() => {
			this._toggleDropdown(false)
		}, 200);
	}
	_createExperience(event) {
		this.modal = !this.modal;
	}
	_handleDropdownFocus() {
		clearTimeout(this.willToggleDropdownId);
	}
	_handleExperienceClick(event) {
		event.preventDefault();
		
		const experienceId = event.delegateTarget.dataset.experienceId

		this.store.dispatchAction(
			SELECT_EXPERIENCE,
			{
				experienceId,
			}
		);
		this._toggleDropdown();
	}
	prepareStateForRender(state) {
		let innerState = setIn(
			state,
			['experiences'],
			Object.values(state.experiences)
		);

		const activeExperience = innerState.experiences.find(
			experience => {
				return experience.experienceId === state.selectedExperienceId ?
				experience.experienceLabel :
				false;
			}
		);

		innerState = setIn(
			innerState,
			['activeExperienceLabel'],
			activeExperience && activeExperience.experienceLabel
		);

		return innerState;
	}
}

ExperienceSelector.STATE = {
	openDropdown: Config.bool().internal().value(false),
	modal: Config.bool().internal().value(false),
}


const ConnectedExperienceSelector = getConnectedComponent(
	ExperienceSelector,
	[
		'classPK',
		'experiences',
		'selectedExperienceId'
	]
);

Soy.register(ConnectedExperienceSelector, templates);

export {ConnectedExperienceSelector};
export default ConnectedExperienceSelector;