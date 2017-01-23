import Vue from 'vue'
import VueResource from 'vue-resource'
import FontManager from './components/FontManager'

Vue.use(VueResource)

document.addEventListener('DOMContentLoaded', function()
{
	const $handlers		= document.querySelectorAll('.font-handler');
	const $fontManager	= document.querySelector('font-manager');

	if ($handlers.length && $fontManager) {
		var fm = new Vue({
			el: '#app',
			components: {
				FontManager
			}
		});

		for (let i=0; i<$handlers.length; i++) {
			const $handler = $handlers[i];
			
			$handler.addEventListener('click', (e) => {
				e.preventDefault();
				fm.$refs.fontManager.show();
			});
		}
	}
});