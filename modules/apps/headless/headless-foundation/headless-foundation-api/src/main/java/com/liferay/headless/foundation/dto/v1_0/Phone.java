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

package com.liferay.headless.foundation.dto.v1_0;

import javax.annotation.Generated;

import javax.xml.bind.annotation.XmlRootElement;

/**
 * @author Javier Gamarra
 * @generated
 */
@Generated("")
@XmlRootElement(name = "Phone")
public class Phone {

	public String getExtension() {
		return _extension;
	}

	public Long getId() {
		return _id;
	}

	public String getPhoneNumber() {
		return _phoneNumber;
	}

	public String getPhoneType() {
		return _phoneType;
	}

	public void setExtension(String extension) {
		_extension = extension;
	}

	public void setId(Long id) {
		_id = id;
	}

	public void setPhoneNumber(String phoneNumber) {
		_phoneNumber = phoneNumber;
	}

	public void setPhoneType(String phoneType) {
		_phoneType = phoneType;
	}

	private String _extension;
	private Long _id;
	private String _phoneNumber;
	private String _phoneType;

}