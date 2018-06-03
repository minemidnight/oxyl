<template>
	<nav class="navbar navbar-expand-md navbar-dark bg-elegant-dark mb-4">
		<ul class="navbar-nav">	
			<li class="nav-item">
				<router-link class="navbar-brand" :to="{ name: 'home' }">Oxyl Panel</router-link>
			</li>
			<li class="nav-item" :class="{ active: $route.name === 'home' }">
				<router-link class="nav-link" :to="{ name: 'home' }">Home</router-link>
			</li>
		</ul>
	</nav>
</template>