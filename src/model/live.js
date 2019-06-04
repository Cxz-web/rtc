import axios from 'axios'


class Live {
	constructor(url) {
		this.baseURL = url
	}
	
	_request(options) {
		let url = this.baseURL + '/' + options.url
		let res = null
		if (options.method === 'get') {
			res = axios({
				method: options.method,
				params: options.params,
				url: url
			})
		} else {
			res = axios({
				method: options.method,
				params: options.params,
				url: url
			})
		}
		return res
	}
	
	getRoomToken(roomName, userId) {
		let options = {
			url: `v1/rtn/rooms/${roomName}/users/admin/token`,
			method: 'get',
			params: {
				permission: 'admin'
			}
		}
		return this._request(options)
	}
	
	uploadRecord(roomName, userId, action) {
		let options = {
			url: `v1/rtn/rooms/${roomName}/users/${userId}/record`,
			method: 'post',
			params: {
				record_action: action,
				created_time: Math.ceil(new Date().getTime()/1000)
			}
		}
		return this._request(options)
	}
	
	changeUser(roomName, userId, action) {
		let options = {
			url: `v1/rtn/rooms/${roomName}/admin`,
			method: 'put',
			params: {
				action: action,
				to_user: userId
			}
		}
		return this._request(options)
	}
	
}

export default Live
