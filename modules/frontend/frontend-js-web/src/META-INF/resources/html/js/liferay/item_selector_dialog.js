AUI.add(
	'liferay-item-selector-dialog',
	function(A) {
		var Lang = A.Lang;

		var imageSelectorDialog;

		var LiferayItemSelectorDialog = A.Component.create(
			{
				ATTRS: {
					strings: {
						value: {
							add: Liferay.Language.get('add'),
							cancel: Liferay.Language.get('cancel')
						}
					},

					title: {
						validator: Lang.isString,
						value: 'Item selector'
					},

					url: {
						validator: Lang.isString
					}
				},

				NAME: 'item-selector-dialog',

				NS: 'item-selector-dialog',

				prototype: {
					initializer: function() {
						var instance = this;

						var strings = instance.get('strings');

						Liferay.Util.openWindow(
							{
								constraint: true,
								dialog: {
									destroyOnHide: true,
									'toolbars.footer': [
										{
											cssClass: 'btn-primary',
											id: 'addButton',
											label: strings.add,
											on: {
												click: function() {
													instance.fire(
														'addImage',
														{
															src: instance._selectedItem
														}
													);

													imageSelectorDialog.hide();
												}
											}
										},
										{
											id: 'cancelButton',
											label: strings.cancel,
											on: {
												click: function() {
													imageSelectorDialog.hide();
												}
											}
										}
									]
								},
								title: instance.get('title'),
								uri: instance.get('url')
							},
							function(dialog) {
								imageSelectorDialog = dialog;
							}
						);

						instance._bindUI();
					},

					destructor: function() {
						var instance = this;

						(new A.EventHandle(instance._eventHandles)).detach();
					},

					_bindUI: function() {
						var instance = this;

						instance.eventHandles = [
							Liferay.on('itemSelectorDialog:toggleButton', instance._toggleAddButton, instance),
							Liferay.on('itemSelectorDialog:currentImage', instance._onSelectedImage, instance)
						];
					},

					_onSelectedImage: function(details) {
						var instance = this;

						instance._selectedItem = details.url;
					},

					_toggleAddButton: function(details) {
						if (imageSelectorDialog) {
							var addButton = imageSelectorDialog.getToolbar('footer').get('boundingBox').one('#addButton');

							var disabled = details.disabled ? 'disabled' : '';

							addButton.set('disabled', disabled);
						}
					}
				}
			}
		);

		A.LiferayItemSelectorDialog = LiferayItemSelectorDialog;
	},
	'',
	{}
);