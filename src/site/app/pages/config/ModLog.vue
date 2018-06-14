<template>
	<div>
		<div v-if="loaded">
			<form id="update-settings" class="mb-4" @submit.prevent="update()">
				<div class="row mb-3">
					<div class="col-sm-12 col-md-6">
						<h4>Mod-Log</h4>
						<p>Options to configure Oxyl's mod log, where moderation actions (kick, mute, ban, etc) are logged to a channel with reasons</p>
					</div>
					<div class="col-sm-12 col-md-6"></div>
					<div class="col-sm-12 col-md-6">
						<div class="form-group">
							<label for="channel">
								Channel
								<small class="form-text">What Discord channel the modlog should be in</small>
							</label>
							<select class="form-control" id="channel" v-model="updateModel.channelID">
								<option v-for="(channel, index) in channels.filter(({ canSend }) => canSend)" :key="index" :value="channel.id" :selected="channel.id === data.channelID">#{{ channel.name }}</option>
							</select>
							<small class="form-text text-muted">Don't see your channel? Make sure Oxyl has permission to Send Messages and Read Messages in that channel.</small>
						</div>
					</div>
					<div class="col-sm-12 col-md-6">
						<label>
							Enabled
							<small class="form-text">Whether or not to enable the mod log</small>
						</label>
						<label class="tgl">
							<input type="checkbox" :checked="data.enabled" v-model="updateModel.enabled" />
							<span class="tgl_body">
								<span class="tgl_switch"></span>
								<span class="tgl_track">
									<span class="tgl_bgd"></span>
									<span class="tgl_bgd tgl_bgd-negative"></span>
								</span>
							</span>
						</label>
					</div>
				</div>

				<div>
					<div class="row">
						<div class="col-sm-12 col-md-6">
							<h4>Tracked Roles</h4>
							<p>Whenever one of these roles are added or removed from a person, a mod log entry is made</p>
						</div>
						<div class="col-sm-12 col-md-6"></div>
						<div class="col-sm-12 col-md-6">
							<roleselector :roles="roles" v-model="updateModel.tracked" />
						</div>
					</div>
				</div>
				<button type="submit" class="btn btn-success">Save</button>
			</form>

			<form id="add-threshold" @submit.prevent="add()">
				<div class="row">
					<div class="col-sm-12 col-md-6">
						<h4>Warning Thresholds</h4>
						<p>Every time someone hits a specified warning threshold, an action will be taken</p>
					</div>
					<div class="col-sm-12 col-md-6"></div>
					<div class="col-sm-12 col-md-6">
						<div class="form-group">
							<label for="warn-count">
								Warn Count
								<small class="form-text">The amount of warns required to trigger this threshold</small>
							</label>
							<input id="warn-count" class="form-control" type="number" min="1" max="50" v-model.number="thresholdInsertModel.warnCount" required />
						</div>
					</div>
					<div class="col-sm-12 col-md-6">
						<div class="form-group">
							<label for="action">
								Action
								<small class="form-text">The action to take when someone this threshold is reached</small>
							</label>
							<select class="form-control" id="action" v-model="thresholdInsertModel.action" required>
								<option v-for="(action, index) in actions" :key="index" :value="action.value" :selected="action.selected">{{ action.display }}</option>
							</select>
							<small class="form-text text-danger" v-if="errors.add.alreadyExists">You are not able to make a second threshold with the same warn count. To change the existing one, delete it and re-create it.</small>
						</div>
					</div>
					<div class="col-sm-12 col-md-6" v-if="thresholdInsertModel.action === 'role'">
						<div class="form-group">
							<label for="role">
								Role
								<small class="form-text">The Discord role to give the user when the threshold is reached</small>
							</label>
							<select class="form-control" id="role" v-model="thresholdInsertModel.roleID" required>
								<option v-for="(role, index) in roles.filter(({ canGive }) => canGive)" :key="index" :value="role.id">{{ role.name }}</option>
							</select>
							<small class="form-text text-muted">Don't see your role? Make sure Oxyl has permission to Manage Roles and that his highest role is above the role you want to give.</small>
						</div>
					</div>
					<div class="col-sm-12 col-md-6" v-if="~['ban', 'role'].indexOf(thresholdInsertModel.action)">
						<div class="form-group">
							<label for="time">
								Time
								<small class="form-text">The amount of time in seconds, until the ban/role is removed (0 = no removal)</small>
							</label>
							<input id="time" class="form-control" type="number" min="0" max="63113904" v-model.number="thresholdInsertModel.time" required />
						</div>
					</div>
				</div>
				<button type="submit" class="btn btn-primary">Add Threshold</button>
			</form>

			<h4 class="mt-4" v-if="data.thresholds.length">Current Thresholds</h4>
			<div class="card-group" v-for="(thresholdChunk, i) in chunkify(data.thresholds, [4, 3, 2].find(size => !(data.thresholds.length % size)) || 4)" :key="i">
				<div class="card color-600 color-hover-630" v-for="(threshold, index) in thresholdChunk" :key="index" :data-index="index">
					<div class="card-body">
						<button class="btn btn-danger float-right" @click="remove(index)">
							<i class="fa fa-trash-o" aria-hidden="true"></i>
						</button>
						<p class="card-text">Warn Count: {{threshold.warnCount}}</p>
						<p class="card-text">
							Action: {{ actions.find(action => action.value === threshold.action).display }}
							<br v-if="threshold.action === 'role'" />
							<small class="card-text" v-if="threshold.action === 'role'">Role: {{ roles.find(role => role.id === threshold.roleID).name }}</small>
						</p>
					</div>
				</div>
			</div>
		</div>
		<div v-else class="mt-4 loading">
			<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>
		</div>
	</div>
