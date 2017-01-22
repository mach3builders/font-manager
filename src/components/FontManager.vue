<style lang="scss" src="./font-manager.scss" scoped></style>

<template>
<section id="wrapper">
	<nav>
		<h2>Categorie&euml;n</h2>
		<ul>
			<li v-for="(item, category) in data"><a :class="{ active: isActiveCategory(category) }" v-on:click="selectCategory(category)">{{ category }}</a></li>
		</ul>
	</nav>
	<main>
		<link rel="stylesheet" type="text/css" :href="getFontLink(mutableFontFamily)">
		<header>
			<div class="font" :style="{ fontFamily:''+mutableFontFamily+'', fontStyle:mutableFontStyle, fontWeight:mutableFontWeight }">Gekozen:&nbsp;<span>{{ mutableFontFamily }}</span></div>
			<div class="search"><input type="text" v-model="searchQuery" placeholder="Zoeken in alle categorieën" maxlength="50"></div>
			<div class="close" v-on:click="close"><i class="icon"></i></div>
		</header>
		<section id="content" v-on:scroll="loadFonts">
			<input type="text" name="font[0]" :value="mutableFontFamily" id="my-font-family">
			<input type="text" name="style[0]" :value="mutableFontStyle" id="my-font-style">
			<input type="text" name="weight[0]" :value="mutableFontWeight" id="my-font-weight">
			<h2 v-if="currentCategory.length">Resultaten: {{ currentFonts.length }}</h2>
			<div class="fonts">
				<div class="font" :class="font.loaded ? '' : 'loader'" v-for="(font, key) in currentFonts" :data-font="getLoaderFont(font)">
					<div class="wrapper">
						<div class="example">
							<div class="family">
								<div class="name">{{ font.family }}</div>
								<div class="variants">
									<span v-for="variant in font.variants" :class="variant == font.variant ? 'active' : ''" v-on:click="selectVariant(font, variant)">{{ variant }}</span>
								</div>
							</div>
							<div class="text" :style="{ fontFamily:''+font.family+'',fontStyle:font.style,fontWeight:font.weight }"><i class="icon"></i><span>The quick brown fox jumps over the lazy dog</span></div>
						</div>
						<div class="actions">
							<div class="icons"></div>
							<a class="btn" v-on:click="selectFont(font)">Selecteren</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	</main>
</section>
</template>

<script>
import WebFont from 'webfontloader';
import debounce from 'lodash/debounce';

