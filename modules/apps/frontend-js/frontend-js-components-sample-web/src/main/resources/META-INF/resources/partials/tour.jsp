<%--
/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */
--%>

<%@ include file="/init.jsp" %>

<clay:container-fluid>
	<p>
		Each button starts the same three-step tour with a different option combination. The widget plays the role of the trigger: it decides when to start the tour and stores what has to survive a reload.
	</p>

	<react:component
		module="{TourSamples} from frontend-js-components-sample-web"
	/>
</clay:container-fluid>