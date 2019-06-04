import Vue from 'vue'
import Vuex from 'vuex'

import {
	createPersistedState,
	createSharedMutations
} from 'vuex-electron'

// import modules from './modules'

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		token: '',
		lessonId: '',
		push: false,
		rtnUrl: 'http://us-east.dteacher.readboy.com/rtn',
		apiUrl: 'http://us-east.dteacher.readboy.com/api',
		lessonName: '',
		envInfo: {}
	},
	actions: {
		setToken(store, token) {
			store.commit("SET_MAIN_TOKEN", token)
		},
		setLessonId(store, id) {
			store.commit("SET_MAIN_LESSONID", id)
		},
		setPush(store, value) {
			store.commit("SET_PUSH_STATE", value)
		},
		setLine(store, obj) {
			store.commit("SET_Line_URL", obj)
		},
		setLessonName(store, lessonName) {
			store.commit("SET_LESSON_NAME", lessonName)
		},
		setEvn(store, info) {
			store.commit("SET_EVN", info)
		}

	},

	mutations: {
		SET_MAIN_TOKEN(state, token) {
			state.token = token
		},
		SET_MAIN_LESSONID(state, id) {
			state.lessonId = id
		},
		SET_PUSH_STATE(state, value) {
			state.push = value
		},
		SET_Line_URL(state, obj) {
			state.rtnUrl =	obj.RTN_URL
			state.apiUrl = 	obj.API_URL
		},
		SET_LESSON_NAME(state, lessonName) {
			state.lessonName = 	lessonName
		},
		SET_EVN(state, info) {
			state.envInfo = info
		}
	},

	plugins: [
		createPersistedState()
		// createSharedMutations()
	],
	strict: process.env.NODE_ENV !== 'production'
})
