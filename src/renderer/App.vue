<template>
	<div id="app">
		<div class="app__move" v-if="canDrag"></div>
		<div class="app__wrap no-drag" ref="move" :class="{'app__wrap--move': !showMove}" >
			<div class="app__btn btn2" @click="handle('small')"></div>
			<div class="app__btn btn1" @click="handle('close')"></div>
			<!-- <div class="app__btn btn3" @click="handle('big')"></div> -->
		</div>
		<router-view></router-view>
	</div>
</template>

<script>
	const { ipcRenderer } = require('electron')
	const  os  = require('os')
	// const getMac = require('getmac')
	export default {
		name: 'my-project',
		data() {
			return {
				win: '',
				macAddress: null,
				pushState: false
			}
		},
		computed: {
			canDrag() {
				const path = this.$router.currentRoute.fullPath
				return path.includes('edit')  ? false : true 
			},
			showMove() {
				const path = this.$router.currentRoute.fullPath
				return path.includes('liveHandle')  ? false : true 
			}
		},
		created() {

			if (window.location.href.includes('myLive')) {
				this.$router.push('/live/lessonMain')
	
			}
			if (window.location.href.includes('myHandle')) {
				this.$router.push('/live/liveHandle')
			}
			
			this.judegeWin()
			
			
		},
		
		
	

		methods: {
			
			judegeWin() {
				if (window.location.href.includes('liveHandle')) {
					this.win = 'handle'
				} else if (window.location.href.includes('live')) {
					this.win = 'live'
				} else {
					this.win = 'login'
				}

			},
			handle(handle) {
				if(handle === 'close') {
					if(this.$route.fullPath.includes('/live/noRtc')) {
						const state = JSON.parse(localStorage.getItem('pushState'))
						if(state) {
							this.$message({
								message: 'Only after closing the room can it be operated.',
								type: 'error'
							})
							return
						}
						ipcRenderer.send('system-event', {
							win: 'handle',
							handle: 'close'
						})
						this.$router.push('/live/lessonMain')
						return 
					}
				}
				
				ipcRenderer.send('system-event', {
					win: this.win,
					handle: handle
				})
			},
			
			
			verifyDeviceAddress() {
				// let networkInterfaces = os.networkInterfaces()
				getMac.getMac((err, macAddress) => {
					if (err)  throw err
					this.macAddress = macAddress
					if(false) {
						ipcRenderer.send('not-certified')
					}
				})
			}
		}
	}
</script>

<style>
	@import url("../animate.min.css");
	body::-webkit-scrollbar {
		display: none;
	}

	body,
	html {
		width: 100%;
		height: 100%;
		padding: 0px;
		margin: 0px;

	}


	#app {
		text-align: center;
		width: 100%;
		height: 100%;
		box-sizing: border-box;
	}

	.app__move {
		height: 40px;
		position: fixed;
		top: 0px;
		left: 0px;
		width: 100%;
		-webkit-app-region: drag;
		opacity: 0;
		z-index: 999;


	}

	.app__wrap {
		position: fixed;
		top: 4px;
		right: 2px;
		z-index: 99999;
		display: flex;
		flex-direction: row;
		opacity: 0;
		transition: opacity .2s ease-in;
	}
	
	
	.app__wrap--move {
		top: 14px;
		right: 20px;
	}

	.app__btn {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background-color: black;
		margin-left: 8px;
		cursor: pointer;

	}

	.app__wrap:hover {
		opacity: 1;
	}

	.btn1 {
		background-color: #f35a52;
	}

	.btn2 {
		background-color: #f2c231;
	}

	.btn3 {
		background-color: #3bc151;
	}
	

	
	@keyframes leaveOut{
		from{
			transform: scale(1);
			opacity: 1;
		}
		to{
			transform: scale(0);
			opacity: 0.6;
		}
	}
	
	.other__live {
		animation: ohterLive 1.3s ease-in-out forwards;
		transform-origin: top left;
	}
	.my__live{
		animation: ohterLive 1.3s ease-in-out forwards;
		transform-origin: center center;
	}
	
	@keyframes ohterLive{
		from{
			transform: scale(0);
		}
		to{
			transform: scale(1);
			opacity: 1;
		}
	}


	/* CSS */
</style>
