import {
	CREATE_EXPERIENCE,
	REMOVE_EXPERIENCE,
	SELECT_EXPERIENCE
} from '../actions/actions.es';


import {setIn} from '../utils/utils.es';

const fetch = function fakeFetch(
	fakeUrl,
	{
		body,
		credentials,
		method
	}
) {
	console.log('faking fetch', fakeUrl);
	return new Promise((resolve, reject) => {
		setTimeout(() => resolve({
			experienceId: 'fakeExperienceId'
		}), 2000);
	});
}



const CREATE_EXPERIENCE_URL = '/something/to/talk/create';
const REMOVE_EXPERIENCE_URL = '/something/to/talk/remove';
const EXPERIENCE_CREDENTIALS = 'weShouldTalk';

/**
 * @param {!object} state
 * @param {!string} actionType
 * @param {object} payload
 * @param {string} payload.segmentId
 * @return {object}
 * @review
 */
function createExperienceReducer(state, actionType, payload) {
	return new Promise(
		resolve => {
			let nextState = state;
			if (actionType === CREATE_EXPERIENCE) {
				const { experienceLabel, segmentId } = payload;

				const body = new FormData();

				body.append('experienceLabel',experienceLabel);
				body.append('segmentId',segmentId);

				fetch(CREATE_EXPERIENCE_URL, {
					body,
					method: 'POST',
					credentials: EXPERIENCE_CREDENTIALS
				})
				.then((response) => {
					const { experienceId } = response;
					return experienceId;
				})
				.then((experienceId) => {
					const experiencePriority = Object.keys(nextState.availableExperiences).length;

					nextState = Object.assign(
						{},
						nextState,
						{
							availableExperiences: Object.assign(
								{},
								nextState.availableExperiences,
								{
									[experienceId]: {
										experienceId,
										experienceLabel,
										active: false,
										experiencePriority,
										segmentId,
									}
								}
							)
						}
					);
					debugger;
					resolve(nextState);
				})
				nextState = setIn(nextState, ['segmentId'], payload.segmentId);
			} else {
				resolve(nextState);
			}
		}
	)
}

function removeExperienceReducer(state, actionType, payload) {
	return new Promise(
		resolve => {
			let nextState = state;

			const { experienceId } = payload;

			const body = new FormData();

			body.append('experienceId',experienceId);

			if (actionType === REMOVE_EXPERIENCE) {
				fetch(REMOVE_EXPERIENCE_URL,{
					body,
					credentials: EXPERIENCE_CREDENTIALS,
					method: 'POST'
				})
				.then(() => {
					delete nextState.experiences[experienceId];
					resolve(nextState);
				})
			} else {
				resolve(nextState)
			}
		}
	)
}

function selectExperienceReducer(state, actionType, payload) {
	let nextState = state;

	if (actionType === SELECT_EXPERIENCE) {
		nextState = setIn(
			nextState,
			['experienceId'],
			payload.experienceId,
		)
	}

	return nextState;
}

export {
	createExperienceReducer,
	removeExperienceReducer,
	selectExperienceReducer
};