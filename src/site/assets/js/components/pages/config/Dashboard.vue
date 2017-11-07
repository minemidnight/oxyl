<template>
	<div class="row">
		<nav class="col-2 px-0 color-600">
			<ul class="nav nav-pills flex-column text-light p-2 dark-pills">
				<li class="nav-item">
					<router-link class="nav-link navbar-brand color-text-hover-100 transition" :to="{ name: 'accounts' }">
						Switch Account
					</router-link>
				</li>
				<li class="nav-item">
					<router-link class="nav-link navbar-brand color-text-hover-100 transition" :to="{ name: 'selector' }">
						Switch Server
					</router-link>
				</li>
				<li class="nav-item">
					<router-link class="nav-link" :class="{ active: $route.name === 'dashboard' }" :to="{ name: 'dashboard', params: { guild: $route.params.guild } }">
						<i class="fa fa-cog" aria-hidden="true"></i>
						General
					</router-link>
				</li>
				<li class="nav-item">
					<router-link class="nav-link" :class="{ active: $route.name === 'dashboard_censors' }" :to="{ name: 'dashboard_censors' }">
						<i class="fa fa-asterisk" aria-hidden="true"></i>
						Censors
					</router-link>
				</li>
				<li class="nav-item">
					<router-link class="nav-link" :class="{ active: $route.name === 'dashboard_commands' }" :to="{ name: 'dashboard_commands' }">
						<i class="fa fa-exclamation" aria-hidden="true"></i>
						Commands
					</router-link>
				</li>
				<li class="nav-item">
					<router-link class="nav-link" :class="{ active: $route.name === 'dashboard_modlog' }" :to="{ name: 'dashboard_modlog' }">
						<i class="fa fa-table" aria-hidden="true"></i>
						Mod-Log
					</router-link>
				</li>
				<li class="nav-item">
					<router-link class="nav-link" :class="{ active: $route.name === 'dashboard_music' }" :to="{ name: 'dashboard_music' }">
						<i class="fa fa-music" aria-hidden="true"></i>
						Music
					</router-link>
				</li>
				<li class="nav-item">
					<router-link class="nav-link" :class="{ active: $route.name === 'dashboard_reddit' }" :to="{ name: 'dashboard_reddit' }">
						<i class="fa fa-reddit-alien" aria-hidden="true"></i>
						Reddit
					</router-link>
				</li>
				<li class="nav-item">
					<router-link class="nav-link" :class="{ active: $route.name === 'dashboard_roles' }" :to="{ name: 'dashboard_roles' }">
						<i class="fa fa-plus-circle" aria-hidden="true"></i>
						Roles
					</router-link>
				</li>
				<li class="nav-item">
					<router-link class="nav-link" :class="{ active: $route.name === 'dashboard_tags' }" :to="{ name: 'dashboard_tags' }">
						<i class="fa fa-tags" aria-hidden="true"></i>
						Tags
					</router-link>
				</li>
				<li class="nav-item">
					<router-link class="nav-link" :class="{ active: $route.name === 'dashboard_twitch' }" :to="{ name: 'dashboard_twitch' }">
						<i class="fa fa-twitch" aria-hidden="true"></i>
						Twitch
					</router-link>
				</li>
				<li class="nav-item">
					<router-link class="nav-link" :class="{ active: $route.name === 'dashboard_userlog' }" :to="{ name: 'dashboard_userlog' }">
						<i class="fa fa-users" aria-hidden="true"></i>
						User Log
					</router-link>
				</li>
			</ul>
		</nav>
		<div class="col-10 container ml-0">
			<router-view></router-view>
		</div>
	</div>
</template>

<style lang="scss" scoped>
@import "node_modules/bootstrap/scss/functions";
@import "node_modules/bootstrap/scss/variables";
nav {
	margin-top: $spacer * -1.5;
	height: calc(100% - 56px);
}

.bottom-nav {
	position: absolute;
	bottom: 0;
	width: inherit;
}
</style>
