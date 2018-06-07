<template>
	<div>
		<div v-if="loaded.page">
			<div class="row">
				<div class="col-sm-12 col-md-6">
					<h4>Commands</h4>
					<p>Edit how commands work by default</p>
				</div>
				<div class="col-sm-12 col-md-6">
					<div class="form-group">
						<label for="action">
							Category
							<small class="form-text">The category of commands currently being shown</small>
						</label>
						<select class="form-control" v-model="selectedCategory">
							<option v-for="(category, index) in categories" :key="index" :value="category" :selected="selectedCategory === category">{{ category.charAt(0).toUpperCase() + category.substring(1) }}</option>
						</select>
					</div>
				</div>
				<div class="col-sm-12 col-md-6">
					<ul class="list-group" style="max-height:400px;overflow:auto;border-radius:0.25rem">
						<li class="list-group-item" v-for="(command, index) in commands[selectedCategory].filter(command => typeof command === 'string')" :key="index" :class="{ active: command === selectedCommand }" @click="selectedCommand = command">
							{{command}}
						</li>
						<li class="list-group-item" v-for="(value, key) in commands[selectedCategory].find(command => typeof command !== 'string')" :key="key" :class="{ active: key === selectedCommand || ~Object.values(value).indexOf(selectedCommand) }" data-toggle="collapse" :data-target="'#accordion-' + key" aria-expanded="false" aria-controls="'accordion' + key" @click="selectedCommand = key">
   							{{key}}
  						</li>
						<li v-if="commands[selectedCategory].find(command => typeof command !== 'string')">
							<ul class="collapse list-group" style="border-left:4px solid rgba(255, 255, 255, 0.05)" v-for="(value, key) in commands[selectedCategory].find(command => typeof command !== 'string')" :key="key" :id="'accordion-' + key">
								<li class="list-group-item" v-for="(command, index) in Object.values(value)" :key="index" :class="{ active: command === selectedCommand }" @click="selectedCommand = command">
									{{command}}
								</li>
							</ul>
						</li>
					</ul>
					<small>Any command that requires a permission by default (moderator commands) will no longer require that permission if blacklisted OR whitelisted roles are set (outside of @everyone for the whitelist).</small>
				</div>
				<form class="col-sm-12 col-md-6" v-if="loaded.command" @submit.prevent="update()">
					<h5>{{selectedCommand}}</h5>
					<div class="container mb-3">
						<label>
							Enabled
							<small class="form-text">Whether or not the command is enabled</small>
						</label>
						<label class="tgl">
							<input type="checkbox" v-model="updateModel.enabled" />
							<span class="tgl_body">
								<span class="tgl_switch"></span>
								<span class="tgl_track">
									<span class="tgl_bgd"></span>
									<span class="tgl_bgd tgl_bgd-negative"></span>
								</span>
							</span>
						</label>
					</div>
					<div class="container mb-3">
						<div class="form-group">
							<label v-if="updateModel.roleType === 'whitelist'">
								Whitelisted Roles
								<small class="form-text">The following roles are the only roles which can use the command</small>
							</label>
							<label v-else>
								Blacklisted Roles
								<small class="form-text">The following roles are forbidden to use the command</small>
							</label>
							<role-selector :roles="roles" v-model="updateModel.roles"></role-selector>
							<button type="button" class="btn toggle-button" @click="updateModel.roleType = updateModel.roleType === 'whitelist' ? 'blacklist' : 'whitelist'">
								Toggle to {{ updateModel.roleType === "whitelist" ? "blacklist" : "whitelist" }}
							</button>
						</div>
					</div>
					<div class="container">
						<div class="form-group">
							<label>
								Blacklisted Channels
								<small class="form-text">The following channels cannot have the command ran inside of it</small>
							</label>
							<channel-selector :channels="channels" v-model="updateModel.blacklistedChannels"></channel-selector>
						</div>
					</div>
					<div class="container">
						<button type="submit" class="btn btn-success">Save</button>
					</div>
				</form>
				<div class="col-sm-12 col-md-6 loading" v-else>
					<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>
				</div>
			</div>
		</div>
		<div v-else class="mt-4 loading">
			<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>
		</div>
	</div>
</template>

<style lang="scss" scoped>
@import "../../variables";
.list-group-item {
	background: $color-630;
	transition: 0.3s ease-out;
	cursor: pointer;
	border: none;

	&.active, &:hover {
		color: white;
		background: $color-700;
	}
}

.toggle-button {
	background: $color-600;
	border: 1px solid $color-800;
	transition: 0.3s ease-out;
	color: rgba(255, 255, 255, 0.8);

	&:hover {
		color: white;
		background: $color-630;
	}
}
</style>


<script>
export default {
	data() {
		return {
			loaded: {
				page: false,
				command: false
			},
			channels: [],
			roles: [],
			categores: [],
			commands: {},
			selectedCategory: null,
			selectedCommand: null,
			updateModel: {},
			cachedData: {}
		};
	},
	async created() {
		const { error, body: { channels, commands, roles } } = await apiCall
			.get(`commands/${this.$route.params.guild}`);

		if(error) return;
		this.roles = roles.concat({ id: this.$route.params.guild, name: "@everyone", canGive: false });
		this.channels = channels;
		this.commands = commands;
		this.categories = Object.keys(commands);
		this.selectedCategory = this.categories[0];

		this.loaded.page = true;
	},
	methods: {
		getNode(category = this.selectedCategory, command = this.selectedCommand) {
			let node = `${category}.`;
			if(!~this.commands[category].indexOf(command)) {
				const subcommands = this.commands[category].find(cmd => typeof cmd !== "string");

				if(!subcommands) return false;
				if(!~Object.keys(subcommands).indexOf(command)) {
					const subcommand = Object.entries(subcommands)
						.find(([key, value]) => ~value.indexOf(command));

					if(!subcommand) return false;
					else node += `${subcommand[0]}.`;
				}
			}

			node += command;
			return node;
		},
		async update() {
			$("form button[type=submit]").addClass("disabled");

			const { error } = await apiCall
				.put(`commands/${this.$route.params.guild}/${encodeURIComponent(this.getNode())}`)
				.send(this.updateModel);

			if(error) return;
			$("form button[type=submit]").removeClass("disabled");
		}
	},
	watch: {
		selectedCategory(category, oldCategory) {
			if(oldCategory) this.cachedData[this.getNode(oldCategory)] = Object.assign({}, this.updateModel);

			this.selectedCommand = this.commands[category][0];
		},
		async selectedCommand(command, oldCommand) {
			const node = this.getNode();
			if(this.cachedData[node]) {
				this.updateModel = this.cachedData[node];
				return;
			} else if(oldCommand && this.getNode(this.selectedCategory, oldCommand)) {
				this.cachedData[this.getNode()] = Object.assign({}, this.updateModel);
			}

			this.loaded.command = false;

			const { error, body } = await apiCall
				.get(`commands/${this.$route.params.guild}/${encodeURIComponent(node)}`);
			if(error || this.selectedCommand !== command) return;

			this.updateModel = body;
			this.loaded.command = true;
		}
	}
};
</script>