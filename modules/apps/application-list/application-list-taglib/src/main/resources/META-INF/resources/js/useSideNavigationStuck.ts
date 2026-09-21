/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {useEffect, useState} from 'react';

import {SideNavigationItem} from './types/SideNavigation';

const PINNED_TOLERANCE = 0.5;
const SCOPE_ITEM_SELECTOR = '.side-navigation-scope-item';
const SCROLLER_SELECTOR = '.sidebar-body';

export function useSideNavigationStuck(
	ref: React.RefObject<HTMLElement | null>,
	items: Array<SideNavigationItem>
) {
	const [stuck, setStuck] = useState(false);

	useEffect(() => {
		const scroller =
			ref.current?.querySelector<HTMLElement>(SCROLLER_SELECTOR);

		if (!scroller) {
			return;
		}

		const update = () => {
			const {top} = scroller.getBoundingClientRect();

			const scopeItems = Array.from(
				scroller.querySelectorAll(SCOPE_ITEM_SELECTOR)
			);

			setStuck(
				scroller.scrollTop > 0 &&
					(!scopeItems.length ||
						scopeItems.some(
							(scopeItem) =>
								scopeItem.getBoundingClientRect().top <=
								top + PINNED_TOLERANCE
						))
			);
		};

		update();

		scroller.addEventListener('scroll', update, {passive: true});

		const resizeObserver = new ResizeObserver(update);

		resizeObserver.observe(scroller);

		if (scroller.firstElementChild) {
			resizeObserver.observe(scroller.firstElementChild);
		}

		return () => {
			resizeObserver.disconnect();

			scroller.removeEventListener('scroll', update);
		};
	}, [items, ref]);

	return stuck;
}
