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
						<i class="fa fa-keyboard-o" aria-hidden="true"></i>
						Commands
					</router-link>
				</li>
				<li class="nav-item dropdown d-lg-none active" :class="{ 'd-none': !$route.name.startsWith('dashboard') }">
					<a class="nav-link dropdown-toggle" id="dashboardDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
						<i class="fa fa-cogs" aria-hidden="true"></i>
						Configuration
					</a>
					<div class="dropdown-menu color-700" aria-labelledby="dashboardDropdown">
						<router-link class="dropdown-item color-hover-800 color-text-hover-100 transition" :to="{ name: 'accounts' }">
							Switch Account
						</router-link>
						<router-link class="dropdown-item color-hover-800 color-text-hover-100 transition" :to="{ name: 'selector' }">
							Switch Server
						</router-link>
						<div class="dropdown-divider border-dark"></div>
						<router-link class="dropdown-item color-hover-800 color-text-hover-100 transition" :class="{ active: $route.name === 'dashboard' }" :to="{ name: 'dashboard', params: { guild: $route.params.guild } }">
							<i class="fa fa-cog" aria-hidden="true"></i>
							General
						</router-link>
						<router-link class="dropdown-item color-hover-800 color-text-hover-100 transition" :class="{ active: $route.name === 'dashboard_censors' }" :to="{ name: 'dashboard_censors' }">
							<i class="fa fa-asterisk" aria-hidden="true"></i>
							Censors
						</router-link>
						<router-link class="dropdown-item color-hover-800 color-text-hover-100 transition" :class="{ active: $route.name === 'dashboard_commands' }" :to="{ name: 'dashboard_commands' }">
							<i class="fa fa-exclamation" aria-hidden="true"></i>
							Commands
						</router-link>
						<router-link class="dropdown-item color-hover-800 color-text-hover-100 transition" :class="{ active: $route.name === 'dashboard_modlog' }" :to="{ name: 'dashboard_modlog' }">
							<i class="fa fa-table" aria-hidden="true"></i>
							Mod-Log
						</router-link>
						<router-link class="dropdown-item color-hover-800 color-text-hover-100 transition" :class="{ active: $route.name === 'dashboard_music' }" :to="{ name: 'dashboard_music' }">
							<i class="fa fa-music" aria-hidden="true"></i>
							Music
						</router-link>
						<router-link class="dropdown-item color-hover-800 color-text-hover-100 transition" :class="{ active: $route.name === 'dashboard_reddit' }" :to="{ name: 'dashboard_reddit' }">
							<i class="fa fa-reddit-alien" aria-hidden="true"></i>
							Reddit
						</router-link>
						<router-link class="dropdown-item color-hover-800 color-text-hover-100 transition" :class="{ active: $route.name === 'dashboard_roblox' }" :to="{ name: 'dashboard_roblox' }">
							<i class="fa fa-id-card" aria-hidden="true"></i>
							Roblox Verification
						</router-link>
						<router-link class="dropdown-item color-hover-800 color-text-hover-100 transition" :class="{ active: $route.name === 'dashboard_roles' }" :to="{ name: 'dashboard_roles' }">
							<i class="fa fa-plus-circle" aria-hidden="true"></i>
							Roles
						</router-link>
						<router-link class="dropdown-item color-hover-800 color-text-hover-100 transition" :class="{ active: $route.name === 'dashboard_twitch' }" :to="{ name: 'dashboard_twitch' }">
							<i class="fa fa-twitch" aria-hidden="true"></i>
							Twitch
						</router-link>
						<router-link class="dropdown-item color-hover-800 color-text-hover-100 transition" :class="{ active: $route.name === 'dashboard_userlog' }" :to="{ name: 'dashboard_userlog' }">
							<i class="fa fa-users" aria-hidden="true"></i>
							User Log
						</router-link>
					</div>
				</li>
				<li class="nav-item" :class="{ 'd-none d-lg-block': $route.name.startsWith('dashboard') }">
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

<style lang="scss" scoped>
	.dropdown-item {
		color: rgba(255, 255, 255, 0.5);
	}

	.dropdown-item.active {
		color: white;
		background: rgba(0, 0, 0, .3);
	}
</style>
