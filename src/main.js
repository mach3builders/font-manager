import Vue from 'vue'
import VueResource from 'vue-resource'
import FontManager from './components/FontManager'

Vue.use(VueResource)

new Vue({
	el: '#app',
	components: {
		FontManager
	}
})