<style lang="scss" src="./font-manager.scss" scoped></style>

<template>
<section id="wrapper">
	<nav>
		<h2>Categorie&euml;n</h2>
		<ul>
			<li v-for="(item, category) in data"><a :class="{ active: activeCategory(category) }" v-on:click="selectCategory(category)">{{ category }}</a></li>
		</ul>
	</nav>
	<main>
		<link rel="stylesheet" type="text/css" :href="getFontLink(font)">
		<header>
			<div class="font">Gekozen lettertype:&nbsp;<span :style="{ fontFamily: ''+font+'' }">{{ font }}</span></div>
			<div class="search"><input type="text" placeholder="Zoeken in alle categorieën"></div>
			<div class="close"><i class="icon"></i></div>
		</header>
		<section id="content" v-on:scroll="loadFonts">
			<h2 v-if="current_fonts.length">Resultaten: {{ current_fonts.length }}</h2>
			<div class="fonts">
				<div class="font" :class="font.loaded ? '' : 'loader'" v-for="(font, key) in current_fonts" :data-font="getLoaderFont(font)">
					<div class="wrapper">
						<div class="example">
							<div class="family">
								<div class="name">{{ font.family }}</div>
								<div class="variants">
									<span v-for="variant in font.variants" :class="variant == font.variant ? 'active' : ''" v-on:click="selectVariant(font, variant)">{{ variant }}</span>
								</div>
							</div>
							<div class="text" :style="{ fontFamily: ''+font.family+'' }"><i class="icon"></i><span>The quick brown fox jumps over the lazy dog</span></div>
						</div>
						<div class="actions">
							<div class="icons"></div>
							<a class="btn">Lettertype kiezen</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	</main>
</section>
</template>

<script>
import WebFont from 'webfontloader'

export default {
	props: {
		font: { type: String }
	},

	data: function () {
		return {
			$content: undefined,
			api_url: '//fonts.googleapis.com/css?family=',
			data: {},
			current_category: { type: String },
			current_font: { type: String },
			current_fonts: [],
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
					item['loaded']	= false;

					data[category].push(item);
				}
			}

			// set the complete data object here
			this.data = data;
		},

		activeCategory: function(category) {
			return this.current_category === category;
		},

		getFontLink: function(font) {
			font = font.replace(/ /g, '+');
			return '//fonts.googleapis.com/css?family='+font;
		},

		getApiUrl: function(font) {
			var api_font = [];
			api_font.push(this.api_url);
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
				this.current_category	= category;
				this.current_fonts		= this.data[category];

				// scroll to top
				this.$content.scrollTop	= 0;

				// load fonts
				this.loadFonts();
			}
		},

		selectVariant: function(font, variant) {
			font.variant = variant;
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
					const font	= this.data[this.current_category][i];
					
					if (!font.loaded) {
						const visible = this.isVisible($el);

						if (visible && !font.init) {
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
						}
					}
				}
			}, this.delay);
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
		}
	}
}
</script>