// import dependencies
import Vue from 'vue'
import VueResource from 'vue-resource'
import FontManager from './components/FontManager'

Vue.use(VueResource)

// run script when dom is loaded
document.addEventListener('DOMContentLoaded', function()
{
	const $handlers		= document.querySelectorAll('.font-handler');
	const $fontManager	= document.querySelector('font-manager');

	if ($handlers.length && $fontManager) {

		/*
		 * Initialize the Vue Instance
		 */
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
				const $inputFont	= $dispatcher.querySelector('.fw_ips_field_font');
				const $inputImport	= $dispatcher.querySelector('.fw_ips_field_font_import');
				const $name			= $dispatcher.querySelector('span');

				if ($inputFont && $inputImport) {
					const dataValue = font.category == 'web safe' ? 'false' : font.family;
					$inputFont.setAttribute('data-value', dataValue);
					$inputFont.value	= font.family;
					$inputImport.value	= font.family;
					$name.innerHTML		= font.family;
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

				vm.$refs.fontManager.dispatcher	= $handler;
				vm.$refs.fontManager.callback	= selectFont.bind();
				vm.$refs.fontManager.show();
			});
		}
	}
});