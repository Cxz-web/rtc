<template>
	<div class="login" ref="login">
		<div class="login__logo"></div>
		<div class="login__wrap"><input type="text" class="login__btn" placeholder="account"  v-model="username"></div>
		<div class="login__wrap"><input type="password" class="login__btn" placeholder="password" v-model="password"></div>
		
		<div class="login__url">
			<el-radio v-model="line" label="2">International Line</el-radio>
			<el-radio v-model="line" label="1">China Line</el-radio>
		</div>
		
		
		<div class="login__url" style="margin-top: 20px;">
			<el-radio v-model="dev" label="2">Formal course</el-radio>
			<el-radio v-model="dev" label="1">Testing course</el-radio>
		</div>
		 
		
		<div class="login__tip" v-if="showLoading">
				<span v-for="(item, index) in tip" class="login__title" :style="`animation-delay: ${index*0.1}s;`">{{item}}</span></div>
		<div class="login__in" @click="login" ref="btn"> <div v-if="!showLoading">SIGN IN</div><div v-else class="login__loading"></div></div>
		
		<div class="login__version">v2.4.0</div>
	</div>
</template>

<script>
	import axios from 'axios'
	import qs from 'qs'
	
	import { mapState, mapActions  } from "vuex"
	
  const { ipcRenderer } = require('electron')
	// const baseUrl = 'http://api.double-teacher-test.cs.dreamdev.cn'
	const baseUrl = 'http://api.double-teacher.dream.cn'
	export default {
		name: 'login-page',
		data() {
			return {
				tip: 'Logging...',
				showLoading: false,
				username: '',
				password: '',
				data: null,
				line: '2',
				dev:  '2'
			}
		},
		
		created() {
			this.getLogin()	
		},
		
		mounted() {
			localStorage.setItem('pushState', false)
			this.$refs.login.classList.add('in')
			
		},
		methods: {
			login() {
				if(this.showLoading) return
				if(!this.username.trim() || !this.password.trim()) return
				this.showLoading = true
				this.$refs.btn.classList.add('login__in--disabled')
				this.request()
			},
			test() {},
			saveLogin() {
				const data = JSON.stringify({
					username: this.username,
					password: this.password
				})
				localStorage.setItem('Readboy_foreign', data)
			},
			
			getLogin() {
				const data = localStorage.getItem('Readboy_foreign')
				if(data) {
					let login = JSON.parse(data)
					this.username = login.username
					this.password = login.password
				}
			},
			
			
			request() {
				let line_url = {} 
				if(this.line === '1') {
					line_url.RTN_URL ='https://rtn.dteacher.readboy.com'
					line_url.API_URL = 'http://api.double-teacher.dream.cn'
					line_url.WS_URL = 'wss://api.dteacher.readboy.com/v2/webapi/roster/connect'
				} else {
					line_url.RTN_URL = 'http://us-east.dteacher.readboy.com/rtn'
					line_url.API_URL = 'http://us-east.dteacher.readboy.com/api'
					line_url.WS_URL = 'ws://us-east.dteacher.readboy.com/api/v2/webapi/roster/connect'
				}
				
				let text = this.dev === '1' ? 'Testing course' : 'Formal course' 
				let courseId = this.dev === '1' ? '01201905061453049367' : '01201905101700563374'
				// 设置环境
				
				if(this.dev === '1') {
					this.$store.dispatch('setEnviroment', 'test')
				} else {
					this.$store.dispatch('setEnviroment', 'formal')
				}
				
				
				let envInfo = {
					text: text,
					courseId: courseId
				}
		
				this.$store.dispatch('setLine', line_url)
				this.$store.dispatch('setEvn', envInfo)
				this.data = {
					username: this.username,
					password: this.password
				}
				
				axios({
					method: 'post',
					url: line_url.API_URL + '/v2/webapi/login',
					data: qs.stringify(this.data)
				}).then(res => {
					this.saveLogin()
					const token = res.data.access_token
					this.$store.dispatch('setToken', token)
					setTimeout(() => {
						this.successful()
					}, 2000)
					
				}).catch(err => {
					this.$refs.btn.classList.remove('login__in--disabled')
					this.showLoading = false
					this.msg()
				})
			},
			
			successful() {
				this.tip = '登录成功'
				this.$refs.login.classList.add('out')
				this.$refs.login.addEventListener('animationend', () => {
					ipcRenderer.send('close-login', true)
				})	
			},
			
			msg() {
				const n = new Notification('读书郎提示你', {
					body: '账号密码错误，请重新输入',
					tag: 'Readyboy',
					icon: require('../assets/tip.png'),
					timestamp: 2000
					});
				
			},
			
// 			getToken(token) {
// 				let key = "4fbfc9b4d58838f1757b68c8eff5b5564ba2c7fb"
// 				let query = "";
// 				
// 				let keys = Object.keys(this.data).sort();
// 				keys.forEach((it, index) => {
// 					if (!Object.is(index, 0)) {
// 						query += "&"
// 					}
// 					query += `${encodeURIComponent(it)}=${encodeURIComponent(data[it])}`
// 				})
// 				query = query.replace(new RegExp("%20", 'g'), "+");
// 				let MD5data = md5(query + key);
// 				console.log(`4G:${MD5data}`)
// 				
// 				
// 			}
			
		}
	}
