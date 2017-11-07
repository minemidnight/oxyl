<template>
	<div>
		<div class="container-fluid" v-if="loaded">
			<div class="card-group my-2" :key="i" v-for="(guildGroup, i) in chunkify(guilds, [4, 3, 2].find(size => !(guilds.length % size)) || 4)">
				<router-link class="card color-600 color-hover-630 color-text color-text-hover-100 transition no-decoration" style="cursor:pointer" :key="index" v-for="(guild, index) in guildGroup" :to="{ name: 'dashboard', params: { guild: guild.id } }">
					<div class="card-body d-flex align-items-center">
						<h4 class="card-title text-truncate">{{ guild.name }}</h4>
						<img v-if="guild.icon" class="rounded-circle ml-auto" :src="`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`" style="max-height:96px;max-width:96px" />
					</div>
				</router-link>
			</div>
			<small class="text-muted">Missing guilds? You must have the Manage Server permission to use the dashboard for a guild.</small>
		</div>
		<div v-else class="d-flex justify-content-center mt-4">
			<i class="fa fa-spinner fa-spin" aria-hidden="true" style="font-size:48px"></i>
		</div>
	</div>
</template>

<script>
module.exports = {
	data() {
		return {
			guilds: [],
			loaded: false
		};
	},
	async created() {
		const { error, body: guilds } = await apiCall("get", "oauth/info", { query: { path: "/users/@me/guilds" } });
		if(error) return;

		this.guilds = guilds.filter(({ owner, permissions }) => owner || permissions & 32);
		this.loaded = true;
	},
	methods: {
		chunkify: (array, size) => {
			const chunkified = [];
			for(let i = 0; i < array.length; i += size) chunkified.push(array.slice(i, i + size));
			return chunkified;
		}
	}
};
</script>