<template>
	<div class="handle">
		
		<div class="handle__wrap">
			<!-- <div class="handle__move" ref="move"></div> -->
			<div class="handle__name">{{ lessonName }}</div>
			<div class="handle__dev">( {{ envInfo.text }} )</div>
			<div class="handle__box">
				<div class="handle__open"><span>Open Room</span><div class="handle__btn" @click="openTip(roomTip, change, 'btn1_type', 0, $event)" ref="btn1"></div></div>
				<div class="handle__flow"><span>Push stream</span><div class="handle__btn" @click="openTip(flowTip, change, 'btn2_type', 1, $event)" ref="btn2"></div></div>
			</div>
			<div class="handle__content">
				<div class="content__operation">
					<div class="content__btn" @click="openTip(packetBtnTip, packetBtn)" :class="{'content__btn--active': isGivingPacket === 1}">{{ btn1Tip }}&nbsp;{{packetNum}}/{{packetLimit}}</div>
					<div class="video__status" name="bounce">
						<span class="current__color" :class="{'current__color--active': isGivingPacket===1}"></span>
						<span class="current__state">current state :&nbsp;</span>
						<span> {{ packetStatusTip }} </span>
					</div>
					
					<transition name="bounce">
						<div class="join_packet" v-show="packetId"> <span style="font-family: none;font-weight: bold;">{{ receivedPacker }}</span> students have got red packet.</div>
					</transition>
					<div class="content__btn" @click="openTip(videoCallTip, connectRtn)" :class="{'content__btn--active': isConnected === 1}" style="margin-top: 55px;">{{ btn2Tip }}</div>
					<div class="video__status">
						<span class="current__color" :class="{'current__color--active': isConnected===1}"></span>
						<span class="current__state">current state :&nbsp;</span>
						<span> {{ videoStatusTip }} </span>
					</div>
				</div>
				
			</div>
			
		
			<!-- <div class="packet__wrap" v-show="showPacket">
				<div class="packet__box">
					<div class="packet__header"><div class="packet__close" @click="closePacket"></div></div>
					
					<p class="packet__tip" v-else> Start giving out red packets?</p>
					<div class="packet__btn" @click="packetBtn" :class="{'packet__bac': packetBtnTip==='Stop giving out red packets'}">{{ packetBtnTip }}</div>
				</div>
			</div> -->
		
		</div>
	</div>
</template>

