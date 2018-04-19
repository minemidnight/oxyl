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
					<router-link class="nav-link" :class="{ active: $route.name === 'dashboard_roblox' }" :to="{ name: 'dashboard_roblox' }">
						<i class="fa fa-id-card" aria-hidden="true"></i>
						Roblox Verification
					</router-link>
				</li>
				<li class="nav-item">
					<router-link class="nav-link" :class="{ active: $route.name === 'dashboard_roles' }" :to="{ name: 'dashboard_roles' }">
						<i class="fa fa-plus-circle" aria-hidden="true"></i>
						Roles
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
		<!-- <div class="col-lg-10 col-xl-7 col-12 container ml-0 mb-4"> -->
		<div class="col-lg-10 col-12 container ml-0 mb-4">
			<router-view></router-view>
		</div>
		<!-- <div class="col-3 px-0 color-600 d-none d-xl-flex flex-column fix-mt px-2 pt-2 color-text" style="overflow-y:auto">
			<h4 class="mb-1">Controls</h4>
			<div id="controls" class="mb-3 text-center color-700 p-2 rounded" style="width:100%">
				<div class="row">
					<div class="col">
						<button>
							<i class="fa fa-repeat" aria-hidden="true"></i>
						</button>
					</div>
					<div class="col">
						<button>
							<i class="fa fa-step-forward" aria-hidden="true"></i>
						</button>
					</div>
					<div class="col">
						<button>
							<i class="fa fa-random" aria-hidden="true"></i>
						</button>
					</div>
					<div class="col">
						<button>
							<i class="fa fa-stop" aria-hidden="true"></i>
						</button>
					</div>
				</div>
			</div>

			<h4 class="mb-1">Now Playing</h4>
			<div class="color-630 copy-list-group-padding mb-3">
				<a :href="current.link" class="float-right m-1" target="_blank"><i class="fa fa-external-link" aria-hidden="true"></i></a>
				<div class="row text-center">
					<div class="col">
						<img :src="current.thumbnail" class="rounded mb-1" style="height:90px" />
						<br />
						<span>
							<i class="fa fa-clock-o" aria-hidden="true"></i> 
							{{ current.duration }}
						</span>
					</div>
					<div class="col">
						<span>{{ current.title }}</span>
					</div>
				</div>
			</div>

			<h4 class="mb-1">Queue</h4>
			<ol class="list-group" id="sort" style="overflow-y:auto; height: calc(100% - 56px - 1.5rem)">
				<li class="list-group-item color-630" v-for="(track, i) in queue" v-once :key="i">
					<a :href="track.link" class="float-right m-1" target="_blank"><i class="fa fa-external-link" aria-hidden="true"></i></a>
					<div class="row text-center">
						<div class="col">
							<img :src="track.thumbnail" class="rounded mb-1" style="height:90px" />
							<br />
							<span class="duration">
								<i class="fa fa-clock-o" aria-hidden="true"></i> 
								{{ track.duration }}
							</span>
						</div>
						<div class="col">
							<span class="title">{{ track.title }}</span>
						</div>
					</div>
					<button class="btn btn-danger float-right" @click="removeQueueItem(queue.indexOf(track))">
						<i class="fa fa-trash-o" aria-hidden="true"></i>
					</button>
				</li>
			</ol>
		</div> -->
	</div>
</template>

<!-- <script>
module.exports = {
	data() {
		return {
			current: {
				link: "https://www.youtube.com/watch?v=Sa0c1VGoiyc",
				thumbnail: "https://i.ytimg.com/vi/Sa0c1VGoiyc/mqdefault.jpg",
				duration: "6:14",
				title: "Illenium X San Holo - Needed Your Light [Mashup]"
			},
			status: {},
			queue: [{
				link: "https://www.youtube.com/watch?v=sz3TTespHKk",
				thumbnail: "https://i.ytimg.com/vi/sz3TTespHKk/mqdefault.jpg",
				duration: "4:02",
				title: "Vance Joy - Lay It On Me (Said The Sky Remix) [Official Lyric Video]"
			}, {
				link: "https://www.youtube.com/watch?v=lITExahxoyM",
				thumbnail: "https://i.ytimg.com/vi/lITExahxoyM/mqdefault.jpg",
				duration: "4:39",
				title: "Fox Stevenson - Endless"
			}],
			testItem: {
				link: "https://www.youtube.com/watch?v=Sa0c1VGoiyc",
				thumbnail: "https://i.ytimg.com/vi/Sa0c1VGoiyc/mqdefault.jpg",
				duration: "6:14",
				title: "Illenium X San Holo - Needed Your Light [Mashup]"
			}
		};
	},
	created() {
		this.$nextTick(() => {
			require("sortablejs").create($("#sort")[0], {
				animation: 250,
				onUpdate: ({ newIndex, oldIndex }) => {
					this.queue.splice(newIndex, 0, this.queue.splice(oldIndex, 1)[0]);
				}
			});
		});
	},
	methods: {
		removeQueueItem(index) {
			this.queue.splice(index, 1);
			$("#sort li").get(index).remove();
		}
	}
};
</script> -->

<style lang="scss" scoped>
// @import "../../../../scss/_variables";
@import "node_modules/bootstrap/scss/functions";
@import "node_modules/bootstrap/scss/variables";

// #controls button {
// 	transition: color 0.25s ease-in 0.25s, transform 0.5s ease-out;
// 	outline: none;
// 	border: none;
// 	background: transparent;
// 	color: inherit;

// 	&:hover, &.active {
// 		color: white;
// 		transform: scale(1.25);
// 	}
// }

// .copy-list-group-padding {
// 	padding: $list-group-item-padding-y $list-group-item-padding-x;
// }

// #sort li {
// 	cursor: move;
// 	transition: 0.5s ease-in;
// }

// #sort .sortable-ghost {
// 	opacity: 0.5;
// }

.fix-mt {
	margin-top: $spacer * -1.5;
	min-height: calc(100% - 56px);
}

li.nav-item {
	width: 100%;
}
</style>
