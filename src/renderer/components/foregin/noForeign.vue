<template>
	<div class="foreign" style="background-image: linear-gradient(90deg, #74EBD5 0%, #9FACE6 100%);" ref="foreign">
		
		<div class="foreign__logo"></div>
		
		<!-- 本地摄像头 -->
		<div class="foreign__local" ref="local" id="local"></div>
		
		<!-- 连麦摄像头 -->
		<div class="video__box">
			<div class="other__box" ref="other" id="other"></div>
		</div>
		
		<div class="foreign__audio" ref="audio"></div>
		
			
		<div class="handle__video">
			<div class="foreign__operation" @click="openHandle" v-show="showHandle"></div>
			<div class="foreign__audio foreign__audio--none" @click="testAudio" v-show="showHandle" ref="audio"></div>
		</div>
		
		
		<div class="autio" id="audio"></div>
		
		
	</div>
</template>

<script>
	
	import * as QNRTC from "pili-rtc-web"
	import LiveModel from '../../../model/live.js'
	import { mapState } from "vuex"
	
	const {	ipcRenderer, desktopCapturer } = require('electron')
	
	let loading = null
	let self_option
	let myRTC
	

	export default {
		name: 'new-rtc',
		data() {
			return {
				ppt_url: null,
				roomId: '',
				live: null,
				audioId: null,
				videoId: null,
				index: 4,
				currentColor: null,
				readyPen: false,
				readyEraser: false,
				showFull: true,
				isFull: false,
				camera: false,
				otherTrackList: null,
				isClose: false,
				tracks: null,
				showHandle: false,
				audio: null,
				statsId: null
			}
		},
		
		computed: {
			...mapState(['rtnUrl', 'apiUrl'])
		},
		
		created() {
			console.log('OBS推流')
			history.pushState(null, null, document.URL);
        window.addEventListener('popstate', function () {
            history.pushState(null, null, document.URL);
      });
			QNRTC.log.setLevel("disable")
			this.roomId = this.$route.query.lessonid
			this.$store.dispatch('setLessonId', this.roomId)
		},
		
		mounted() {
			setTimeout(() => {
				this.start()
			}, 1000)
			ipcRenderer.on('current-state', this.pushStateOperation)
		},
		
		beforeDestroy() {
			for (const track of this.tracks) {
				track.release();
			}
			clearInterval(this.statsId)
			myRTC.leaveRoom()
			myRTC = null
			ipcRenderer.removeAllListeners('current-state')
			document.body.onfullscreenchange = null
		},
			
		methods: {
			
			start() {
				console.log('start')
				loading = this.$loading({
				      lock: true,
				      text: 'Opening Camera...',
				      spinner: 'el-icon-loading',
				      background: 'rgba(0, 0, 0, 0.7)'
				})
				
				myRTC = new QNRTC.TrackModeSession()
				this.live = new LiveModel(this.rtnUrl)
				this.openCamera()
				this.getDevice()
			},
			
			// 监听主进程发送过来的发送RTC信令事件
			pushStateOperation(event, value) {
				if(value) {
					this.publish()
				} else {
					this.unpublish()
				}
			},
			
			testAudio() {
				console.log(this.audio.muted)
				let value = this.audio.muted
				if(value) {
					this.$refs.audio.classList.add('foreign__audio--active')
					this.$refs.audio.classList.remove('foreign__audio--none')
				}else{
					this.$refs.audio.classList.remove('foreign__audio--active')
					this.$refs.audio.classList.add('foreign__audio--none')
				}
				this.audio.muted = !value;
			},
			
			openCamera() {
				if(this.camera) {
					return
				}
				console.log(QNRTC.deviceManager.deviceInfo, this.audioId)			
				this.camera = true
				this.joinRoom()
			},
			
			/*
			*	停止推流 
			* 
			**/
			async unpublish() {
				await myRTC.unpublish(this.tracks.map(track => track.info.trackId))
				myRTC.stopMergeStream()
				this.notice('Stop push stream successfully')
			},
			
			// 发布信令到房间
			async publish() {
				if(!this.tracks) return
				await myRTC.publish(this.tracks)
				console.log('发布成功', this.tracks)
				this.notice('push flow successfully')
			},
			
			
			// 系统提示函数
			notice(msg) {
				const dafault_tip = 'Open the camera successfully. If you want to broadcast live, please turn on the push button.'
				const n = new Notification('读书郎提示你', {
					body: msg || dafault_tip,
					tag: 'Readyboy tip',
					icon: require('../../assets/tip.png'),
					timestamp: 3000
				})
			},
			
			// 打开操作面板
			openHandle() {
				ipcRenderer.send('open-handle', this.roomId)
			},
			
			// 获取音频摄像头设备信息
			getDevice() {
				QNRTC.deviceManager.on("device-add", (res) => {
					console.log('插入新设备', res)
					this.audioId = res.deviceId
				})
			},
			
			
			// 加入RTC房间
			async joinRoom() {
				// 获取token
				const res = await this.live.getRoomToken(this.roomId, 'admin')
				const token = res.data.room_token
				
				// 加入房间
				await myRTC.joinRoomWithToken(token)
				
				// 订阅连麦用户事件
				myRTC.on("track-add", trackInfoList => {
					this.otherTrackList = trackInfoList.map(info => info.trackId)
					console.log("new trackInfo", trackInfoList);
					this.addTrack(trackInfoList)	
					
				});
				
				// 订阅连麦用户退出事件
				myRTC.on("track-remove", async trackInfoList => {		
					const list = trackInfoList.map(info => info.trackId)
					await myRTC.unsubscribe(list);
					console.log('取消订阅成功')
					
				});
					
		
				// 开启本地摄像头
				const localTracks = await QNRTC.deviceManager.getLocalTracks({
					audio: {
						enabled: true,
						tag: "audio",
					},
					video: {
						enabled: true,
						tag: "video",
						bitrate: 1200,
						width: 1280,
						height: 720
					}
				})
				let localDom = document.getElementById('local')
				let localAudio = document.getElementById('audio')
				this.notice()
				localTracks.forEach((item) => {
					if(item.info.tag === 'video') {
						item.play(localDom)
						let myVideo =  localDom.getElementsByTagName('video')[0]
						myVideo.style = 'width:100%;height:100%;will-change: transform;object-fit: cover;transform: scale(0);opacity: 0.6;'
						setTimeout(() => {
							myVideo.classList.add('my__live')
							loading.close()
						}, 2000)
					
					}else if(item.info.tag === 'audio') {
						item.play(localAudio)
						this.audio = localAudio.getElementsByTagName('audio')[0]
						this.audio.muted = true;
					}
					
					item.setMaster(true)
				})
				this.showHandle = true
				this.tracks = localTracks
			},
			
			async addTrack(trackInfoList) {
				const tracks = await myRTC.subscribe(trackInfoList.map(info => info.trackId))
				var track
				for(track of tracks) {
					if(track.info.kind === 'video') {
						track.play(this.$refs.other)
						let videos = this.$refs.other.getElementsByTagName('video')
						for(var item of videos) {
							item.style = "width: 250px;height: 190px;position: relative;transform: scale(0);opacity: 0.6;width:100%;height:100%;will-change: transform;"
							setTimeout(() => {
								item.classList.add('other__live')
							}, 2000)
						}
					} else if(track.info.kind === 'audio') {
						track.play(this.$refs.audio)
					}
				}
			}
		}
	}
