<template>
	<div class="foreign" style="background-image: linear-gradient(90deg, #74EBD5 0%, #9FACE6 100%);" ref="foreign">
		
		<div class="foreign__logo"></div>
		
		
		<div class="foreign__local" ref="local" id="local"></div>
		<div class="video__box">
			
			<div class="other__box" ref="other" id="other">
				<div class="other__close" @click="close"></div>
			</div>
		</div>
		
		<div class="foreign__audio" ref="audio"></div>
		
		
		<div class="ppt__box" v-if="false">
			<!-- 画笔 -->
			<div class="iconfont icon-pen btn ppt__ben" @click="openPen" ref="pen">
				<div class="color__box" v-show="showPen" >
					<div class="color__btn" v-for="(item, index) in colorBox" :style="`background-color: ${item}`" @click.stop="selectColor(item)">
					</div>
				</div>
			</div>
			<!-- 橡皮檫 -->
			<div class="iconfont icon-xiangpica btn" :class="{'current__bac': index ===1}" @click="openEraser"></div>
			<!-- 清除所有 -->
			<div class="iconfont icon-qingchuhuancun btn" :class="{'current__bac': index ===2}" @click="openClear"></div>
		</div>
		
		
		<!-- <div class="paint">
			<canvas class="myCanvas" @mousedown="write($event)" ref="myCanvas"></canvas>
		</div> -->
		
		
		<!-- <div class="foreign__camera" @click="openCamera"></div> -->
		
		
		<div class="handle__video">
			<div class="foreign__operation" @click="openHandle" v-show="showHandle"></div>
			<div class="foreign__audio foreign__audio--none" @click="testAudio" v-show="showHandle" ref="audio"></div>
		</div>
		
		<!-- <div class="foreign__shade" v-if="ppt_url"></div> -->
		<div class="autio" id="audio"></div>
		<!-- <video  class="test__video" ref="myVideo" id="my"></video> -->
		
	</div>
</template>

