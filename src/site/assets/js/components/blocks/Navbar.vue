<template>
	<nav class="navbar navbar-expand-md navbar-dark bg-elegant-dark mb-4">
		<ul class="navbar-nav">	
			<li class="nav-item">
				<router-link class="navbar-brand" :to="{ name: 'home' }">Oxyl Dashboard</router-link>
			</li>
			<li class="nav-item">
				<router-link class="nav-link" :class="{ active: $route.name === 'home' }" :to="{ name: 'home' }">Home</router-link>
			</li>
			<li class="nav-item">
				<router-link class="nav-link" :class="{ active: $route.name === 'commands' }" :to="{ name: 'commands' }">Commands</router-link>
			</li>
			<li class="nav-item">
				<router-link class="nav-link" :class="{ active: $route.name === 'config' }" :to="{ name: 'config' }">Configuration</router-link>
			</li>
			<li class="nav-item">
				<router-link class="nav-link" :class="{ active: $route.name === 'patreon' }" :to="{ name: 'patreon' }">Patreon</router-link>
			</li>
			<li class="nav-item">
				<router-link class="nav-link" :class="{ active: $route.name === 'invite' }" :to="{ name: 'invite' }">Invite</router-link>
			</li>
			<li class="nav-item">
				<router-link class="nav-link" :class="{ active: $route.name === 'support' }" :to="{ name: 'support' }">Support</router-link>
			</li>
		</ul>
	</nav>
</template>