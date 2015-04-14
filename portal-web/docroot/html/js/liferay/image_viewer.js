AUI.add(
	'liferay-image-viewer',
	function(A) {
		var Lang = A.Lang;

		var CSS_FOOTER_BUTTONS = A.getClassName('image', 'viewer', 'footer', 'buttons'),
			CSS_FOOTER_CONTROL = A.getClassName('image', 'viewer', 'footer', 'control'),
			CSS_FOOTER_CONTROL_LEFT = A.getClassName('image', 'viewer', 'footer', 'control', 'left'),
			CSS_FOOTER_CONTROL_RIGHT = A.getClassName('image', 'viewer', 'footer', 'control', 'rigth'),
			CSS_IMAGE_CONTAINER = A.getClassName('image', 'viewer', 'base', 'image', 'container'),
			CSS_IMAGE_CURRENT_CONTAINER = A.getClassName('image', 'viewer', 'base', 'current', 'image'),
			CSS_IMAGE_INFO = A.getClassName('image', 'viewer', 'base', 'image', 'info'),
			CSS_LOADING_ICON = A.getClassName('image', 'viewer', 'base', 'loading', 'icon');

		var LfrImageViewer = A.Component.create(
			{
				ATTRS: {
					btnCloseCaption: {
						validator: Lang.isString,
						value: ''
					},

					TPL_CLOSE : {
						validator: Lang.isString,
						value: '<button class="close image-viewer-base-control image-viewer-close" type="button"><span class="glyphicon glyphicon-chevron-left"></span><h4>{0}</h4></button>'
					},

					TPL_FOOTER_BUTTONS: {
						validator: Lang.isString,
						value: '<div class="' + CSS_FOOTER_BUTTONS + '"><span class="glyphicon glyphicon-info-sign"></span></div>'
					}
				},

				EXTENDS: A.ImageViewer,

				NAME: 'image-viewer',

				NS: 'lfr-image-viewer',

				prototype: {
					initializer: function() {
						var instance = this;

						var btnCloseTemplate = Lang.sub(instance.get('TPL_CLOSE'), [instance.get('btnCloseCaption')]);

						instance.TPL_CLOSE = btnCloseTemplate || instance.TPL_CLOSE;

						instance.TPL_FOOTER_BUTTONS = instance.get('TPL_FOOTER_BUTTONS') || instance.TPL_FOOTER_BUTTONS;

						//OTRA forma de hacer esto?
						instance.TPL_IMAGE_CONTAINER = '<div class="' + CSS_IMAGE_CONTAINER + '"> <div class="' + CSS_IMAGE_INFO + '"></div>' +
						'<span class="glyphicon glyphicon-time ' + CSS_LOADING_ICON + '"></span></div>';

						instance.TPL_CONTROL_LEFT = '<a href="#" class="' + CSS_FOOTER_CONTROL + ' ' + CSS_FOOTER_CONTROL_LEFT +'"><span class="glyphicon glyphicon-chevron-left"></span></a>';
						instance.TPL_CONTROL_RIGHT = '<a href="#" class="' + CSS_FOOTER_CONTROL + ' ' + CSS_FOOTER_CONTROL_RIGHT +'"><span class="glyphicon glyphicon-chevron-right"></span></a>';
					},

					bindUI: function() {
						var instance = this;

						LfrImageViewer.superclass.bindUI.apply(instance, arguments);

						instance._footerButtons.delegate(
							'click',
							instance._onInfoClick,
							'.glyphicon-info-sign',
							instance
						);

						instance.footerNode.delegate(
							'click',
							instance._onControlsClick,
							'.' + CSS_FOOTER_CONTROL,
							instance
						);
					},

					renderUI: function() {
						var instance = this;

						A.ImageViewer.superclass.renderUI.apply(instance, arguments);

						instance._renderFooter();
					},

					_onControlsClick: function(event) {
						var instance = this;

						event.preventDefault();
						event.stopImmediatePropagation();

						if (event.currentTarget.hasClass(CSS_FOOTER_CONTROL_LEFT)) {
							instance.prev();
						}
						else if (event.currentTarget.hasClass(CSS_FOOTER_CONTROL_RIGHT)) {
							instance.next();
						}
					},

					_onInfoClick: function(event) {
						var instance = this;

						event.preventDefault();

						instance.get('contentBox').all('.' + CSS_IMAGE_CONTAINER + ' .' + CSS_IMAGE_INFO).toggleClass('show-info');
					},

					_showCurrentImage: function() {
						var instance = this;

						A.ImageViewer.superclass._showCurrentImage.apply(instance, arguments);

						instance._syncCaptionUI();
						instance._syncInfoUI();
						instance._syncImageInfoUI();
					},

					_syncImageInfoUI: function() {
						var instance = this;

						var link = instance.get('links').item(instance.get('currentIndex'));

						var infoHTML = link.siblings('.image-info') ? link.siblings('.image-info').html() : '';

						var imageInfoNode = instance.get('contentBox').one('.' + CSS_IMAGE_CURRENT_CONTAINER + ' .' + CSS_IMAGE_INFO);

						if (imageInfoNode && infoHTML) {
							imageInfoNode.html(infoHTML);
						}
					},

					_renderControls: function() {
						var body = A.one('body');

						this._closeEl = A.Node.create(this.TPL_CLOSE);
						body.append(this._closeEl);
					},

					_renderFooter: function() {
						var instance = this;

						var container = A.Node.create(instance.TPL_FOOTER_CONTENT);

						instance.setStdModContent('footer', container);

						instance._captionEl = A.Node.create(instance.TPL_CAPTION);
						instance._captionEl.selectable();
						container.append(instance._captionEl);

						container.append(A.Node.create(instance.TPL_CONTROL_LEFT));

						instance._infoEl = A.Node.create(instance.TPL_INFO);
						instance._infoEl.selectable();
						container.append(instance._infoEl);

						container.append(A.Node.create(instance.TPL_CONTROL_RIGHT));

						instance._footerButtons = A.Node.create(instance.TPL_FOOTER_BUTTONS);
						container.append(instance._footerButtons);
					}
				}
			}
		);

		Liferay.ImageViewer = LfrImageViewer;
	},
	'',
	{
		requires: ['aui-image-viewer']
	}
);