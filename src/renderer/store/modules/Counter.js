const state = {
  token: ''
}

const mutations = {
	SET_MAIN_TOKEN (state, token) {
		state.token = token
	}
}

const actions = {
  setToken ({ commit }, token) {
    // do something async
		console.log(token)
		return new Promise((resolve, reject) => {
			commit('SET_MAIN_TOKEN', token)
			resolve()
		})
    
  }
}

export default {
  state,
  mutations,
  actions
}