</template>

<script>
const addErrors = { alreadyExists: false };
export default {
	data() {
		return {
			loaded: false,
			channels: [],
			roles: [],
			errors: { add: Object.assign({}, addErrors) },
			actions: [
				{ value: "warn", display: "Warn" },
				{ value: "kick", display: "Kick" },
				{ value: "softban", display: "Softban" },
				{ value: "ban", display: "Ban" },
				{ value: "role", display: "Add Role" }
			],
			data: {},
			updateModel: {},
			thresholdInsertModel: {}
		};
	},
	async created() {
		const { error, body } = await apiCall.get(`modlog/${this.$route.params.guild}`);

		if(error) return;
		this.channels = body.channels;
		this.roles = body.roles;
		this.data = {
			enabled: body.enabled,
			channelID: body.channelID,
			tracked: body.tracked,
			thresholds: body.thresholds
		};
		this.updateModel = Object.assign({}, this.data);
		this.loaded = true;
	},
	methods: {
		chunkify(array, size) {
			const chunkified = [];
			for(let i = 0; i < array.length; i += size) chunkified.push(array.slice(i, i + size));
			return chunkified;
		},
		async add() {
			$("#add-threshold button[type=submit]").addClass("disabled");
			const { error, body: threshold } = await apiCall.put(`modlog/${this.$route.params.guild}/thresholds`).send({
				warnCount: this.thresholdInsertModel.warnCount,
				action: this.thresholdInsertModel.action,
				roleID: this.thresholdInsertModel.action === "role" ? this.thresholdInsertModel.roleID : undefined,
				time: this.thresholdInsertModel.time && ~["role", "ban"].indexOf(this.thresholdInsertModel.action) ?
					this.thresholdInsertModel.time :
					undefined
			});

			if(error) return;
			this.data.thresholds.push(threshold);
			this.thresholdInsertModel = {};

			$("#add-threshold").trigger("reset");
			$("#add-threshold button[type=submit]").removeClass("disabled");
		},
		async remove(index) {
			$(`[data-index=${index}] button`).addClass("disabled");
			const { error } = await apiCall.delete(`modlog/${this.$route.params.guild}/thresholds`)
				.send({ warnCount: this.data.thresholds[index].warnCount });

			if(error) return;
			this.data.thresholds.splice(index, 1);
		}
	}
};
</script>