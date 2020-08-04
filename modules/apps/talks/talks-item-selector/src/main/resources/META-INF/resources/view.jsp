<%--
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
--%>

<%@ include file="/init.jsp" %>

<%
String itemSelectorURL = (String)request.getAttribute("itemSelectorURL");
String eventName = (String)request.getAttribute("eventName");
%>

<clay:container-fluid>
	<clay:row>
		<clay:col
			md="6"
		>
			<clay:button
				id="selectPokemonBtn"
				label="Select Pokemon"
			/>

			<h1 id="pokemonTitle"></h1>
		</clay:col>

		<clay:col
			md="6"
		>
			<div class="pokemon-canvas pokemon-canvas-show-grid">

				<%
				for (int i = 1; i <= 1600; i++) {
				%>

					<div class="pixel"></div>

				<%
				}
				%>

			</div>

		</clay:col>
	</clay:row>

	<small>API by <a href="https://pokeapi.co" rel="noopener noreferrer" target="_blank">Pok&eacute;API</a> and CSS + Charmander made by <a href="https://dev.to/maxime_daraize/css-pokemon-4bii" rel="noopener noreferrer" target="_blank">Maxime</a>.</small>
</clay:container-fluid>

<aui:script require="frontend-js-web/liferay/ItemSelectorDialog.es as ItemSelectorDialog">
	var selectPokemonBtn = document.getElementById('selectPokemonBtn');

	var pokemonTitle = document.getElementById('pokemonTitle');

	selectPokemonBtn.addEventListener('click', function (event) {
		var itemSelectorDialog = new ItemSelectorDialog.default({
			eventName: '<%= eventName %>',
			title: 'Select a pokemon',
			singleSelect: true,
			url: '<%= itemSelectorURL %>',
		});

		itemSelectorDialog.open();

		itemSelectorDialog.on('selectedItemChange', function (event) {
			if (event.selectedItem) {

				//always check this, will be null is user cancel or close the dialog

				pokemonTitle.innerText = event.selectedItem.value;
			}
		});
	});
</aui:script>