export default {
	props: {
		fontFamily: { type: String },
		fontStyle: { type: String },
		fontWeight: { type: String }
	},

	data: function () {
		return {
			mutableFontFamily: this.fontFamily,
			mutableFontStyle: this.fontStyle || 'normal',
			mutableFontWeight: this.fontWeight || 'normal',
			$content: undefined,
			apiUrl: '//fonts.googleapis.com/css?family=',
			data: {},
			searchQuery: '',
    		searchQueryIsDirty: false,
			isCalculating: false,
			currentCategory: { type: String },
			currentFonts: [],
			timer: undefined,
			delay: 200
		}
	},

	mounted: function() {
		this.$content = this.$el.querySelector('#content');
		
		// https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyA1qNMkRHQqrv5fW5uuvlm0oCfw731LPIc
		this.$http.get('./static/json/get-fonts.json').then((response) => {
			const items = response.body.items;
			this.buildData(items);
		}, (response) => {
			console.error(response);
		})
	},

	watch: {
		searchQuery: function() {
			this.searchQueryIsDirty = true;
			this.searchFonts();
		}
	},

	methods: {
		buildData: function(items) {
			const data		= {};
			const families	= [];

			for (let i=0; i<items.length; i++) {
				const item		= items[i];
				const category	= item.category || undefined;
				const family	= item.family || undefined;
				const variants	= item.variants || [];

				if (category && family) {
					if(!data[category]) data[category] = [];

					item['variant']	= variants[0];
					item['style']	= this.getFontStyle(variants[0]);
					item['weight']	= this.getFontWeight(variants[0]);
					item['loaded']	= false;

					data[category].push(item);
				}
			}

			// set the complete data object here
			this.data = data;
		},

		isActiveCategory: function(category) {
			return this.currentCategory === category;
		},

		getFontStyle: function(name) {
			let style;

			if (name.indexOf('italic') !== -1)	style = 'italic';
			else								style = 'normal';

			return style;
		},

		getFontWeight: function(name) {
			let weight;

			if (parseInt(name) > 0)	weight = parseInt(name);
			else					weight = 'normal';

			return weight;
		},

		getFontLink: function(font) {
			font = font.replace(/ /g, '+');
			return '//fonts.googleapis.com/css?family='+font;
		},

		getApiUrl: function(font) {
			var api_font = [];
			api_font.push(this.apiUrl);
			api_font.push(font.family.replace(/ /g, '+'));
			
			if (font.variants[0]) {
				api_font.push(':');
				api_font.push(font.variants[0]);
			}

			if (font.subsets[0]) {
				api_font.push('&subset=');
				api_font.push(font.subsets[0]);
			}

			// url: '//fonts.googleapis.com/css?family=Anonymous+Pro:italic&subset=greek'
			var font = api_font.join('');
			
			return font;
		},

		getLoaderFont: function(font) {
			var api_font = [];
			api_font.push(font.family);
			
			if (font.variants[0]) {
				api_font.push(':');
				api_font.push(font.variants[0]);
			}

			if (font.subsets[0]) {
				api_font.push(':');
				api_font.push(font.subsets[0]);
			}

			var font = api_font.join('');
			
			return font;
		},

		selectCategory: function(category) {
			if (this.data[category]) {
				// set data
				this.currentCategory	= category;
				this.currentFonts		= this.data[category];
				this.searchQuery		= '';

				// scroll to top
				this.$content.scrollTop	= 0;

				// load fonts
				this.loadFonts();
			}
		},

		selectVariant: function(font, variant) {
			font.variant	= variant;
			font.style		= this.getFontStyle(variant);
			font.weight		= this.getFontWeight(variant);
		},

		selectFont: function(font) {
			this.mutableFontFamily = font.family;
		},

		close: function() {
			alert('Close window');
		},

		loadFonts: function() {
			if (this.timer) {
				clearTimeout(this.timer);
			}
	
			this.timer = setTimeout(() => {
				const $els = this.$content.querySelectorAll('.font');
				const that = this;

				for (let i=0; i<$els.length; i++) {
					const $el	= $els[i];
					const font	= this.currentFonts[i];
					
					if (!font.loaded) {
						const visible = this.isVisible($el);

						if (visible && !font.init) {
							this.loadFont(font);
						}
					}
				}
			}, this.delay);
		},

		loadFont: function(font) {
			WebFont.load({
				google: {
					families: [font.family]
				},
				fontloading: function(family, fvd) {
					font.init = true;
				},
				fontactive: function(family, fvd) {
					font.init	= false;
					font.loaded	= true;
				}
			});
		},

		isVisible: function($el) {
			const el_position		= $el.getBoundingClientRect();
			const el_height			= el_position.height;
			const content_top		= this.$content.getBoundingClientRect().top;
			const content_height	= this.$content.getBoundingClientRect().height;

			return (
				el_position.top >= (0 - content_top) && 
				el_position.bottom <= (content_height + (content_top + 20))
			);
		},

		searchFonts: debounce(function() {
			this.isCalculating = true;
			this.isCalculating = false;
			this.searchQueryIsDirty = false;
			
			if (this.searchQuery.length > 1) {
				const result = [];
				for (let category in this.data) {
					const fonts = this.data[category];

					for (let i=0; i<fonts.length; i++) {
						const font = fonts[i];

						if (font.family.toLowerCase().indexOf(this.searchQuery.toLowerCase()) != -1) {
							result.push(font);
						}
					}
				}

				this.currentCategory	= 'search';
				this.currentFonts		= result;

				this.loadFonts();
			}
		}, 500)
	}
}
</script>