import Component from 'metal-component';
import Soy, {Config} from 'metal-soy';
import './SegmentSelector.es';

import {setIn} from '../../utils/FragmentsEditorUpdateUtils.es';
import getConnectedComponent from '../../store/ConnectedComponent.es';
import templates from './ExperienceSelector.soy';
import { SELECT_EXPERIENCE, CREATE_EXPERIENCE } from '../../actions/actions.es';
import 'frontend-js-web/liferay/compat/modal/Modal.es';

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
		event.preventDefault();

		const {
			experienceName,
			experienceSegmentId
		} = Array.from(event.target.elements).reduce((obj, elem) => {
			return Object.assign({}, obj, { [elem.name]: elem.value })
		}, {});
		
		this.store.dispatchAction(
			CREATE_EXPERIENCE,
			{
				segmentId: experienceSegmentId,
				experienceLabel: experienceName
			}
		);

	}
	_handleDropdownFocus() {
		clearTimeout(this.willToggleDropdownId);
	}
	_handleExperienceClick(event) {
		event.preventDefault();
		
		const experienceId = event.delegateTarget.dataset.experienceId;
		
		this.store.dispatchAction(
			SELECT_EXPERIENCE,
			{
				experienceId,
			}
		);
	}
	prepareStateForRender(state) {
		console.log('Experience Selector Render');

		let innerState = setIn(
			state,
			['availableExperiences'],
			Object.values(state.availableExperiences).map(experience => {
				return Object.assign(
					{},
					experience,
					{
						segmentLabel: Object.values(state.availableSegments).find(
								segment => {
									debugger;
									return segment.segmentId === experience.segmentId
								}
							).segmentLabel
					}
				);
			})
		);

		innerState = setIn(
			innerState,
			['availableSegments'],
			Object.values(state.availableSegments)
		);

		const activeExperience = innerState.availableExperiences.find(
			experience => {
				return experience.experienceId === state.experienceId ?
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
	segmentId: Config.string().internal(),
}


const ConnectedExperienceSelector = getConnectedComponent(
	ExperienceSelector,
	[
		'classPK',
		'availableExperiences',
		'experienceId'
	]
);

Soy.register(ConnectedExperienceSelector, templates);

export {ConnectedExperienceSelector};
export default ConnectedExperienceSelector;