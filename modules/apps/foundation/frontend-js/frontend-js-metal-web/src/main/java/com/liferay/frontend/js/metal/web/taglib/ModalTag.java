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

package com.liferay.frontend.js.metal.web.taglib;

import com.liferay.frontend.js.metal.web.taglib.internal.servlet.ServletContextUtil;
import com.liferay.frontend.taglib.soy.servlet.taglib.TemplateRendererTag;
import com.liferay.portal.kernel.util.GetterUtil;

import java.util.Map;

import javax.servlet.jsp.PageContext;

/**
 * @author Bruno Basto
 */
public class ModalTag extends TemplateRendererTag {

	@Override
	public String getModule() {
		return "metal-modal/src/Modal";
	}

	public String getTemplateNamespace() {
		return "Modal.render";
	}

	public void setBody(String body) {
		putHTMLValue("body", body);
	}

	public void setBodyId(String bodyId) {
		putValue("bodyId", bodyId);
	}

	public void setElement(String element) {
		putValue("element", element);
	}

	public void setElementClasses(String elementClasses) {
		putValue("elementClasses", elementClasses);
	}

	public void setFooter(String footer) {
		putHTMLValue("footer", footer);
	}

	public void setHeader(String header) {
		putHTMLValue("header", header);
	}

	public void setHeaderId(String headerId) {
		putValue("headerId", headerId);
	}

	public void setNoCloseButton(boolean noCloseButton) {
		putValue("noCloseButton", noCloseButton);
	}

	@Override
	public void setPageContext(PageContext pageContext) {
		super.setPageContext(pageContext);

		setServletContext(ServletContextUtil.getServletContext());
	}

	public void setRole(String role) {
		putValue("role", role);
	}

	@Override
	protected void prepareContext(Map<String, Object> context) {
		String elementClasses = GetterUtil.getString(
			context.get("elementClasses"));

		putValue("elementClasses", elementClasses.concat(" modal-hidden"));
	}

}