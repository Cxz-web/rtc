<template>
	<div class="handle">
		<div class="handle__wrap">
			<div class="handle__box">
				<div class="handle__open"><span>Open Room</span><div class="handle__btn" @click="change($event)"></div></div>
				<div class="handle__flow"><span>Push Flow</span><div class="handle__btn" @click="change($event)"></div></div>
			</div>
			<div class="handle__content">
				<div class="content__operation">
					<div class="content__btn">Red Packet</div>
					<div class="content__btn">Raise hands</div>
					<div class="content__btn">Options</div>
					<div class="content__btn">Questions</div>
					<div class="content__btn">Video Call</div>
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
	
	export default {
		name: 'live-handle',
		methods: {
			change(e) {
				e.target.classList.toggle('handle__btn--active')
				console.log(e)
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
</style>


