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
							var dialog;

							Liferay.Util.openWindow(
								{
									constraint: true,
									dialog: {
										destroyOnHide: true,
										'toolbars.footer': [
											{
												label: 'Add',
												cssClass: 'btn-primary',
												on: {
													click: function() {
														console.log('DONE');
													}
												}
											},
											{
												label: 'cancel',
												on: {
													click: function() {
														imageSelectorDialog.hide();
													}
												}
											}
										]
									},
									title: 'Image Selector',
									uri: editor.config.filebrowserImageBrowseUrl
								},
								function(dialog) {
									imageSelectorDialog = dialog;
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
							label: editor.lang.image.linkTab,
							title: editor.lang.image.linkTab
						}
					);
				}
			}
		}
	);
})();