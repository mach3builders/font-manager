// import dependencies
import Vue from 'vue'
import VueResource from 'vue-resource'
import FontManager from './components/FontManager.vue'

Vue.use(VueResource)

// run script when dom is loaded
document.addEventListener('DOMContentLoaded', function()
{
	const $handlers		= document.querySelectorAll('.font-handler');
	const $fontManager	= document.querySelector('font-manager');

	if ($handlers.length && $fontManager) {
		var vm = new Vue({
			el: '#app',
			components: {
				FontManager
			}
		});

		/*
		 * Callback function for our Font Manager
		 */
		function selectFont(font, vm) {
			const $dispatcher = vm.dispatcher;

			if ($dispatcher) {
				const $inputFontFamily = $dispatcher.querySelector('.fw_field_font_family');
				const $inputFontWeight = $dispatcher.querySelector('.fw_field_font_weight');
				const $inputFamilyImport = $dispatcher.querySelector('.fw_field_font_family_import');
				const $name = $dispatcher.querySelector('span');

				if ($inputFontFamily && $inputFontWeight && $inputFamilyImport) {
					const dataValue = font.category == 'web safe' ? 'false' : font.family;
					$inputFontFamily.setAttribute('data-value', dataValue);

					$inputFontFamily.value = font.family;
					$inputFontWeight.value = font.variant;
					$inputFamilyImport.value = font.family;
					$name.innerHTML = font.family;
				}
			}
		}

		/*
		 * Add event(s) for the handlers
		 */
		for (let i=0; i<$handlers.length; i++) {
			const $handler = $handlers[i];
			
			$handler.addEventListener('click', (e) => {
				e.preventDefault();

				vm.$refs.fontManager.dispatcher = $handler;
				vm.$refs.fontManager.callback = selectFont.bind();
				vm.$refs.fontManager.show();
			});
		}
	}
});