</script>

<style scoped>
	.foreign {
		transform: translateZ(0);
		width: 100%;
		height: 100%;
		position: relative;
		animation: foreIn ease-out forwards  1.4s;
		overflow: hidden;
		will-change: transform; 
	}
	
	.myFrame{
		user-select: none;
	}
	
	@keyframes foreIn{
		from{
			transform: scale(0) translateZ(0);
			opacity: 0.6;
		}
		
		to{
			transform: scale(1.0) translateZ(0);
			opacity: 1;
		}
	}
	
	.foreign__ppt{
		width: calc(100% + 2px);
		height: calc(100% + 2px);
		position: absolute;
		left: -1px;
		top: -1px;
		user-select: none;
		
	}
	
	.foreign_btn{
		position: fixed;
		bottom: 20px;
		width: 200px;
		height: 40px;
		background-color: #F06015;
		color: white;
		border-radius: 20px;
		font-size: 24px;
		line-height: 36px;
		letter-spacing: 1px;
		left: 50%;
		margin-left: -100px;
		cursor: pointer;
	}
	
	
	
	.video__box {
		width: 300px;
		height: 500px;
		position: absolute;
		left: 0px;
		top: 0px;
		display: flex;
		flex-direction: column;
		z-index: 99999;
	}
	
	.foreign__local {
		width: 100%;
		height: 100%;
		position: fixed;
		left: 0px;
		top: 0px;
		
	}
	
	
	.other__box{
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: flex-start;
		position: relative;
	
	}
	.other__box::-webkit-scrollbar {
		display: none;
	}
	
	.other__box .other__video {
		
		width: 300px;
		height: 228px;
		margin-bottom: 7px;
	}
	

	
	
	iframe{
		display: block;
	}
	
	.ppt__box{
		height: 22px;
		display: flex;
		justify-content: space-around;
		position: fixed;
		bottom: 2px;
		right: 400px;
		align-items: center;
		z-index: 999;
	}
	
	.btn {
		margin-right: 10px;
		cursor: pointer;
		color: white;
		border-radius: 50%;
		padding: 2px;
		
	}
	
	.current__bac {
		background-color: #800080;
	}
	
	.btn:active {
		color: #FF0000;
	}
	
	.ppt__ben{
		position: relative;
	}
	
	.color__box{
		width: 70px;
		height: 114px;
		display: flex;
		justify-content: space-around;
		position: absolute;
		background-color: white;
		top: -120px;
		left: -60px;
		flex-wrap: wrap;
		align-items: center;
		z-index: 200;
	}
	
	.color__btn{
		box-sizing: border-box;
		
		width: 24px;
		height: 24px;
	}
	
	.current__btn {
		border: 2px dashed   #006400;
	}
	
	.test{
		width: 200px;
		height: 200px;
		position: fixed;
		left: 0px;
		top: 0px;
		z-index: 1000;
		background-color: white;
	}
	
	.paint {
		width: 100%;
		height: calc(100% - 25px);
		z-index: 50;
		position: absolute;
		left: 0px;
		top: 0px;	
	}
	
	.foreign__full{
		width: 180px;
		height: 30px;
		position: absolute;
		left: 20px;
		top: 20px;
		color: white;
		background-color: #D2691E;
		border: 2px solid white;
		font-size: 20px;
		line-height: 30px;
		letter-spacing: 1px;
		border-radius: 20px;
		animation: changColor ease-in 1.2s alternate infinite;
		cursor: pointer;
		z-index: 999;
	}
	
	@keyframes changColor{
		from{
			background-color: orangered;
		}
		to{
			background-color:   #FFC0CB;
		}
	}
	
	.foreign__operation{
		width: 16px;
		height: 16px;
		background-image: url(asserts/handle.svg);
		background-size: cover;
		background-repeat: no-repeat;
		background-position: center center;
		cursor: pointer;
		margin-left: 10px;
		margin-right: 20px;
		
		
	}
	
	.handle__video{
		position: absolute;
		align-items: flex-end;
		width: 200px;
		height: 100px;
		bottom: 0px;
		left: 0px;
		display: flex;
		padding-bottom: 3px;
		opacity: 0;
		z-index: 20000;

	}
	
	.handle__video:hover {
		opacity: 1;
	}
	
	.foreign__audio{
		
		width: 18px;
		height: 18px;
		background-size: cover;
		background-repeat: no-repeat;
		background-position: center center;
		cursor: pointer;
		transition: transform .1s linear;
	}
	
	
	
	.foreign__camera{
		position: absolute;
		width: 18px;
		height: 18px;
		bottom: 4px;
		left: 140px;
		background-image: url(asserts/Camera2.svg);
		background-size: cover;
		background-repeat: no-repeat;
		background-position: center center;
		cursor: pointer;
	}
	
	.foreign__camera:active {
		background-image: url(asserts/Camera3.svg);
	}
	
	.foreign__operation:active {
		background-image: url(asserts/handle1.svg);
	}
	
	.foreign__shade {
		background-color: #444444;
		height: 18px;
		width: 200px;
		position: fixed;
		z-index: 9999;
		right: 2px;
		bottom: 2px;
	}
	
	.test__video {
		position: fixed;
		right: 0px;
		bottom: 0px;
		width: 260px;
		height: 146px;
		background-color: grey;
		z-index: 999;
	}
	
	.audio {
		visibility: hidden;
	}
	
	

.other__close{
		position: absolute;
		right: 6px;
		top: 0px;
		background-image: url(./asserts/close2.svg);
		width: 18px;
		height: 18px;
		background-size: contain;
		background-repeat: no-repeat;
		z-index: 9999;
		cursor: pointer;
		opacity: 0;
		transition: all ease-in .2s; 
		display: none;
	}
	
	.other__close:active {
		background-image: url(./asserts/close3.svg);
	}
	
	.other__box:hover  .other__close{
		opacity: 1;
	}
	
	.other__box video{
		width: 200px;
		height: 170px;
		background-color: white;
	}
	
	
	
	.foreign__audio:active{
		transform: scale(1.2);
	}
	
	.foreign__audio--none {
		background-image: url(asserts/audio_no.svg);
	}
	
	.foreign__audio--active {
		background-image: url(asserts/audio_has.svg);
	}
	
	.autio{
		visibility: hidden;
	}
	
	.foreign__logo{
		position: absolute;
		width: 200px;
		height: 100px;
		background-image: url(asserts/logo.png);
		right: 20px;
		top: 10px;
		z-index: 500;
		background-size: contain;
		background-repeat: no-repeat;
	}
	
</style>
