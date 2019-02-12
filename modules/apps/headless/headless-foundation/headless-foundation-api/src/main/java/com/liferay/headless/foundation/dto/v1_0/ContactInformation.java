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
@XmlRootElement(name = "ContactInformation")
public class ContactInformation {

	public PostalAddress[] getAddress() {
		return _address;
	}

	public Long[] getAddressIds() {
		return _addressIds;
	}

	public Email[] getEmail() {
		return _email;
	}

	public Long[] getEmailIds() {
		return _emailIds;
	}

	public String getFacebook() {
		return _facebook;
	}

	public Long getId() {
		return _id;
	}

	public String getJabber() {
		return _jabber;
	}

	public String getSkype() {
		return _skype;
	}

	public String getSms() {
		return _sms;
	}

	public Phone[] getTelephone() {
		return _telephone;
	}

	public Long[] getTelephoneIds() {
		return _telephoneIds;
	}

	public String getTwitter() {
		return _twitter;
	}

	public WebUrl[] getWebUrl() {
		return _webUrl;
	}

	public Long[] getWebUrlIds() {
		return _webUrlIds;
	}

	public void setAddress(PostalAddress[] address) {
		_address = address;
	}

	public void setAddressIds(Long[] addressIds) {
		_addressIds = addressIds;
	}

	public void setEmail(Email[] email) {
		_email = email;
	}

	public void setEmailIds(Long[] emailIds) {
		_emailIds = emailIds;
	}

	public void setFacebook(String facebook) {
		_facebook = facebook;
	}

	public void setId(Long id) {
		_id = id;
	}

	public void setJabber(String jabber) {
		_jabber = jabber;
	}

	public void setSkype(String skype) {
		_skype = skype;
	}

	public void setSms(String sms) {
		_sms = sms;
	}

	public void setTelephone(Phone[] telephone) {
		_telephone = telephone;
	}

	public void setTelephoneIds(Long[] telephoneIds) {
		_telephoneIds = telephoneIds;
	}

	public void setTwitter(String twitter) {
		_twitter = twitter;
	}

	public void setWebUrl(WebUrl[] webUrl) {
		_webUrl = webUrl;
	}

	public void setWebUrlIds(Long[] webUrlIds) {
		_webUrlIds = webUrlIds;
	}

	private PostalAddress[] _address;
	private Long[] _addressIds;
	private Email[] _email;
	private Long[] _emailIds;
	private String _facebook;
	private Long _id;
	private String _jabber;
	private String _skype;
	private String _sms;
	private Phone[] _telephone;
	private Long[] _telephoneIds;
	private String _twitter;
	private WebUrl[] _webUrl;
	private Long[] _webUrlIds;

}