<template>
	<div class="live">
		<router-view></router-view>
	</div>
</template>

<script>
	export default {
		name: 'live-page',
		created() {
			console.log(123,this.$store.state.token)
		}
	}
</script>

<style scoped>
	.live {
		width: 100%;
		height: 100%;
	}
</style>
