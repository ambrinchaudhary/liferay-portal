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

import java.util.List;

import javax.servlet.jsp.PageContext;

/**
 * @author Bruno Basto
 */
public class AutocompleteTag extends TemplateRendererTag {

	@Override
	public String getModule() {
		return "metal-autocomplete/src/Autocomplete";
	}

	public void setData(List<String> data) {
		putValue("data", data);
	}

	public void setElementClasses(String elementClasses) {
		putValue("elementClasses", elementClasses);
	}

	public void setInputElement(String inputElement) {
		putValue("inputElement", inputElement);
	}

	@Override
	public void setPageContext(PageContext pageContext) {
		super.setPageContext(pageContext);

		setServletContext(ServletContextUtil.getServletContext());
	}

	public void setVisible(boolean visible) {
		putValue("visible", visible);
	}

	@Override
	protected boolean isRenderTemplate() {
		return false;
	}

}