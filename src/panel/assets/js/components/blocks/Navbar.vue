<template>
	<nav class="navbar navbar-expand-md navbar-dark bg-dark">
		<ul class="navbar-nav">	
			<li class="nav-item">
				<router-link class="navbar-brand" :to="{ name: 'home' }">Oxyl Panel</router-link>
			</li>
			<li class="nav-item">
				<router-link class="nav-link" :to="{ name: 'overview' }">Overview</router-link>
			</li>
		</ul>
	</nav>
</template>