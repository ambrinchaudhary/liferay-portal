/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

import ClayIcon from '@clayui/icon';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * @class CollectionInput
 * @extends {React.Component}
 */

export default function Languages({defaultLanguage, languages}) {
	const Language = ({id, label}) => {
		return (
			<li className="list-group-item list-group-item-flex" key="{id}">
				<div className="autofit-col autofit-col-expand">
					<p className="list-group-subtitle text-truncate">
						{' '}
						{label}
					</p>
					<span className="hide"> {id} </span>
				</div>

				<div className="dropdown dropdown-action">
					<ClayIcon symbol="ellipsis-v" />
				</div>
			</li>
		);
	};

	return (
		<ul className="list-group">
			<li className="list-group-header">
				<h3 className="list-group-header-title">
					{Liferay.Language.get('languages')}
				</h3>
			</li>

			{languages.map(language => {
				return <Language id={language.id} label={language.label} />;
			})}
		</ul>
	);
}

Languages.propTypes = {
	defaultLanguage: PropTypes.string,
	languages: PropTypes.array
};