<script>
	import * as QNRTC from "pili-rtc-web"
	import LiveModel from '../../../model/live.js'
	import { mapState } from "vuex"
	let loading = null
	const {	ipcRenderer, desktopCapturer } = require('electron')
	// 01201903181114562641
	// 01201901151300405631
	export default {
		name: 'new-rtc',
		data() {
			return {
				ppt_url: null,
				myRTC: null,
				roomId: '01201905061453289399',
				live: null,
				audioId: null,
				videoId: null,
				colorBox: [
					'#000000',
					'#d81e06',
					'#0622d8',
					'#d806a5',
					'#1296db',
					'#f4ea2a'
				],
				showPen: false,
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
				audio: null
			}
		},
		
		created() {
			this.roomId = this.$route.query.lessonid
			this.$store.dispatch('setLessonId', this.roomId)
		},
		
		computed: {
			...mapState(['rtnUrl', 'apiUrl'])
		},
		
		mounted() {
			setTimeout(() => {
				this.start()
			}, 1000)
			ipcRenderer.on('current-state', this.pushStateOperation)
			
			
			// setTimeout(() => {
			// 	this.$refs.myCanvas.width = document.body.clientWidth;
			// 	this.$refs.myCanvas.height = document.body.clientHeight - 25;
			// }, 3000)
			
			
			console.log(QNRTC.deviceManager.deviceInfo)
			
// 			QNRTC.deviceManager.deviceInfo.forEach((item) => {
// 				if(item.kind === 'videoinput') {
// 					this.videoId = item.deviceId
// 				}
// 				if(item.kind === 'audioinput' && item.deviceId != 'default') {
// 					this.audioId = item.deviceId
// 				}
// 			})
// 			console.log(11113, this.videoId, this.audioId)
			// this.joinRoom()
		},
		
		beforeDestroy() {
			for (const track of this.tracks) {
				track.release();
			}
			this.myRTC.leaveRoom()
			this.myRTC = null
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
				QNRTC.log.setLevel("disable")
				this.myRTC = new QNRTC.TrackModeSession()
				this.live = new LiveModel(this.rtnUrl)
				this.openCamera()
				this.getDevice()
				
			},
			
			
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
				await this.myRTC.unpublish(this.tracks.map(track => track.info.trackId))
				this.myRTC.stopMergeStream()
				this.notice('Stop push stream successfully')
			},
			
			async publish() {
				if(!this.tracks) return
				// let testTrack = this.tracks.filter(item => {
				// 	return item.info.tag != 'video'
				// }) 
				await this.myRTC.publish(this.tracks)
				let options = []
				
				this.tracks.forEach((item) => {
					if (item.info.tag === 'video-track') {
						let sOpt = {
							trackId: item.info.trackId,
							x: 0,
							y: 0,
							w: 1280,
							h: 720,
							z: 0
						}
						options.push(sOpt)
					} else if(item.info.tag === 'audio'){
						let aOpt = {
							trackId: item.info.trackId
						}
						options.push(aOpt)
					}
				})
				this.myRTC.addMergeStreamTracks(options)
				console.log('发布成功', options , this.tracks)
				this.notice('push flow successfully')
			},
			
			
			mergeStream(addTrack) {
				let options = []
				this.tracks.forEach((item) => {
					if (item.info.tag === 'video-track') {
						let sOpt = {
							trackId: item.info.trackId,
							x: 0,
							y: 0,
							w: 1280,
							h: 720,
							z: 0
						}
						options.push(sOpt)
					} else if(item.info.tag === 'audio'){
						let aOpt = {
							trackId: item.info.trackId
						}
						options.push(aOpt)
					}
				})
				if(addTrack) {
					options.push(addTrack)
				}
				
				this.myRTC.addMergeStreamTracks(options)
			},
			
			
			
			
			notice(msg) {
				const n = new Notification('读书郎提示你', {
					body: msg || 'Open the camera successfully. If you want to broadcast live, please turn on the push button.',
					tag: 'Readyboy tip',
					icon: require('../../assets/tip.png'),
					timestamp: 3000
				});
			},
			
			
			openHandle() {
				ipcRenderer.send('open-handle', this.roomId)
			},
			
			getDeskCapture(qiniuTracks) {
					let that = this
					desktopCapturer.getSources({ types: ['window', 'screen'] }, (error, sources) => {
					  if (error) throw error
					  for (let i = 0; i < sources.length; ++i) {
							if (sources[i].name === 'ReadyBoy') {
								console.log(sources[i])
					      navigator.mediaDevices.getUserMedia({
					        audio: false,
					        video: {
					          mandatory: {
					            chromeMediaSource: 'desktop',
					            chromeMediaSourceId: sources[i].id,
					            minWidth: 1800,
					            maxWidth: 1800,
					            minHeight: 1080,
					            maxHeight: 1080
					          }
					        }
					      }).then((stream) => handleStream(stream))
					        .catch((e) => handleError(e))
					      return
					    }
					  }
					})
					
					async function handleStream (stream) {
						
						// let oVideo = document.getElementById('my')
					 //  oVideo.srcObject = stream
						// console.log(oVideo, stream)
					 //  oVideo.onloadedmetadata = (e) => {oVideo.play();console.log('play')}
						
						let track = stream.getVideoTracks()[0]
						const videoTrack = await QNRTC.createCustomTrack(track, "video-track", 1800)
						// 测试捕获的桌面
						// videoTrack.play(document.getElementById('other'))
						// qiniuTracks.splice(1, 0, videoTrack)
						// videoTrack.setMaster(true)
						qiniuTracks.push(videoTrack)
						that.tracks = qiniuTracks
						that.showHandle = true
					}
					
					function handleError (e) {
					  console.log(e)
					}
			},
			
			
			
			
			
			write(e) {
				console.log(e)
				let canvas = this.$refs.myCanvas
				let ctx = this.$refs.myCanvas.getContext("2d")
			
				if (this.readyEraser) {
					this.$refs.myCanvas.onmousemove = function(e) {
						ctx.clearRect(e.pageX - 5, e.pageY - 5, 20, 20)
					}
					this.$refs.myCanvas.onmouseup = (e) => {
						this.$refs.myCanvas.onmousemove = null;
					}
			
					return
				}
				
				if(!this.readyPen) {
					return
				}
			
				ctx.beginPath()
				ctx.moveTo(e.pageX, e.pageY)
				ctx.lineWidth = '4'
				ctx.strokeStyle = this.currentColor
				this.$refs.myCanvas.onmousemove = function(e) {
					ctx.lineTo(e.pageX, e.pageY)
					ctx.stroke()
					/* src=canvas.toDataURL("image/png") ; */
				}
				this.$refs.myCanvas.onmouseup = (e) => {
					this.$refs.myCanvas.onmousemove = null;
				}
			
			},
			
			selectColor(color) {
				this.$refs.pen.style.backgroundColor = color
				this.currentColor = color
				this.showPen = false
				this.readyPen = true
				this.readyEraser = false
			},
			openClear() {
				let ctx = this.$refs.myCanvas.getContext("2d")
				ctx.clearRect(0, 0, document.body.clientWidth, document.body.clientHeight)
			},
			openEraser() {
				this.$refs.pen.style.backgroundColor = 'rgba(0,0,0,0)'
				this.index = 1
				this.readyEraser = true
			},
			openPen() {
				this.showPen = !this.showPen
				this.index = 0
			},
 			getDevice() {
				QNRTC.deviceManager.on("device-add", (res) => {
					console.log('插入新设备', res)
					this.audioId = res.deviceId
// 					res.forEach((item) => {
// 						if(item.kind === 'audioinput') {
// 							this.audioId = item.deviceId
// 						}
// 						if(item.kind === 'videoinput') {
// 							this.videoId = item.deviceId
// 						}
// 					})
					
				})
			},
			
			async joinRoom() {
				
				// 获取token
				const res = await this.live.getRoomToken(this.roomId, 'admin')
				const token = res.data.room_token
				
				// 加入房间
				await this.myRTC.joinRoomWithToken(token)
				
				
				this.myRTC.on("track-add", trackInfoList => {
					// 房间里有新的 Track 发布
					this.otherTrackList = trackInfoList.map(info => info.trackId)
					console.log("new trackInfo", trackInfoList);
					const n = new Notification('读书郎提示您', {
						body: '有新的小伙伴加入连麦',
						tag: 'Readyboy',
						icon: require('../../assets/tip.png'),
						timestamp: 2000
					});
					let audioTrack = trackInfoList.filter((item) => {
						return item.kind === "audio"
					})
					let opt = {
						trackId: audioTrack[0].trackId
					}
					console.log('音频', audioTrack)
					this.addTrack(trackInfoList)
					this.mergeStream(opt)
				});
				
				this.myRTC.on("track-remove", async trackInfoList => {
					// 房间里有 Track 取消发布
					
					const list = trackInfoList.map(info => info.trackId)
					await this.myRTC.unsubscribe(list);
					this.mergeStream()
					console.log('取消订阅成功')
					
				});
					
				
				
				// 开启本地摄像头
				console.log('open',this.audioId,  this.videoId)
				const localTracks = await QNRTC.deviceManager.getLocalTracks({
					audio: {
						enabled: true,
						tag: "audio",
						
						
					},
					// deviceId: this.audioId
					video: {
						enabled: true,
						tag: "video",
						bitrate: 1800,
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
						// setTimeout(() => {
						// 	loading.close()
						// 	myVideo.classList.add('animated')
						// 	myVideo.classList.add('bounceIn')
						// }, 2000)
						
					}else if(item.info.tag === 'audio') {
						item.play(localAudio)
						this.audio = localAudio.getElementsByTagName('audio')[0]
						this.audio.muted = true;
					}
					
					item.setMaster(true)
				})
				this.getDeskCapture(localTracks)
			},
			
			async addTrack(trackInfoList) {
				const tracks = await this.myRTC.subscribe(trackInfoList.map(info => info.trackId))
				var track
				for(track of tracks) {
					if(track.info.kind === 'video') {
						track.play(this.$refs.other)
						let videos = this.$refs.other.getElementsByTagName('video')
						for(var item of videos) {
							item.style = "width: 250px;height: 190px;position: relative;transform: scale(0);opacity: 0.6;width:100%;height:100%;will-change: transform;"
							// let oDiv = document.createElement('div')
							// oDiv.classList.add('other__close')addTrack
							// item.append(oDiv)
							setTimeout(() => {
								item.classList.add('other__live')
							}, 1000)
						}
					} else if(track.info.kind === 'audio') {
						track.play(this.$refs.audio)
					}
				}
			},
			
			close() {
				if(this.isClose) return
				this.isClose = true
				
				let oVideo = this.$refs.other.getElementsByTagName('video')[0]
				console.log(oVideo)
				if(!oVideo) {
					this.isClose = false
					return
				}
				oVideo.addEventListener('animationend', async () => {
					oVideo.parentNode.removeChild(oVideo)
					if(this.otherTrackList) {
						await this.myRTC.unsubscribe(this.otherTrackList)
						console.log('取消订阅成功, true')
						this.isClose = false
					}
				})
				
				
				
				oVideo.style.animation = 'leaveOut ease-in-out 1s backwards'
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
