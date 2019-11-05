import {ItemSelectorDialog} from 'item-selector-taglib';

export default function openDialog(editor, linkHref, callback, dialogTitle) {
	console.log('openDialog');

	const itemSelectorDialog = new ItemSelectorDialog.default({
		eventName: editor.name + 'selectDocument',
		title: dialogTitle, //'<liferay-ui:message key="select-item" />',
		url: linkHref
	});

	itemSelectorDialog.open();

	itemSelectorDialog.on('selectedItemChange', function(event) {
		const selectedItem = event.selectedItem;

		if (selectedItem) {
			callback(selectedItem);
		}
	});

	//return itemSelectorDialog;
}