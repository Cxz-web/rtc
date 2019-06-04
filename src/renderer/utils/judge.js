import { Message } from 'element-ui'

class JudgeState {
	constructor() {
		this.pass = true
		this.errorMessage = '通过校验' 
	}
	
	
	initState() {
		this.pass = true
		this.errorMessage = '通过校验'
		return this
	}
	
	
	// 20s交互操作等待时间
	isTimeUp(state) {
		if(!this.pass) return this
		this.pass = state  
		this.errorMessage = state ? '通过时间校验' : 'Operation is allowed after 20 seconds.'
		return this
	}
	
	// 在线人数判断
	isHasStudents(num) {
		if(!this.pass) return this
		this.pass = parseInt(num) > 0 ? true : false
		this.errorMessage = this.pass ? '通过人数校验' : 'No students online, please try again later.'
		return this
	}
	
	// 是否在连麦
	isVideoCall( connect ) {
		if(!this.pass) return this
		this.pass = parseInt(connect)  === 1 ? false : true
		this.errorMessage = this.pass ? '通过人数校验' : 'Please close the video call before other operating!'
		return this
	}
	
	// 红包是否发满
	isEngough(state) {
		if(!this.pass) return this
		this.pass = state
		this.errorMessage = this.pass ? '通过人数校验' : 'You can only give out 5 red packets at most.'
		return this
	}
	
	// 是否在发红包
	isPacket(connect) {
		if(!this.pass) return this
		this.pass = parseInt(connect)  === 1 ? false : true
		this.errorMessage = this.pass ? '通过人数校验' : 'Please close the red packer activity before other operating!'
		return this
	}
	
	// 校验结果
	judgeRestult() {
		if( !this.pass ){
			Message({
				type: 'error',
				message: this.errorMessage
			})
		}
		return this.pass
	}
	

}

export default JudgeState