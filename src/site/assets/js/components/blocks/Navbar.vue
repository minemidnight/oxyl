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
					<router-link class="nav-link" :class="{ active: $route.name === 'features' }" :to="{ name: 'features' }">
						<i class="fa fa-keyboard-o" aria-hidden="true"></i>
						Features
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
						<router-link v-for="(page, index) in pages" :key="index" class="dropdown-item color-hover-800 color-text-hover-100 transition" :class="{ active: $route.name === page.to }" :to="{ name: page.to, params: { guild: $route.params.guild } }">
							<i class="fa" :class="{ [`fa-${page.icon}`]: true }" aria-hidden="true"></i>
								{{page.name}}
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
				<li class="nav-item dropdown">
					<button class="nav-link dropdown-toggle float" type="button" id="change-background" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
						Background
					</button>
					<div class="dropdown-menu color-700" aria-labelledby="change-background">
						<button class="dropdown-item color-hover-800 color-text-hover-100 transition" v-for="(background, i) in backgrounds" :key="i" type="button" @click="changeBackground(background)">
							{{ background.charAt(0).toUpperCase() + background.substring(1) }}
						</button>
					</div>
				</li>
			</ul>
		</div>
	</nav>
</template>

<style lang="scss" scoped>
.dropdown-item {
	color: rgba(255, 255, 255, 0.5);

	&.active {
		color: white;
		background: rgba(0, 0, 0, .3);
	}
}

.nav-item button {
	outline: none;
	border: none;
	background: transparent;
}
</style>

<script>
module.exports = {
	data() {
		return {
			backgrounds: ["geometry", "robots", "shattered", "stardust"],
			pages: require("../../dashboardNavbar")
		};
	},
	methods: {
		changeBackground(background) {
			localStorage.background = background;
			this.updateBackground();
		},
		updateBackground() {
			$("#page-fill div").css("background-image", `url(/img/${localStorage.background || this.backgrounds[0]}.png)`);
		}
	},
	created() {
		this.$nextTick(this.updateBackground);
	}
};
</script>