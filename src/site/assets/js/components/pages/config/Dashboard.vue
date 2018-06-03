<template>
	<div class="row">
		<nav class="col-2 px-0 color-600 d-none d-lg-flex flex-column fix-mt">
			<ul class="nav nav-pills text-light p-2 dark-pills" style="overflow-y:auto">
				<li class="nav-item">
					<router-link class="nav-link color-text-hover-100 transition" :to="{ name: 'accounts' }">
						Switch Account
					</router-link>
				</li>
				<li class="nav-item">
					<router-link class="nav-link color-text-hover-100 transition" :to="{ name: 'selector' }">
						Switch Server
					</router-link>
				</li>
				<div class="dropdown-divider" style="width:100%"></div>
				<li class="nav-item" v-for="(page, index) in pages" :key="index">
					<router-link class="nav-link" :class="{ active: $route.name === page.to }" :to="{ name: page.to, params: { guild: $route.params.guild } }">
						<i class="fa" :class="{ [`fa-${page.icon}`]: true }" aria-hidden="true"></i>
						{{page.name}}
					</router-link>
				</li>
			</ul>
		</nav>
		<div class="col-lg-10 col-12 container ml-0 mb-4">
			<router-view id="loadedView"></router-view>
		</div>
	</div>
</template>

<script>
module.exports = {
	data() {
		return { pages: require("../../../dashboardNavbar") };
	}
};
</script>

<style lang="scss" scoped>
@import "node_modules/bootstrap/scss/functions";
@import "node_modules/bootstrap/scss/variables";

.fix-mt {
	margin-top: $spacer * -1.5;
	min-height: calc(100% - 56px);
}

li.nav-item {
	width: 100%;

	& a {
		transition: 0.25s ease-in-out;

		&:hover { color: white; }
	}
}
</style>
