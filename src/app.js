// import dependencies
import Vue from 'vue'
import VueResource from 'vue-resource'
import FontManager from './components/FontManager.vue'

Vue.use(VueResource)

// run script when dom is loaded
window.fwRunFontManager = function (dataLocation) {
	const $handlerWrappers = document.querySelectorAll('.fw_font_manager_handler_wrapper');
	
	if ($handlerWrappers.length) {
		/*
		 * Add event(s) for the handlers
		 */
		let vms = [];
		for (let i = 0; i < $handlerWrappers.length; i++) {
			const $handlerWrapper = $handlerWrappers[i];
			const $handler = $handlerWrapper.querySelector('.fw_font_manager_handler');
			const $app = $handlerWrapper.querySelector('.fw_font_manager_app');
			const $fontManager = $handlerWrapper.querySelector('font-manager');

			if ($handler && $app && $fontManager) {
				// set id reference on the handler
				$handler.setAttribute('data-id', i);

				// set id on the app and initialize it
				const newId = 'fw_font_manager_app_'+i;
				$app.id = newId;
				document.body.appendChild($app);

				vms.push(new Vue({
					el: '#'+newId,
					data: {
						dataLocation: dataLocation || './static/json/get-fonts.json'
					},
					components: {
						FontManager
					}
				}));

				$handler.addEventListener('click', (e) => {
					e.preventDefault();

					const key = $handler.dataset.id;
					vms[key].$refs.fontManager.dispatcher = $handler;
					vms[key].$refs.fontManager.callback = selectFont.bind();
					vms[key].$refs.fontManager.show();
				});
			}
		}

		/*
		 * Callback function for our Font Manager
		 */
		function selectFont(font, vm) {
			const $dispatcher = vm.dispatcher;

			if ($dispatcher) {
				const $inputFontFamily = $dispatcher.querySelector('.fw_field_font_family');
				const $inputFontWeight = $dispatcher.querySelector('.fw_field_font_weight');
				const $inputFamilyImport = $dispatcher.querySelector('.fw_field_font_family_import');
				const $name = $dispatcher.querySelector('span.fw_name');
				const $weight = $dispatcher.querySelector('span.fw_weight');

				if ($inputFontFamily && $inputFontWeight && $inputFamilyImport) {
					const dataValue = font.category == 'web safe' ? 'false' : font.family;
					$inputFontFamily.setAttribute('data-value', dataValue);
					$inputFontWeight.setAttribute('data-value', font.variant);

					$inputFontFamily.value = font.family;
					$inputFontWeight.value = font.variant;
					$inputFamilyImport.value = font.family;
					$name.innerHTML = font.family;
					$weight.innerHTML = font.variant;
				}
			}
		}
	}
}