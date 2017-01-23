<style lang="scss" src="./font-manager.scss" scoped></style>

<template>
<section :class="{ active: active }" id="wrapper">
	<nav>
		<h2>Categorie&euml;n</h2>
		<ul>
			<li v-for="(item, category) in data">
				<a :class="{ active: isActiveCategory(category) }" v-on:click="selectCategory(category)">
					<span class="name">{{ category }}</span>
					<span class="label" v-if="category == 'favorites'">{{ favoriteAmount }}</span>
				</a>
			</li>
		</ul>
	</nav>
	<main>
		<link rel="stylesheet" type="text/css" :href="getFontLink(mutableFontFamily)">
		<header>
			<div class="font" :style="{ fontFamily:''+mutableFontFamily+'', fontStyle:mutableFontStyle, fontWeight:mutableFontWeight }"><i class="icon"></i><span>{{ mutableFontFamily }}</span></div>
			<div class="search"><input type="text" v-model="searchQuery" placeholder="Zoeken in alle categorieën" maxlength="50"></div>
			<div class="close" v-on:click="close"><i class="icon"></i></div>
		</header>
		<section id="content" v-on:scroll="loadFonts">
			<input type="hidden" name="font[0]" :value="mutableFontFamily" id="my-font-family">
			<input type="hidden" name="style[0]" :value="mutableFontStyle" id="my-font-style">
			<input type="hidden" name="weight[0]" :value="mutableFontWeight" id="my-font-weight">
			
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
							<div class="icons"><i class="icon favorite" :class="font.favorite ? 'yes' : ''" v-on:click="selectFavorite(font)"></i></div>
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
	/**
	 * Properties passed from <font-manager>
	 */
	props: {
		fontFamily	: { type: String },
		fontStyle	: { type: String },
		fontWeight	: { type: String }
	},

	/**
	 * Properties handled from within this component
	 */
	data: function () {
		return {
			amount				: 0,
			favoriteAmount		: 0,
			active				: true,
			mutableFontFamily	: this.fontFamily,
			mutableFontStyle	: this.fontStyle || 'normal',
			mutableFontWeight	: this.fontWeight || 'normal',
			$content			: undefined,
			apiUrl				: '//fonts.googleapis.com/css?family=',
			data				: {},
			searchQuery			: '',
    		searchQueryIsDirty	: false,
			isCalculating		: false,
			currentCategory		: { type: String },
			currentFonts		: [],
			timer				: undefined,
			delay				: 200
		}
	},

	/*
	 * Lifecycle methods
	 */
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

	/*
	 * Properties being watched for changes
	 */
	watch: {
		searchQuery: function() {
			this.searchQueryIsDirty = true;
			this.searchFonts();
		}
	},

	/*
	 * Component methods
	 */
	methods: {

		/*
		 * Here we build the data used in this component
		 * This is done in the "mounted" lifecycle method
		 */
		buildData: function(items) {
			const data			= {};
			data['favorites']	= [];
			const families		= [];

			for (let i=0; i<items.length; i++) {
				const item		= items[i];
				const category	= item.category || undefined;
				const family	= item.family || undefined;
				const variants	= item.variants || [];

				if (category && family) {
					if(!data[category]) data[category] = [];

					item['variant']		= variants[0];
					item['style']		= this.getFontStyle(variants[0]);
					item['weight']		= this.getFontWeight(variants[0]);
					item['loaded']		= false;
					item['favorite']	= false;

					data[category].push(item);
				}
			}

			// set the complete data object here
			this.data = data;

			this.currentCategory = 'favorites';
		},

		/*
		 * Check if the category must be activated in the navigation side
		 */
		isActiveCategory: function(category) {
			return this.currentCategory === category;
		},

		/*
		 * Some small logic for getting the font style
		 */
		getFontStyle: function(name) {
			let style;

			if (name.indexOf('italic') !== -1)	style = 'italic';
			else								style = 'normal';

			return style;
		},

		/*
		 * Some small logic for getting the font weight
		 */
		getFontWeight: function(name) {
			let weight;

			if (parseInt(name) > 0)	weight = parseInt(name);
			else					weight = 'normal';

			return weight;
		},

		/*
		 * Some small logic for getting the font link
		 */
		getFontLink: function(font) {
			font = font.replace(/ /g, '+');
			return '//fonts.googleapis.com/css?family='+font;
		},

		/*
		 * Get the full url for the google font api
		 */
		getApiUrl: function(font) {
			var apiFont = [];
			apiFont.push(this.apiUrl);
			apiFont.push(font.family.replace(/ /g, '+'));
			
			if (font.variants[0]) {
				apiFont.push(':');
				apiFont.push(font.variants[0]);
			}

			if (font.subsets[0]) {
				apiFont.push('&subset=');
				apiFont.push(font.subsets[0]);
			}

			// example: '//fonts.googleapis.com/css?family=Anonymous+Pro:italic&subset=greek'
			var font = apiFont.join('');
			
			return font;
		},

		/*
		 * Get the font for the Google Font Loader
		 */
		getLoaderFont: function(font) {
			var apiFont = [];
			apiFont.push(font.family);
			
			if (font.variants[0]) {
				apiFont.push(':');
				apiFont.push(font.variants[0]);
			}

			if (font.subsets[0]) {
				apiFont.push(':');
				apiFont.push(font.subsets[0]);
			}

			var font = apiFont.join('');
			
			return font;
		},

		/*
		 * The method called when you click on a category in the navigation side
		 */
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

		/*
		 * Select a variant of the font hovered
		 */
		selectVariant: function(font, variant) {
			font.variant	= variant;
			font.style		= this.getFontStyle(variant);
			font.weight		= this.getFontWeight(variant);
		},

		/*
		 * Select the font we want to use
		 */
		selectFont: function(font) {
			this.mutableFontFamily	= font.family;
			this.mutableFontStyle	= font.style;
			this.mutableFontWeight	= font.weight;
		},

		/*
		 * Store font as favorite
		 */
		selectFavorite: function(font) {
			font.favorite = font.favorite ? false : true;

			if (font.favorite) {
				this.data['favorites'].push(font);
			}
			else {
				var index = this.data['favorites'].indexOf(font);
				this.data['favorites'].splice(index, 1);
			}

			this.favoriteAmount = this.data['favorites'].length;
		},

		/*
		 * Close the window/component
		 */
		close: function() {
			this.active = false;
		},

		/*
		 * Load all fonts which are visible in the viewport
		 */
		loadFonts: function() {
			if (this.timer) {
				clearTimeout(this.timer);
			}
	
			this.timer = setTimeout(() => {
				const $els = this.$content.querySelectorAll('.font');

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

		/*
		 * Load the font, done with Google Font Loader JS
		 */
		loadFont: function(font) {
			const that = this;

			WebFont.load({
				google: {
					families: [font.family]
				},
				fontloading: function(family, fvd) {
					font.init = true;
					//that.amount++;
				},
				fontactive: function(family, fvd) {
					font.init	= false;
					font.loaded	= true;
					//that.amount--;
				}
			});
		},

		/*
		 * Is the font visible in the viewport? So we can call the loader...
		 */
		isVisible: function($el) {
			const elPosition	= $el.getBoundingClientRect();
			const elHeight		= elPosition.height;
			const contentTop	= this.$content.getBoundingClientRect().top;
			const contentHeight	= this.$content.getBoundingClientRect().height;

			return (
				elPosition.top >= (0 - contentTop) && 
				elPosition.bottom <= (contentHeight + (contentTop + 20))
			);
		},

		/*
		 * Searching fonts mechanism
		 */
		searchFonts: debounce(function() {
			this.isCalculating		= true;
			this.isCalculating		= false;
			this.searchQueryIsDirty	= false;
			
			if (this.searchQuery.length > 1) {
				const result = [];
				for (let category in this.data) {
					const fonts = this.data[category];

					for (let i=0; i<fonts.length; i++) {
						const font = fonts[i];

						if (font.family.toLowerCase().indexOf(this.searchQuery.toLowerCase()) !== -1 && result.indexOf(font) === -1) {
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