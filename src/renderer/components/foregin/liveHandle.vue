<template>
	<div class="handle">
		
		<div class="handle__wrap">
			<!-- <div class="handle__move" ref="move"></div> -->
			<div class="handle__box">
				<div class="handle__open"><span>Open Room</span><div class="handle__btn" @click="openTip(roomTip, change, 'btn1_type', 0, $event)" ref="btn1"></div></div>
				<div class="handle__flow"><span>Push Flow</span><div class="handle__btn" @click="openTip(flowTip, change, 'btn2_type', 1, $event)" ref="btn2"></div></div>
			</div>
			<div class="handle__content">
				<div class="content__operation">
					<!-- <div class="content__btn">Red Packet</div>
					<div class="content__btn">Raise hands</div>
					<div class="content__btn">Options</div>
					<div class="content__btn" >Questions</div> -->
					<div class="content__btn" @click="openTip('Confirm video call?', connectRtn)" :class="{'content__btn--active': isConnected === 1}">Video Call</div>
				</div>
				<div class="content__info"></div>
			</div>
			<div class="handle__send">
				<input type="text" class="send__content">
				<div class="send__btn">Send</div>
			</div>
		</div>
	</div>
</template>

<script>
	import axios from 'axios'
	import qs from 'qs'
	
	const baseUrl = 'http://api.double-teacher-test.cs.dreamdev.cn'
	export default {
		name: 'live-handle',
		data() {
			return {
				lessonid: '01201903181114562641',
				TOKEN: '',
				interactiveState: null, // 交互状态
				liveInfo: null, // 直播信息
				liveState: null ,// 直播的状态
				liveBtnState: null ,// 按钮状态 
				btn1_type: 1, // 默认关闭
				btn2_type: 1, // 默认关闭
				enable: true,
				connectBtn: true, // 是都禁用rtn按钮
				isConnected: 0, // 按钮状态
				applyId: null // 连麦id
			}
		},
		created() {
			this.TOKEN = this.$store.state.token
			this.lessonid = this.$store.state.lessonId
		},
		
		computed: {
			roomTip() {
				return this.btn1_type === 0 ? 'Confirm close room?' : 'Confirm open room?'
			},
			flowTip() {
				return this.btn1_type === 0 ? 'Stop pushing flow?' : 'Confirm pushing flow?'
			}
		},
		
		
		mounted() {
			this.getInitState()
		},
		
		methods: {
			getInitState() {
				const url = baseUrl + '/v2/webapi/live/state'
				this._get(url, {lessonid: '01201903181114562641'}).then((res) => {
					const data = res.data
					this.interactiveState = data.interactive_state
					this.liveInfo = data.live_info
					this.liveState = data.live_state
					this.liveBtnState = this.liveState.data
					console.log('交互状态', this.interactiveState)
					console.log('直播信息', this.liveInfo)
					console.log('直播状态', this.liveState)
					console.log(this.liveBtnState)
					this.applyId = this.interactiveState.rtn_apply_id // 初始化连麦id 
					this.isConnected = this.interactiveState.rtn_apply_state // 初始化
					this.initLiveBtnState(this.liveBtnState) // 初始化直播和推流的按钮状态
					this.isConnected = this.interactiveState.rtn_apply_state // 初始化连麦按钮状态
				})
			},
			
			connectRtn() {
				this.connectBtn = false
				const state = this.isConnected === 0 
				
				if(state) {
					const url = baseUrl + `/v2/webapi/apply/publish`
					this._post(url, {lesson_id: this.lessonid}).then(res => {
						this.applyId = res.data.apply.apply_id
						this.connectBtn = true
						this.isConnected = this.isConnected === 0 ? 1 : 0
					})
				} else {
					const url = baseUrl + `/v2/webapi/apply/close`
					this._post(url, {lesson_id: this.lessonid, apply_id: this.applyId}).then(res => {
						this.connectBtn = true
						this.isConnected = this.isConnected === 0 ? 1 : 0
					})
				}
	
			},
			
			initLiveBtnState(state) {
				console.log(this.$refs)
				if(state[0].isopen)  {
					this.$refs.btn1.classList.add('handle__btn--active')
					this.btn1_type = 0
				}
				if(state[1].isopen) {
					this.$refs.btn2.classList.add('handle__btn--active')
					this.btn2_type = 0
				}
			},
			
		
			
			change(which, id, e) {
				if(!this.enable) return
				this.enable = false
				console.log(this[which])
				const url = baseUrl + '/v2/webapi/roster/controlstream'
				
				const data = {
					lessonid: this.lessonid,
					id: 1,
					type: this[which] === 1 ? 0 : 1
				}
				this._post(url, data).then((res) => {
					this.enable = true
					this[which] = this[which] === 1 ? 0 : 1
					e.target.classList.toggle('handle__btn--active')
				}).catch( (err) => {
					this.enable = true
				}) 
			},
			
			openTip(msg, fn, which, id, e) {
				this.$confirm(msg, 'Warning', {
						confirmButtonText: 'OK',
						cancelButtonText: 'Cancel',
						type: 'warning',
						center: true
				}).then(() => {
					if(which) {
						fn(which, id, e)
					}else {
						fn()
					}
					
				}).catch(() => {
					
				});
			},
    
//  this.$message({
//  	type: 'info',
//  	message: '已取消删除'
//  });
// 		
	
// 	this.$message({
// 		type: 'success',
// 		message: '删除成功!'
// 	});
			
			
			_post(url, data) {
				let options = {
					method: 'post',
					url,
					data,
					transformRequest: [function (data) {
					  return qs.stringify(data)
					}],
					headers: {'Authorization': this.TOKEN}
				}
				return axios(options)
			},
			
			_get(url, params) {
				let options = {
					method: 'get',
					url,
					params,
					headers: {'Authorization': this.TOKEN}
				}
				return axios(options)
			}
			
		}
	}
