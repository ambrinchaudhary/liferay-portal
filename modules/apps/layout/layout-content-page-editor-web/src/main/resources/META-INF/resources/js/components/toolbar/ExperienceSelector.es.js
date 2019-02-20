import Component from 'metal-component';
import Soy, {Config} from 'metal-soy';
import './SegmentSelector.es';

import getConnectedComponent from '../../store/ConnectedComponent.es';
import templates from './ExperienceSelector.soy';
import { SELECT_EXPERIENCE, CREATE_EXPERIENCE } from '../../actions/actions.es';
import 'frontend-js-web/liferay/compat/modal/Modal.es';


function sortByPriority(a, b) {
	if (a.priority > b.priority) {
		return -1;
	}
	if (a.priority < b.priority) {
		return 1;
	}
	return 0;
}

/**
 * Searchs for a segment based on its Id
 * and returns its label
 *
 * @param {Array} segments
 * @param {string} segmentId
 * @returns {string|undefined}
 */
function findSegmentLabelById(segments, segmentId) {
	const mostWantedSegment = segments.find(
		segment => segment.segmentId === segmentId
	);
	return mostWantedSegment && mostWantedSegment.segmentLabel;
}

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
		const availableExperiencesArray = Object.values(state.availableExperiences)
			.sort(sortByPriority)
			.map(experience => {
				return Object.assign(
					{},
					experience,
					{
						segmentLabel: findSegmentLabelById(
							Object.values(state.availableSegments),
							experience.segmentId
						)
					}
				);
			});
		const activeExperience = availableExperiencesArray.find(
			experience => experience.experienceId === state.experienceId
		);

		let innerState = Object.assign(
			{},
			state,
			{
				availableExperiences: availableExperiencesArray,
				availableSegments: Object.values(state.availableSegments),
				activeExperienceLabel: activeExperience && activeExperience.experienceLabel
			}
		)

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