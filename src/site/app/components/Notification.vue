<template>
	<div class="notification card color-800 color-text" v-scroll-reveal="{ origin: 'bottom', duration: 1000, distance: '200px' }">
		<div class="card-body">
			<slot></slot>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.notification {
	position: fixed;
	bottom: 0;
	right: 0;
	width: 300px;
	margin: 0.5rem;
}
</style>
