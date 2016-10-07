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

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.servlet.jsp.PageContext;

/**
 * @author Bruno Basto
 */
public class TreeViewTag extends TemplateRendererTag {

	public void addChild(Map<String, Object> child) {
		Map<String, Object> context = getContext();

		List<Map<String, Object>> nodes =
			(List<Map<String, Object>>)context.get("nodes");

		if (nodes == null) {
			nodes = new ArrayList<>();
		}

		nodes.add(child);

		putValue("nodes", nodes);
	}

	@Override
	public String getModule() {
		return "metal-treeview/src/Treeview";
	}

	public String getTemplateNamespace() {
		return "Treeview.render";
	}

	public void setElementClasses(String elementClasses) {
		putValue("elementClasses", elementClasses);
	}

	public void setNodes(List<Map<String, Object>> nodes) {
		putValue("nodes", nodes);
	}

	@Override
	public void setPageContext(PageContext pageContext) {
		super.setPageContext(pageContext);

		setServletContext(ServletContextUtil.getServletContext());
	}

}