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

package com.liferay.portlet.documentlibrary.util;

import com.liferay.dynamic.data.mapping.kernel.DDMFormFieldValue;
import com.liferay.dynamic.data.mapping.kernel.DDMFormValues;
import com.liferay.dynamic.data.mapping.kernel.UnlocalizedValue;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.image.ImageToolUtil;
import com.liferay.portal.kernel.metadata.RawMetadataProcessorUtil;
import com.liferay.portal.kernel.repository.model.FileVersion;
import com.liferay.portal.repository.liferayrepository.model.LiferayFileVersion;

import java.awt.Graphics2D;
import java.awt.geom.AffineTransform;
import java.awt.image.AffineTransformOp;
import java.awt.image.BufferedImage;
import java.awt.image.RenderedImage;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

/**
 * @author Roberto Díaz
 */
public class ImageOrientationHelper {

	public RenderedImage transform(
			FileVersion fileVersion, RenderedImage renderedImage)
		throws PortalException {

		if (!(fileVersion instanceof LiferayFileVersion)) {
			return renderedImage;
		}

		Map<Locale, String> orientationMetadata = getOrientationMetadata(
			fileVersion);

		if ((orientationMetadata == null) || orientationMetadata.isEmpty()) {
			return renderedImage;
		}

		for (Locale locale : orientationMetadata.keySet()) {
			String orientation = orientationMetadata.get(locale);

			if (orientation.equals(MIRROR_HORIZONTAL)) {
				renderedImage = flipImage(renderedImage);
			}
			else if (orientation.equals(ROTATE_180)) {
				renderedImage = rotateImage(renderedImage, 180);
			}
			else if (orientation.equals(MIRROR_VERTICAL)) {
				renderedImage = flipImage(rotateImage(renderedImage, 180));
			}
			else if (orientation.equals(MIRROR_HORIZONTAL_ROTATE_90_CW)) {
				renderedImage = flipImage(rotateImage(renderedImage, 90));
			}
			else if (orientation.equals(ROTATE_90_CW)) {
				renderedImage = rotateImage(renderedImage, 90);
			}
			else if (orientation.equals(MIRROR_HORIZONTAL_ROTATE_270_CW)) {
				renderedImage = flipImage(rotateImage(renderedImage, 270));
			}
			else if (orientation.equals(ROTATE_270_CW)) {
				renderedImage = rotateImage(renderedImage, 270);
			}
		}

		return renderedImage;
	}

	protected RenderedImage flipImage(RenderedImage renderedImage) {
		BufferedImage image = ImageToolUtil.getBufferedImage(renderedImage);

		int height = image.getHeight();

		AffineTransform affineTransform = AffineTransform.getScaleInstance(
			1.0, -1.0);

		affineTransform.translate(0, -height);

		AffineTransformOp affineTransformOp =
			new AffineTransformOp(affineTransform, null);

		return affineTransformOp.filter(image, null);
	}

	public Map<Locale, String> getOrientationMetadata(FileVersion fileVersion)
		throws PortalException {

		Map<String, DDMFormValues> rawMetadataMap =
			RawMetadataProcessorUtil.getRawMetadataMap(
				fileVersion.getExtension(), fileVersion.getMimeType(),
				fileVersion.getContentStream(false));

		DDMFormValues tikaRawMetadata = rawMetadataMap.get("TIKARAWMETADATA");

		List<DDMFormFieldValue> ddmFormFieldValues =
			tikaRawMetadata.getDDMFormFieldValues();

		Optional<DDMFormFieldValue> tiffOrientationOptionalObject =
			ddmFormFieldValues.stream().filter(
				x -> x.getName().equals("TIFF_ORIENTATION")).findFirst();

		if (tiffOrientationOptionalObject != null) {
			DDMFormFieldValue ddmFormFieldValue =
				tiffOrientationOptionalObject.get();

			UnlocalizedValue value =
				(UnlocalizedValue)ddmFormFieldValue.getValue();

			return value.getValues();
		}

		return null;
	}

	protected RenderedImage rotateImage(
		RenderedImage renderedImage, int degrees) {

		BufferedImage image = ImageToolUtil.getBufferedImage(renderedImage);

		int width = image.getWidth();
		int height = image.getHeight();

		BufferedImage rotatedImage = new BufferedImage(
			height, width, BufferedImage.TYPE_INT_RGB);

		AffineTransform affineTransform = new AffineTransform();

		affineTransform.translate(height / 2, width / 2);
		affineTransform.rotate(Math.toRadians(degrees));
		affineTransform.translate(width / (-2), height / (-2));

		Graphics2D g = rotatedImage.createGraphics();

		g.drawImage(image, affineTransform, null);

		g.dispose();

		return rotatedImage;
	}

	public static final String HORIZONTAL_NORMAL = "1";

	public static final String MIRROR_HORIZONTAL = "2";

	public static final String MIRROR_HORIZONTAL_ROTATE_90_CW = "5";

	public static final String MIRROR_HORIZONTAL_ROTATE_270_CW = "7";

	public static final String MIRROR_VERTICAL = "4";

	public static final String ROTATE_90_CW = "6";

	public static final String ROTATE_180 = "3";

	public static final String ROTATE_270_CW = "8";

}