</script>

<style scoped>
	.login {
		width: 100%;
		height: 100%;
		background-image: url(../assets/bac.jpg);
		background-repeat: no-repeat;
		background-size: cover;
		background-position: center center;
		display: flex;
		align-items: center;
		flex-direction: column;
		box-sizing: border-box;
		padding-top: 60px;
		will-change: transform; 
	}

	.login__logo {
		width: 84px;
		height: 84px;
		background-image: url(../assets/timg.jpg);
		border-radius: 50%;
		background-position: center;
		background-repeat: no-repeat;
		background-size: cover;
		opacity: 0.9;
		box-shadow: 0px 0px 5px 2px rgba(255, 255, 255, 0.7);
		margin-bottom: 30px;
		cursor: pointer;
	}

	.login__logo:hover {
		opacity: 1;
	}


	.login__btn {
		-webkit-app-region: no-drag;
		width: 290px;
		height: 40px;
		outline: none;
		border-radius: 30px;
		background-color: rgba(255, 255, 255, 0.2);
		-webkit-appearance: none;
		border: none;
		box-shadow: 0px 0px 26px rgba(255, 255, 255, 0.4);
		margin-bottom: 25px;
		text-indent: 16px;
		color: white;
		font-size: 20px;
		border: 2px solid rgba(255, 255, 255, 0.8);
	}

	.login__btn:focus {
		outline: none;
	}

	.login__in {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 290px;
		height: 50px;
		background-color: darkorange;
		color: white;
		border-radius: 13px;
		text-align: center;
		font-size: 22px;
		line-height: 50px;
		color: white;
		cursor: pointer;
		user-select: none;
		letter-spacing: 1px;
		font-weight: bold;
		margin-top: 180px;
	}
	
	.login__in--disabled{
		cursor: not-allowed;
		background-color: deeppink;
	}
	
	.login__loading{
		background-image: url(../assets/loading-spinning-bubbles.svg);
		width: 34px;
		height: 34px;
		background-repeat: no-repeat;
		background-size: contain;
		background-position: center;
	}

	.login__in:active {
		background-color: firebrick;
	}
	
	.in{
		animation: in ease-in-out forwards .8s;
	}
	
	@keyframes in{
		from{
			transform: translate(-10px, -10px);
			opacity: 0;
		}
		to{
			transform: translate(0, 0);
			opacity: 1;
		}
	}
	
	
	
	.out{
		animation: leave ease-in-out forwards .8s;
	}
	
	@keyframes  leave{
		to{
			opacity: 1;
			transform: scale(0);
		}
	}
	
	.login__tip{
		color: white;
		height: 30px;
		font-size: 24px;
		letter-spacing: 3px;
		margin-top: 24px;
		display: flex;
		position: absolute;
		top: 430px;
		
		animation: tipOut ease-out .3s ;
	}
	
	@keyframes tipOut{
		from{
			opacity: 0;
		}
		to{
			opacity: 1;
		}
	}
	
	.login__title{
		animation: moveTitle ease-in-out   alternate .4s infinite;
		transform: translate(0, 0);
		text-shadow: 1px 1px 20px #FFffff;
		font-weight: bolder;
		user-select: none;
	}
	
	.login__version{
		position: absolute;
		right: 10px;
		bottom: 4px;
		color: white;
		font-size: 14px;
	}
	
	@keyframes moveTitle{
		to{
			transform: translate(0, -10px);
			
		}
	}
	
	.login__url {
		color: white;
	}
	
	

</style>