</script>

<style scoped>
	.handle{
		display: flex;
		justify-content: center;
		width: 100%;
		height: 100%;
		box-sizing: border-box;
		padding: 10px;
		animation: handle ease-in .3s forwards;
		user-select: none;
		
	}
	
	@keyframes  handle{
		from{
			opacity: 0.4;
			transform: scale(0);
		}
		to{
			opacity: 1;
			transform: scale(1);
		}
	}
	
	.handle__wrap{
		background-color: #efefef;
		width: 100%;
		height: 100%;
		border-radius: 10px;
		display: flex;
		flex-direction: column;
		padding-bottom: 10px;
		position: relative;
		box-sizing: border-box;
		padding-top: 10px;
	}
	
	.handle__box{
		display: flex;
		height: 40px;
		font-size: 18px;
		line-height: 40px;
		padding-left: 14px;
		align-items: center;
		
	}
	
	.handle__open{
		display: flex;
		align-items: center;
	}
	
	.handle__flow{
		display: flex;
		align-items: center;
		margin-left: 50px;
	}
	
	.handle__btn{
		height: 20px;
		width: 45px;
		border-radius: 20px;
		background-color: dimgray;
		margin-left: 10px;
		cursor: pointer;
		background-image: url(asserts/ios3.svg);
		background-size: 20px 20px;
		background-position: left center;
		background-repeat:no-repeat ;
		transition: all ease-in 200ms;
		
	}
	
	.handle__btn--active{
		animation: rightMove ease-in 200ms forwards;
	}
	
	@keyframes rightMove{
		to{
			background-color: rgb(48,217,76);
			background-position: right center;
		}
	}
	
	.handle__content{
		padding-left: 14px;
		padding-right: 14px;
		display: flex;
		flex: 1;
		padding-bottom: 10px;
	}
	
	.content__operation{
		width: 140px;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-right: 20px;
	}
	
	
	.content__btn{
		width: 130px;
		line-height: 35px;
		border-radius: 10px;
		border: 1px solid black;
		margin-bottom: 16px;
		color: black;
		font-weight: bold;
		cursor: pointer;
	}
	
	.content__btn--active {
		background-color: darkorange;
		color: white;
		border: 1px solid navajowhite;
	}
	
	.content__info{
		flex: 1;
		background-color: white;
		border: 1px solid black;
	}
	
	.handle__send{
		height: 50px;
		display: flex;
		padding-left: 10px;
		align-items: center;
		justify-content: space-between;
		padding-right: 20px;
	}
	.send__content{
		width: 80%;
		height: 20px;
	}
	
	.send__btn{
		height: 26px;
		text-align: center;
		background-color: rgb(0,153,255);
		width: 60px;
		line-height: 26px;
		color: white;
		cursor: pointer;
		user-select: none;
	}
	
	.handle__move{
		-webkit-app-region: drag;
		
		z-index: 2000;
		width: 100%;
		height: 20px;
		top: 10px;
		background-color: green;
	}
</style>


