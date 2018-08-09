<template>
	<nav class="navbar navbar-expand-lg navbar-dark color-630">
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
					<router-link class="nav-link" :class="{ active: $route.name === 'logs' }" :to="{ name: 'logs' }">
						<i class="fa fa-terminal" aria-hidden="true"></i>
						Logs
					</router-link>
				</li>
				<li class="nav-item">
					<router-link class="nav-link" :class="{ active: $route.name === 'workers' }" :to="{ name: 'workers' }">
						<i class="fa fa-heartbeat" aria-hidden="true"></i>
						Workers
					</router-link>
				</li>
			</ul>
		</div>
	</nav>
</template>

<style lang="scss" scoped>
@import "../variables";
@import "~bootstrap/scss/bootstrap";

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
			overflow-y: auto;
		}
	}
}
</style>

<script>
export default {
	data() {
		return { shown: { navbar: false } };
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
		}
	}
};
</script>
