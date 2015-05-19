(function() {
	var pluginName = 'imageselector';

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
									var eventName = editor.name + 'selectDocument';

									var dialog = new A.LiferayItemSelectorDialog(
										{
											eventName: eventName,
											url: editor.config.filebrowserImageBrowseUrl
										}
									);

									dialog.on(
										'itemSelected',
										function(event) {
											var el = CKEDITOR.dom.element.createFromHtml('<img src="' + event.value + '">');

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
							icon: instance.path + 'assets/image.png',
							label: editor.lang.image.linkTab
						}
					);
				}
			}
		}
	);
})();