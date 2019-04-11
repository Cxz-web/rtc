import Vue from 'vue'
import Vuex from 'vuex'

import { createPersistedState, createSharedMutations } from 'vuex-electron'

// import modules from './modules'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
		token: '',
		lessonId: ''
	},
	actions: {
    setToken(store, token) {
      store.commit("SET_MAIN_TOKEN", token)
    },
		setLessonId(store, id) {
			store.commit("SET_MAIN_LESSONID", id)
		}
  },

  mutations: {
    SET_MAIN_TOKEN(state, token) {
      state.token = token
    },
		SET_MAIN_LESSONID(state, id) {
			state.lessonId = id
		}
  },
	
  plugins: [
    createPersistedState()
    // createSharedMutations()
  ],
  strict: process.env.NODE_ENV !== 'production'
})
