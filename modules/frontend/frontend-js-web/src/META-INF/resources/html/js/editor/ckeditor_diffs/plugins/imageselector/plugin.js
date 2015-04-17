(function() {
	var pluginName = 'imageselector';
	var imageSelectorDialog;

	CKEDITOR.plugins.add(
		pluginName,
		{
			init: function(editor) {
				var instance = this;

				editor.addCommand(
					pluginName,
					{
						canUndo: false,
						exec: function(editor) {
							AUI().use(
								'liferay-item-selector-dialog',
								function(A) {
									var opener = new A.LiferayItemSelectorDialog(
										{
											title: 'Image selector',
											url: editor.config.filebrowserImageBrowseUrl
										}
									);

									opener.on(
										'addImage',
										function(event) {
											var el = CKEDITOR.dom.element.createFromHtml('<img src="' + event.src + '">');

											editor.insertElement(el);
										}
									);
								}
							);
						}
					}
				);

				if (editor.ui.addButton) {
					editor.ui.addButton(
						'ImageSelector',
						{
							command: pluginName,
							icon: themeDisplay.getPathJavaScript() + '/editor/ckeditor/plugins/imageselector/assets/image.png',
							label: editor.lang.image.linkTab
						}
					);
				}
			}
		}
	);
})();