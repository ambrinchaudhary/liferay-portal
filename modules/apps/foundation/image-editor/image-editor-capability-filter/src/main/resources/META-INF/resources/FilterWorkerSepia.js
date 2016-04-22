/**
 * Filter Sepia implementation.
 *
 * @param {Event} event The event message passed to the worker. It contains:
 *                      - imageData: The ImageData to transform
 */
onmessage = function(event) {
	var imageData = event.data.imageData;

	var dataLength = imageData.data.length;

	if (dataLength) {
		var data = imageData.data;

		for (var i = 0; i < dataLength; i += 4) {
			var red = data[i];
			var green = data[i+1];
			var blue = data[i+2];

  			var average = 0.3*red + 0.59*green + 0.11 * blue;

			data[i] = average + 100;
			data[i+1] = average + 50;
			data[i+2] = average;
			data[i+3] = 255;
		}
	}

	postMessage(imageData);
};