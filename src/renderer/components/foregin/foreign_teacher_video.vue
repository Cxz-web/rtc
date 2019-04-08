<template>
	<div class="foreign">
		<div class="foreign__ppt" v-if="ppt_url">
			<iframe :src="ppt_url"  frameborder="0" width="100%" height="100%" ref="iframe" class="myFrame"></iframe>
		</div>
		<!-- <div class="foreign_btn" v-if="!ppt_url" @click="openPPT">open</div> -->
		
		<div class="foreign__local" ref="local" id="local"></div>
		
		<div class="ppt__box">
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
		<div class="paint">
			<canvas class="myCanvas" @mousedown="write($event)" ref="myCanvas"></canvas>
		</div>
		
		
		<div class="foreign__operation" @click="openHandle"></div>
		
	</div>
</template>

<script>
	import * as QNRTC from "pili-rtc-web"
	import LiveModel from '../../../model/live.js'
	const {	ipcRenderer	} = require('electron')
	export default {
		name: 'live-rtc',
		data() {
			return {
				ppt_url: null,
				myRTC: null,
				roomId: '01201901151300405631',
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
				isFull: false
				
			}
		},
		
		
		mounted() {
			this.openPPT()
			
			this.$refs.myCanvas.width = document.body.clientWidth;
			this.$refs.myCanvas.height = document.body.clientHeight - 25;
			QNRTC.log.setLevel("disable")
			this.myRTC = new QNRTC.TrackModeSession()
			this.live = new LiveModel()
			this.getDevice()
			window.onresize = () => {
				this.$refs.myCanvas.width = document.body.clientWidth;
				this.$refs.myCanvas.height = document.body.clientHeight - 25;
			}
			
			// this.joinRoom()
		},
		
		beforeDestory() {
			this.myRTC.leaveRoom()
			document.body.onfullscreenchange = null
		},
		
		methods: {
			
			
			
			
			openHandle() {
				console.log(window.location)
				ipcRenderer.send('open-handle', true)

			},
			
			write(e) {
			
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
					// console.log(src)
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
				QNRTC.deviceManager.on("device-update", (res) => {
					
					res.forEach((item) => {
						if(item.kind === 'audioinput') {
							this.audioId = item.deviceId
						}
						if(item.kind === 'videoinput') {
							this.videoId = item.deviceId
						}
					})
					console.log(123)
					console.log(res,this.audioId, this.videoId)
				})
				
			},
			async joinRoom() {
				
				// 获取token
				const res = await this.live.getRoomToken(this.roomid, 'admin')
				const token = res.data.room_token
				
				// 加入房间
				await this.myRTC.joinRoomWithToken(token)
				
				// 开启本地摄像头
				const localTracks = await QNRTC.deviceManager.getLocalTracks({
					audio: {
						enabled: true,
						tag: "audio",
						deviceId: this.audioId
					},
					
					video: {
						enabled: true,
						tag: "video",
						deviceId: this.videoId
					}
				})
				
				let localDom = document.getElementById('local')
				console.log(localTracks)
				localTracks.forEach((item) => {
					if(item.info.tag === 'video') {
						item.play(localDom)
					}
				})
			},
			a() {
				
			},
			openPPT() {
				this.ppt_url = `https://view.officeapps.live.com/op/embed.aspx?src=https://www.cxzweb.club/api/ppt/111.pptx`
			}
		}
	}
</script>

<style scoped>
	
	
	.foreign {
		width: 100%;
		height: 100%;
		position: relative;
		background-color: black;
		animation: foreIn ease-out forwards  1.4s;
		overflow: hidden;
	}
	
	.myFrame{
		user-select: none;
	}
	
	@keyframes foreIn{
		from{
			transform: scale(0);
			opacity: 0.6;
		}
		
		to{
			transform: scale(1.0);
			opacity: 1;
		}
	}
	
	.foreign__ppt{
		width: 100%;
		height: 100%;
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
	
	.foreign__local{
		width: 250px;
		height: 190px;
		position: absolute;
		right: 0px;
		top: 0px;
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
		position: absolute;
		width: 16px;
		height: 16px;
		bottom: 5px;
		left: 100px;
		background-image: url(asserts/handle.svg);
		background-size: cover;
		background-repeat: no-repeat;
		background-position: center center;
		cursor: pointer;
	}
	
	.foreign__operation:active {
		background-image: url(asserts/handle1.svg);
	}
	
</style>
