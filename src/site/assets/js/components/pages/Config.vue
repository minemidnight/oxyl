<template>
	<div class="row">
		<nav class="col-2 px-0 color-600">
			<ul class="nav nav-pills flex-column text-light p-2 dark-pills" style="height:calc(100% - 56px)">
				<li class="nav-item">
					<router-link class="nav-link" :class="{ active: $route.name === 'general' }" :to="{ name: 'general' }">
						<i class="fa fa-cog" aria-hidden="true"></i>
						General
					</router-link>
				</li>
				<li class="nav-item">
					<router-link class="nav-link" :class="{ active: $route.name === 'censors' }" :to="{ name: 'censors' }">
						<i class="fa fa-asterisk" aria-hidden="true"></i>
						Censors
					</router-link>
				</li>
				<li class="nav-item">
					<router-link class="nav-link" :class="{ active: $route.name === 'config_commands' }" :to="{ name: 'config_commands' }">
						<i class="fa fa-exclamation" aria-hidden="true"></i>
						Commands
					</router-link>
				</li>
				<li class="nav-item">
					<router-link class="nav-link" :class="{ active: $route.name === 'modlog' }" :to="{ name: 'modlog' }">
						<i class="fa fa-table" aria-hidden="true"></i>
						Mod-Log
					</router-link>
				</li>
				<li class="nav-item">
					<router-link class="nav-link" :class="{ active: $route.name === 'music' }" :to="{ name: 'music' }">
						<i class="fa fa-music" aria-hidden="true"></i>
						Music
					</router-link>
				</li>
				<li class="nav-item">
					<router-link class="nav-link" :class="{ active: $route.name === 'reddit' }" :to="{ name: 'reddit' }">
						<i class="fa fa-reddit-alien" aria-hidden="true"></i>
						Reddit
					</router-link>
				</li>
				<li class="nav-item">
					<router-link class="nav-link" :class="{ active: $route.name === 'roles' }" :to="{ name: 'roles' }">
						<i class="fa fa-plus-circle" aria-hidden="true"></i>
						Roles
					</router-link>
				</li>
				<li class="nav-item">
					<router-link class="nav-link" :class="{ active: $route.name === 'tags' }" :to="{ name: 'tags' }">
						<i class="fa fa-tags" aria-hidden="true"></i>
						Tags
					</router-link>
				</li>
				<li class="nav-item">
					<router-link class="nav-link" :class="{ active: $route.name === 'twitch' }" :to="{ name: 'twitch' }">
						<i class="fa fa-twitch" aria-hidden="true"></i>
						Twitch
					</router-link>
				</li>
				<li class="nav-item">
					<router-link class="nav-link" :class="{ active: $route.name === 'userlog' }" :to="{ name: 'userlog' }">
						<i class="fa fa-users" aria-hidden="true"></i>
						User Log
					</router-link>
				</li>
			</ul>
		</nav>
		<div class="col-10">
			<router-view></router-view>
		</div>
	</div>
</template>