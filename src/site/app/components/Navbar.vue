<template>
	<nav class="navbar navbar-expand-md navbar-dark color-630">
		<button class="navbar-toggler" type="button" @click="toggleNavbar()">
			<span class="navbar-toggler-icon"></span>
		</button>
		<router-link class="navbar-brand p-0" :to="{ name: 'home' }">
			<img src="/static/oxyl-logo.png" style="height:40px" />
		</router-link>

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
					<a class="nav-link dropdown-toggle" role="button" @click="toggleDropdown()">
						<i class="fa fa-cogs" aria-hidden="true"></i>
						Configuration
					</a>
					<div class="dropdown-menu color-700" id="dashboardDropdown">
						<router-link class="dropdown-item color-hover-800 color-text-hover-100 transition" :to="{ name: 'accounts' }">
							Switch Account
						</router-link>
						<router-link class="dropdown-item color-hover-800 color-text-hover-100 transition" :to="{ name: 'selector' }">
							Switch Server
						</router-link>
						<div class="dropdown-divider border-dark"></div>
						<router-link v-for="(page, i) in pages" :key="i" class="dropdown-item color-hover-800 color-text-hover-100 transition" :class="{ active: $route.name === page.name }" :to="{ name: page.name, params: { guild: $route.params.guild } }">
							<i class="fa" :class="{ [`fa-${page.icon}`]: true }" aria-hidden="true"></i>
							{{ page.display }}
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
@import "~bootstrap/scss/bootstrap";

.dropdown-item {
	color: rgba(255, 255, 255, .5);

	&.active {
		color: white;
		background: rgba(0, 0, 0, .3);
	}
}

@include media-breakpoint-down(md) {
	#main-nav {
		overflow: hidden;
		max-height: 0px;
		transition: max-height 0.4s ease-in-out;
		display: block;
		padding: 0px;
		border: none;
		margin: 0px;

		&.show {
			max-height: 800px;
			border: unset;
			margin: unset;
		}
	}
}
</style>

<script>
import routes from "../router/routes";

export default {
	data() {
		return {
			pages: routes.dashboard.children,
			shown: {
				navbar: false,
				dropdown: false
			}
		};
	},
	methods: {
		toggleNavbar() {
			if(this.shown.navbar) {
				this.shown.navbar = false;
				this.$el.querySelector("#main-nav").classList.remove("show");
			} else {
				this.shown.navbar = true;
				this.$el.querySelector("#main-nav").classList.add("show");
			}
		},
		toggleDropdown() {
			if(this.shown.dropdown) {
				this.shown.dropdown = false;
				this.$el.querySelector("#dashboardDropdown").classList.remove("show");
			} else {
				this.shown.dropdown = true;
				this.$el.querySelector("#dashboardDropdown").classList.add("show");
			}
		}
	}
};
</script>