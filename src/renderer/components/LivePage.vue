<template>
	<div class="live">
		<router-view></router-view>
	</div>
</template>

<script>
	export default {
		name: 'live-page',
		created() {
			history.pushState(null, null, document.URL)
		}
	}
</script>

<style scoped>
	.live {
	  width: 100%;
		height: 100%;
	}
</style>
