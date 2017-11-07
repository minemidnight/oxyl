<template>
	<nav class="navbar navbar-expand-md navbar-dark color-630">
		<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#main-nav" aria-controls="main-nav" aria-expanded="false">
			<span class="navbar-toggler-icon"></span>
		</button>
		<router-link class="navbar-brand" :to="{ name: 'home' }">Oxyl Dashboard</router-link>

		<div class="navbar-collapse collapse" id="main-nav">
			<ul class="navbar-nav">	
				<li class="nav-item">
					<router-link class="nav-link" :class="{ active: $route.name === 'home' }" :to="{ name: 'home' }">
						<i class="fa fa-home" aria-hidden="true"></i>
						Home
					</router-link>
				</li>
				<li class="nav-item">
					<router-link class="nav-link" :class="{ active: $route.name === 'commands' }" :to="{ name: 'commands' }">
						<i class="fa fa-home" aria-hidden="true"></i>
						Commands
					</router-link>
				</li>
				<li class="nav-item">
					<router-link class="nav-link" :class="{ active: ~['accounts', 'selector'].indexOf($route.name) || $route.name.startsWith('dashboard') }" :to="{ name: 'config' }">
						<i class="fa fa-cogs" aria-hidden="true"></i>
						Configuration
					</router-link>
				</li>
				<li class="nav-item">
					<router-link class="nav-link" :class="{ active: $route.name === 'patreon' }" :to="{ name: 'patreon' }">
						<i class="fa fa-usd" aria-hidden="true"></i>
						Patreon
					</router-link>
				</li>
				<li class="nav-item">
					<router-link class="nav-link" :class="{ active: $route.name === 'invite' }" :to="{ name: 'invite' }">
						<i class="fa fa-sign-in" aria-hidden="true"></i>
						Invite
					</router-link>
				</li>
				<li class="nav-item">
					<router-link class="nav-link" :class="{ active: $route.name === 'support' }" :to="{ name: 'support' }">
						<i class="fa fa-question" aria-hidden="true"></i>
						Support
					</router-link>
				</li>
			</ul>
		</div>
	</nav>
</template>