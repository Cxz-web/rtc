import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'


import '../../static/main.css'
import './assets/public/iconfont.css'
import '../../static/font.css'



// import Datastore from 'nedb'
import path from 'path'
import { remote } from 'electron'

// Vue.prototype.$db =  new Datastore({
//   autoload: true,
//   filename: path.join(remote.app.getPath('userData'), '/data.db')
// })

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false


Vue.use(ElementUI)
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
