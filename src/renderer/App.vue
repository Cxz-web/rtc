<template>
  <div id="app">
	<div class="app__move" ></div>
	<div class="app__wrap no-drag" ref="move">
		<div class="app__btn btn1"></div>
		<div class="app__btn btn2"></div>
		<div class="app__btn btn3"></div>
	</div>
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'my-project',
	created() {
		if(window.location.href.includes('myLive')) {
			this.$router.push('/live/lessonMain')
		}
		if(window.location.href.includes('myHandle')) {
			this.$router.push('/live/liveHandle')
		}
	},
	mounted() {
		this.listen()
	},
	methods: {
		listen() {
			console.log(123)
			
			this.$refs.move.addEventListener('mouseenter', () => {
				console.log(123)
				
			})
		}
	}
  }
</script>

<style>
	body::-webkit-scrollbar{
		display: none;
	}
	
	body , html {
		width: 100%;
		height: 100%;
		padding: 0px;
		margin: 0px;
	
	}
	
	
	#app{
		text-align: center;
		width: 100%;
		height: 100%;
		box-sizing: border-box;
	}
	
	.app__move{
		height: 40px;
		position: fixed;
		top: 0px;
		left: 0px;
		width: 100%;
		-webkit-app-region: drag;
		/* opacity: 0; */
		z-index: 999;
		

	}
	
	.app__wrap{
		position: fixed;
		top: 4px;
		right: 2px;
		z-index: 9999;
		display: flex;
		flex-direction: row;
		opacity: 0;
		transition: opacity .2s ease-in;
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
	
	.btn1{
		background-color: #f35a52;
	}
	
	.btn2{
		background-color: #f2c231;
	}
	
	.btn3{
		background-color: #3bc151;
	}
	
	
  /* CSS */
</style>
