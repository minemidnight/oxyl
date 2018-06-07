<template>
	<div class="container text-center mt-4 color-text">
		<h1>Page not found</h1>
		<p>The requested page was not found</p>
		<button class="btn btn-primary" @click="$router.go(-1)">
			<i class="fa fa-home" aria-hidden="true"></i>
			Go to last page
		</button>
		<router-link class="btn btn-secondary" :to="{ name: 'home' }">
			<i class="fa fa-home" aria-hidden="true"></i>
			Go to home
		</router-link>
	</div>
</template>
