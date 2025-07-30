/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayButton from '@clayui/button';
import ClayIcon from '@clayui/icon';
import {useIsMounted} from '@liferay/frontend-js-react-web';
import {debounce} from 'frontend-js-web';
import React, {
	useCallback,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';

import '@liferay/document-library-preview-css';

/**
 * Zoom ratio limit that fire the autocenter
 */
const MIN_ZOOM_RATIO_AUTOCENTER = 3;

/**
 * Available zoom sizes
 */
const ZOOM_LEVELS = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];

/**
 * Available reversed zoom sizes
 */
const ZOOM_LEVELS_REVERSED = [...ZOOM_LEVELS].reverse();

type Props = {
	alt?: string;
	imageURL?: string;
};

/**
 * Component that create an image preview to allow zoom
 * @review
 */
const ImagePreviewer = ({alt, imageURL}: Props) => {
	const [currentZoom, setCurrentZoom] = useState(1.0);
	const [imageHeight, setImageHeight] = useState<number | null>(null);
	const [imageWidth, setImageWidth] = useState<number | null>(null);
	const [imageMargin, setImageMargin] = useState('auto');
	const [zoomInDisabled, setZoomInDisabled] = useState(true);
	const [zoomOutDisabled, setZoomOutDisabled] = useState(false);
	const [zoomRatio, setZoomRatio] = useState<number | null>(null);

	const imageRef = useRef<HTMLImageElement>(null);
	const imageContainerRef = useRef<HTMLDivElement>(null);

	const isMounted = useIsMounted();

	const updateToolbar = useCallback((zoom: number) => {
		setCurrentZoom(zoom);
		setZoomInDisabled(ZOOM_LEVELS_REVERSED[0] === zoom);
		setZoomOutDisabled(ZOOM_LEVELS[0] >= zoom);
	}, []);

	const getFittingZoom = useCallback(() => {
		const imageElement = imageRef.current;

		if (!imageElement || !imageElement.naturalWidth) {
			return 1;
		}

		return imageElement.width / imageElement.naturalWidth;
	}, []);

	const applyZoom = useCallback(
		(zoom: number) => {
			const imageElement = imageRef.current;

			if (!imageElement) {
				return;
			}

			setImageHeight(imageElement.naturalHeight * zoom);
			setImageWidth(imageElement.naturalWidth * zoom);
			setZoomRatio(zoom / currentZoom);

			updateToolbar(zoom);
		},
		[currentZoom, updateToolbar]
	);

	const imageStyles = useMemo((): React.CSSProperties => {
		const styles: React.CSSProperties = {
			margin: imageMargin,
		};

		if (imageHeight !== null && imageWidth !== null) {
			styles.height = `${imageHeight}px`;
			styles.maxHeight = `${imageHeight}px`;
			styles.maxWidth = `${imageWidth}px`;
			styles.width = `${imageWidth}px`;
		}

		return styles;
	}, [imageHeight, imageMargin, imageWidth]);

	const handleImageLoad = useCallback(() => {
		updateToolbar(getFittingZoom());
	}, [getFittingZoom, updateToolbar]);

	const handlePercentButtonClick = useCallback(() => {
		if (currentZoom === 1) {
			setImageHeight(null);
			setImageWidth(null);
		}
		else {
			applyZoom(1);
		}
	}, [applyZoom, currentZoom]);

	const handleZoomIn = useCallback(() => {
		const newZoom = ZOOM_LEVELS.find((zoom) => zoom > currentZoom);

		if (newZoom) {
			applyZoom(newZoom);
		}
	}, [applyZoom, currentZoom]);

	const handleZoomOut = useCallback(() => {
		const newZoom = ZOOM_LEVELS_REVERSED.find((zoom) => zoom < currentZoom);

		if (newZoom) {
			applyZoom(newZoom);
		}
	}, [applyZoom, currentZoom]);

	useLayoutEffect(() => {
		const imageElement = imageRef.current;
		const imageContainerElement = imageContainerRef.current;

		if (
			!imageElement ||
			!imageContainerElement ||
			!zoomRatio ||
			imageHeight === null ||
			imageWidth === null
		) {
			return;
		}

		if (
			imageContainerElement.clientWidth < imageElement.naturalWidth ||
			imageContainerElement.clientHeight < imageElement.naturalHeight
		) {
			let scrollLeft;
			let scrollTop;

			if (zoomRatio < MIN_ZOOM_RATIO_AUTOCENTER) {
				scrollLeft =
					(imageContainerElement.clientWidth * (zoomRatio - 1)) / 2 +
					imageContainerElement.scrollLeft * zoomRatio;
				scrollTop =
					(imageContainerElement.clientHeight * (zoomRatio - 1)) / 2 +
					imageContainerElement.scrollTop * zoomRatio;
			}
			else {
				scrollTop =
					(imageHeight - imageContainerElement.clientHeight) / 2;
				scrollLeft =
					(imageWidth - imageContainerElement.clientWidth) / 2;
			}

			imageContainerElement.scrollLeft = scrollLeft;
			imageContainerElement.scrollTop = scrollTop;

			setZoomRatio(null);
		}
	}, [imageHeight, imageWidth, zoomRatio]);

	useLayoutEffect(() => {
		const imageElement = imageRef.current;
		const imageContainerElement = imageContainerRef.current;

		if (!imageElement || !imageContainerElement) {
			return;
		}

		const calculateLayout = () => {
			if (!isMounted()) {
				return;
			}

			setImageMargin(
				`${
					imageHeight !== null &&
					imageHeight > imageContainerElement.clientHeight
						? 0
						: 'auto'
				} ${
					imageWidth !== null &&
					imageWidth > imageContainerElement.clientWidth
						? 0
						: 'auto'
				}`
			);

			if (!imageElement.style.width) {
				updateToolbar(getFittingZoom());
			}
		};

		const debouncedCalculateLayout = debounce(calculateLayout, 250);

		calculateLayout();

		window.addEventListener('resize', debouncedCalculateLayout);

		return () => {
			window.removeEventListener('resize', debouncedCalculateLayout);
		};
	}, [getFittingZoom, imageHeight, imageWidth, isMounted, updateToolbar]);

	if (!imageURL) {
		return null;
	}

	return (
		<div className="preview-file">
			<div
				className="preview-file-container preview-file-max-height"
				ref={imageContainerRef}
			>
				<img
					alt={alt}
					className="preview-file-image"
					onLoad={handleImageLoad}
					ref={imageRef}
					src={imageURL}
					style={imageStyles}
				/>
			</div>

			<div className="preview-toolbar-container">
				<ClayButton.Group className="floating-bar">
					<ClayButton
						aria-label={Liferay.Language.get('zoom-out')}
						className="btn-floating-bar"
						disabled={zoomOutDisabled}
						displayType={null}
						monospaced
						onClick={handleZoomOut}
						title={Liferay.Language.get('zoom-out')}
					>
						<ClayIcon symbol="hr" />
					</ClayButton>

					<ClayButton
						aria-label={
							currentZoom === 1
								? Liferay.Language.get('zoom-to-fit')
								: Liferay.Language.get('real-size')
						}
						className="btn-floating-bar btn-floating-bar-text"
						displayType={null}
						onClick={handlePercentButtonClick}
						title={
							currentZoom === 1
								? Liferay.Language.get('zoom-to-fit')
								: Liferay.Language.get('real-size')
						}
					>
						<span className="preview-toolbar-label-percent">
							{Math.round((currentZoom || 0) * 100)}%
						</span>
					</ClayButton>

					<ClayButton
						aria-label={Liferay.Language.get('zoom-in')}
						className="btn-floating-bar"
						disabled={zoomInDisabled}
						displayType={null}
						monospaced
						onClick={handleZoomIn}
						title={Liferay.Language.get('zoom-in')}
					>
						<ClayIcon symbol="plus" />
					</ClayButton>
				</ClayButton.Group>
			</div>
		</div>
	);
};

export {ImagePreviewer};
