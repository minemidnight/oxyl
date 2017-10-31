<template>
	<nav class="navbar navbar-expand-md navbar-dark bg-elegant-dark mb-4 ">
		<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#main-nav" aria-controls="main-nav" aria-expanded="false">
			<span class="navbar-toggler-icon"></span>
		</button>
		<router-link class="navbar-brand" :to="{ name: 'home' }">Oxyl Dashboard</router-link>

		<div class="navbar-collapse collapse" id="main-nav">
			<ul class="navbar-nav">	
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
		</div>
	</nav>
</template>