<script>
	import axios from 'axios'
	import qs from 'qs'
	import { mapState } from "vuex"
	let indexLoading = null
	const { ipcRenderer } = require('electron')
	// const baseUrl = 'http://api.double-teacher-test.cs.dreamdev.cn'
	const baseUrl = 'http://api.double-teacher.dream.cn'
	let Socket = null;
	// http://us-east.dteacher.readboy.com/api
	// http://us-east.dteacher.readboy.com/rtn
	const stateType = {
		
	}
	
	
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
				applyId: null, // 连麦id
				showPacket: false,
				packetState: 0,
				packetType: 0,
				packetNum: 0,
				packetLimit: 5,
				packetId: null,
				isConnected: 0, // 连麦按钮状态
				receivedPacker: 0,
				totalPacker: 5,
				stateTip: {
					isConnected: 'Stop the video call before you can do anything else!',
					isGivingPacket: 'Stop giving red packets before you can do anything else!'
				},
				packetTip: {
					0: 'No',
					1: 'One',
					2: 'Two',
					3: 'Three',
					4: 'Four',
					5: 'Five'
				},
				currentState: null,
				id: null, // 轮询定时器
				canQuery: true,
				initId: null,
				init: true,
				count: 1,
				canHandle: true
			}
		},
		created() {
			this.TOKEN = this.$store.state.token
			this.lessonid = this.$store.state.lessonId
			this.getInitState()
			// this.webSocket()
		},
		watch: {
			isGivingPacket(newValue) {
				if(newValue === 0) {
					this.showPacket = false
				}
			},
			btn2_type(newValue) {
				const value = newValue === 1 ? false : true
				ipcRenderer.send('push-state', value)
			},
			
			btn1_type(newValue) {
				const value = newValue === 1 ? false : true
				localStorage.setItem('pushState', JSON.stringify(value))
			}
		},
		
		
		
		
		computed: {
			btn1Tip() {
				return !this.packetId ? 'Start red packet?' : 'Stop red packet?'
			},
			
			btn2Tip() {
				return this.isConnected === 0 ? 'Start video call?' : 'Stop video call?'
			},
			
			roomTip() {
				return this.btn1_type === 0 ? 'Confirm close room?' : 'Confirm open room?'
			},
			flowTip() {
				return this.btn2_type === 0 ? 'Stop pushing flow?' : 'Confirm pushing flow?'
			},
			isGivingPacket() {
				return !this.packetId ? 0 : 1
			},
			packetBtnTip() {
				return !this.packetId ? 'Start giving out red packets' : 'Stop giving out red packets'
			},
			
			videoCallTip() {
				return this.isConnected === 0 ? 'Confirm video call' : 'Close video call'
			},
			
			videoStatusTip() {
				return this.isConnected === 0 ? 'Students are prohibited from connecting video.' : ' Waiting for Students to Connect Video.'
			},
			
			packetStatusTip() {
				return this.isGivingPacket === 0 ? 'Red packet activity closed.' : 'Red Pack Activity Opened.'
			},
			
			...mapState(['rtnUrl', 'apiUrl', 'lessonName', 'envInfo'])
			
		},
		
		
		mounted() {
			this.setIntervalInit()
			// this.webSocket()
			indexLoading = this.$loading({
			      lock: true,
			      text: 'waiting...',
			      spinner: 'el-icon-loading',
			      background: 'rgba(0, 0, 0, 0.7)'
			})
		},
		
		methods: {
	
			webSocket() {
				
				let testApi = `ws://us-east.dteacher.readboy.com/api/v2/webapi/roster/connect?lesson_id=${this.lessonid}&token=${this.TOKEN}`
			
				Socket = new WebSocket(testApi)
				Socket.onopen = () => {
					console.log('已创建连接')
				}
				Socket.onmessage = (evt) => {
					let data = JSON.parse(evt.data)
					console.log('收到数据', data)
				}
				Socket.onclose  = (evt) => {
					console.log('关闭')
				}
				Socket.onerror = (msg) => {
					console.log(msg, '错误')
				}
				
				
				
				
			},
			
			
			setHandle() {
				this.canHandle = false
				setTimeout(() => {
					this.canHandle = true
				}, 25000)
			},
			
			
			// 打开红包面板
			openPacketBox() {
				if(this.isConnected === 1) {
					this.$message({
						type: 'error',
						message: 'Video call, no other operation allowed!'
					})
					return
				}
				
				
				if(this.packetNum >= this.packetLimit) {
					this.$message({
						type: 'error',
						message: 'A maximum of five red packet can be handed out per class!'
					})
					return
				}
				
				
				this.showPacket = true
			},
			
			closePacket() {
				this.showPacket = false
			},
			
			beforeDestroy() {
				clearInterval(this.id)
				clearInterval(this.initId)
			},
			
			packetBtn() {
				// 没有发红包的状态
				this.canQuery = true
				if(this.isGivingPacket === 0) {
					this.giveRedPacket()
				} else {
					this.stopRedPacket()
				}
			},
			// 开始发红包
			async giveRedPacket() {
				if(this.isConnected === 1) {
					this.$message({
						type: 'error',
						message: 'Please close the video call  before starting red packet!'
					})
					return
				}
				
				
				if(!this.canHandle) {
					this.$message({
						type: 'error',
						message: 'Operation is allowed after 20 seconds'
					})
					return 
				}
				
				
				this.setHandle()
				
				let loading = this.$loading({
				      lock: true,
				      text: 'waiting...',
				      spinner: 'el-icon-loading',
				      background: 'rgba(0, 0, 0, 0.7)'
				})
				try{
					await this.getStudentNum()
				}catch(e){
					this.$message({
						type: 'error',
						message: 'Netwrok error, please try again'
					})
					loading.close()
					return
				}
				
				
				const url = this.apiUrl + '/v2/webapi/lesson/redpacket/publish'
				this.count = this.count === 0 ? 1 : this.count
				this.receivedPacker = 0
				let params = {
					lesson_id: this.lessonid,
					type: 1,
					total_score: 5 * this.count,
					each_score: 0,
					count: this.count,
				}
				
				this._post(url, params).then((res) => {
					const data = res.data
					loading.close()
					
					if(data.F_responseNo === 10000) {
						this.packetId = data.redpacket_id
						clearInterval(this.id)
						this.id = setInterval(() => {
							this.queryPacket()
						}, 3000)
					}else if(data.F_responseNo === 10114) {
						this.$message({
							type: 'error',
							message: 'The red packets have been handed out！'
						})
					}
					
				}).catch((err) => {
					this.$message({
						type: 'error',
						message: 'Please try again later'
					})
					loading.close()
				})
			},
			
			
			
			// 查询红包情况
			queryPacket() {
				if(!this.canQuery) return
				this.canQuery = false
				const url = this.apiUrl + '/v2/webapi/lesson/redpacket/statistic'
				const params = {
					lesson_id: this.lessonid,
					redpacket_id: this.packetId,
					order_reverse: 0
				}
				this._get(url, params).then((res) => {
					const data = res.data
					this.receivedPacker = data.received_redpacket_num
					this.totalPacker = data.total_redpacket_num
					this.canQuery = true
				})
			},
			
			// 停止分发红包
			stopRedPacket() {
				this.setHandle()
				const url = this.apiUrl + '/v2/webapi/lesson/redpacket/close'
				const params = {
					lesson_id: this.lessonid,
					redpacket_id: this.packetId
				}
				let loading = this.$loading({
				      lock: true,
				      text: 'waiting...',
				      spinner: 'el-icon-loading',
				      background: 'rgba(0, 0, 0, 0.7)'
				})
				
				this._post(url, params).then((res) => {
					this.packetId = null
					loading.close()
					clearInterval(this.id)
				})
			},
			
			getStudentNum() {
				const url = this.apiUrl + '/v2/webapi/roster/online'
				const params = {
					lesson_id: this.lessonid
				} 
				return this._get(url, params).then(res => {
					this.count = res.data.F_online_count
				})
			},
			
			// 初始化状态
			getInitState() {
				if(!this.init) return
				this.init = false
				const url = this.apiUrl + '/v2/webapi/live/state'
				
				this._get(url, {lessonid: this.lessonid}).then((res) => {
					const data = res.data
					this.interactiveState = data.interactive_state
					this.liveInfo = data.live_info
					this.liveState = data.live_state
					this.liveBtnState = this.liveState.data
					// console.log('交互状态', this.interactiveState)
					// console.log('直播信息', this.liveInfo)
					// console.log('直播状态', this.liveState)
					// console.log(this.liveBtnState)
					this.applyId = this.interactiveState.rtn_apply_id // 初始化连麦id 
					this.isConnected = this.interactiveState.rtn_apply_state // 初始化
					this.initLiveBtnState(this.liveBtnState) // 初始化直播和推流的按钮状态
					this.isConnected = this.interactiveState.rtn_apply_state // 初始化连麦按钮状态
					
					// 红包相关
					this.packetState = this.interactiveState.red_packet_state // 红包状态
					this.packetType = this.interactiveState.red_packet_type // 红包类型
					
					
					this.packetNum = this.interactiveState.red_packet_num // 已发红包数量
					this.packetLimit = this.interactiveState.red_packet_limit // 红包限制数量
					this.packetId = this.interactiveState.red_packet_id
					this.init = true
					if( indexLoading ) {
						indexLoading.close()
						indexLoading = null
					}
					
					
				})
			},
			
			setIntervalInit() {
				this.initId = setInterval(() => {
					this.getInitState()
				}, 3000)
			},
			
			// 连麦
			connectRtn() {
				if(this.isGivingPacket === 1) {
					this.$message({
						type: 'error',
						message: 'Please close the red packer activity before video call!'
					})
					return
				}
				
				if(!this.canHandle) {
					this.$message({
						type: 'error',
						message: 'Operation is allowed after 20 seconds'
					})
					return 
				}
				
				
				this.connectBtn = false
				const state = this.isConnected === 0 
				let loading = this.$loading({
				      lock: true,
				      text: 'waiting...',
				      spinner: 'el-icon-loading',
				      background: 'rgba(0, 0, 0, 0.7)'
				})
				
				if(state) {
					
					const url = this.apiUrl + `/v2/webapi/apply/publish`
					this._post(url, {lesson_id: this.lessonid}).then(res => {
						loading.close()
						if(res.data.F_responseNo === 11203) {
							this.$message({
								type: 'error',
								message: 'No student are in the room'
							})
							return 
						}
						this.applyId = res.data.apply.apply_id
						this.connectBtn = true
						this.isConnected = this.isConnected === 0 ? 1 : 0
					}).catch((error) => {
						loading.close()
						this.$message({
							message: 'Network error, Please try again later',
							type: 'error'
						})
					})
				} else {
					const url = this.apiUrl + `/v2/webapi/apply/close`
					this._post(url, {lesson_id: this.lessonid, apply_id: this.applyId}).then(res => {
						loading.close()
						this.connectBtn = true
						this.isConnected = this.isConnected === 0 ? 1 : 0
					}).catch((error) => {
						loading.close()
						this.$message({
							message: 'Network error, Please try again later',
							type: 'error'
						})
					})
				}
	
			},
			
			// 初始化推流， 房间按钮
			initLiveBtnState(state) {
				if(state[0].isopen) {
					this.$refs.btn1.classList.add('handle__btn--active')
					this.btn1_type = 0
				}else{
					this.$refs.btn1.classList.remove('handle__btn--active')
					this.btn1_type = 1
				}
				
				if(state[1].isopen) {
					this.$refs.btn2.classList.add('handle__btn--active')
					this.btn2_type = 0
				}else {
					this.$refs.btn2.classList.remove('handle__btn--active')
					this.btn2_type = 1
				}
			},
			
		
			// 改变开关 
			change(which, id, e) {
				if(!this.enable) return
				console.log(which)
				if(which === 'btn1_type' && this.btn2_type === 0){
					this.$message({
						type: 'error',
						message: 'Please stop the push stream first'
					})
					return
				}
				if(which === 'btn2_type' && this.btn1_type === 1){
					this.$message({
						type: 'error',
						message: 'Please open the room first'
					})
					return
				}
				
				
				this.enable = false
				let loading = this.$loading({
				      lock: true,
				      text: 'waiting...',
				      spinner: 'el-icon-loading',
				      background: 'rgba(0, 0, 0, 0.7)'
				})
				const url = this.apiUrl + '/v2/webapi/roster/controlstream'
				
				const data = {
					lessonid: this.lessonid,
					id: id,
					type: this[which] === 1 ? 0 : 1
				}
				this._post(url, data).then((res) => {
					this.enable = true
					this[which] = this[which] === 1 ? 0 : 1
					e.target.classList.toggle('handle__btn--active')
					loading.close()
				}).catch( (err) => {
					this.enable = true
					loading.close()
					console.log(err.toString())
					if(which === 'btn2_type') {
						if(err.toString().includes('500')) {
							this.btn2_type = this.btn2_type === 0 ? 1 : 0 
							this.$refs.btn2.classList.toggle('handle__btn--active')
							
						}else {
							this.$message({
								type: 'error',
								message: 'Failed, Please try again later'
							})
						}
					} else {
						if(err.toString().includes('500')) {
							this.btn1_type = this.btn1_type === 0 ? 1 : 0 
							this.$refs.btn1.classList.toggle('handle__btn--active')
							
						}else {
							this.$message({
								type: 'error',
								message: 'Failed, Please try again later'
							})
						}
					}
					

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
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
					},
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
		animation: handle ease-in .3s forwards;
		user-select: none;
		will-change: transform;
		
		
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
		background-image: linear-gradient( 135deg, #90F7EC 10%, #32CCBC 100%);
		width: 100%;
		height: 100%;
		border-radius: 10px;
		display: flex;
		flex-direction: column;
		padding-bottom: 10px;
		position: relative;
		box-sizing: border-box;
		font-weight: bold;
		padding-top: 10px;
	}
	
	.handle__name{
		font-size: 24px;
		margin-bottom: 4px;
		color: red;
		
	}
	
	.handle__dev{
		margin-bottom: 10px;
		font-size: 20px;
	}
	
	.handle__box{
		display: flex;
		height: 40px;
		font-size: 18px;
		line-height: 40px;
		padding-left: 14px;
		align-items: center;
		border-bottom: 1px solid white;
		padding-bottom: 10px;
		margin-bottom: 18px;
		
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
		width: 100%;
		display: flex;
		flex-direction: column;
		
	}
	
	
	.content__btn{
		width: 190px;
		line-height: 35px;
		border-radius: 10px;
		margin-bottom: 16px;
		color: black;
		font-weight: bold;
		cursor: pointer;
		background-color: red;
		font-family: none;
		color: white;
	}
	
	.content__btn--active {
		background-color:#49C628;
		color: white;
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
	
	/* 红包面板模块 */
	
	.packet__wrap {
		position: fixed;
		width: calc(100% - 20px);
		height: calc(100% - 20px);
		background-color: rgba(0,0,0,0.3);
		left: 10px;
		top: 10px;
		border-radius: 10px;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	
	.packet__box{
		overflow: hidden;
		width: 400px;
		height: 150px;
		background-color: white;
		border-radius: 5px;
		display: flex;
		align-items: center;
		flex-direction: column;
		box-sizing: border-box;
	}
	
	.packet__btn{
		width: 231px;
		height: 40px;
		border: 1px solid black;
		background-color: gray;
		border-radius: 20px;
		color: white;
		font-weight: bold;
		line-height: 40px;
		cursor: pointer;
	}
	.packet__header{
		background-color: dimgray;
		height: 26px;
		width: 100%;
		display: flex;
		justify-content: flex-end;
		align-items: center;
		padding-right: 10px;
		border-radius: 5px 5px 0 0;
		
	}
	
	.packet__tip {
		line-height: 0px;
		font-size: 20px;
		margin-top: 36px;
		margin-bottom: 28px;
	}
	
	.packet__close{
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background-color: #F35A52;
		cursor: pointer;
	}
	
	.packet__bac{
		background-color: dodgerblue;
	}
	
	.video__status{
		text-align: left;
		font-size: 20px;
		padding-left: 10px;
		display: flex;
		align-items: center;
	}
	
	.current__color{
		margin-right: 20px;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: red;
	}
	
	.current__color--active{
		background: #49C628;
	}
	
	.current__state{
		font-weight: bold;
		
	}
	
	.join_packet{
		font-size: 22px;
		color: orangered;
		position: absolute;
		top: 240px;
		left: 180px;
	}
	
	.bounce-enter-active {
		animation: bounce-in .5s;
	}
	.bounce-leave-active {
		animation: bounce-in .5s reverse;
	}
	@keyframes bounce-in {
		0% {
			transform: scale(0);
			opacity: 0;
		}
		50% {
			transform: scale(1.2);
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}
</style>


