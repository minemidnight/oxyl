<template>
	<div>
		<div v-if="loaded">
			<form id="add-censor" @submit.prevent="add()">
				<div class="row">
					<div class="col-sm-12 col-md-6">
						<h4>Add Censor</h4>
						<p>Oxyl will create a censor which blocks out certain phrases. There can also be an action associated with them. Users with the "Manage Messages" permission will not be affected by censors</p>
					</div>
					<div class="col-sm-12 col-md-6"></div>
					<div class="col-sm-12 col-md-6">
						<div class="form-group">
							<label for="regex">
								Censor Regex
								<small class="form-text">The regex for the censor to use</small>
							</label>
							<input id="regex" class="form-control" placeholder="/test/i" v-model="insertModel.regex" required />
							<small class="form-text text-danger" v-if="errors.add.invalidRegex">Invalid regex: {{ errors.add.invalidRegex }}. Please contact support if you need help with regular expressions.</small>
						</div>
					</div>
					<div class="col-sm-12 col-md-6">
						<div class="form-group">
							<label for="message">
								Message
								<small class="form-text" v-pre>The message to send if this regex is triggered. Placeholders {{id}}, {{discrim}}, {{mention}} and {{username}} will be replaced accordingly.</small>
							</label>
							<input id="message" class="form-control" v-model.trim="insertModel.message" required />
						</div>
					</div>
					<div class="col-sm-12 col-md-6">
						<div class="form-group">
							<label for="action">
								Action
								<small class="form-text">The action to take when someone says a censored phrase. This is added to the message being deleted</small>
							</label>
							<select class="form-control" id="action" v-model="insertModel.action">
								<option v-for="(action, index) in actions" :key="index" :value="action.value" :selected="action.selected">{{ action.display }}</option>
							</select>
						</div>
					</div>
					<div class="col-sm-12 col-md-6" v-if="insertModel.action === 'role'">
						<div class="form-group">
							<label for="role">
								Role
								<small class="form-text">The Discord role to give the user when the phrase is said</small>
							</label>
							<select class="form-control" id="role" v-model="insertModel.roleID" required>
								<option v-for="(role, index) in roles.filter(({ canGive }) => canGive)" :key="index" :value="role.id">{{ role.name }}</option>
							</select>
							<small class="form-text text-muted">Don't see your role? Make sure Oxyl has permission to Manage Roles and that his highest role is above the role you want to give.</small>
						</div>
					</div>
					<div class="col-sm-12 col-md-6" v-if="~['ban', 'role'].indexOf(insertModel.action)">
						<div class="form-group">
							<label for="time">
								Time
								<small class="form-text">The amount of time in seconds, until the ban/role is removed (0 = no removal)</small>
							</label>
							<input id="time" class="form-control" type="number" min="0" max="63113904" v-model.number="insertModel.time" required />
						</div>
					</div>
				</div>
				<button type="submit" class="btn btn-primary">Add Censor</button>
			</form>

			<h4 v-if="censors.length" class="mt-4">Current Censors</h4>
			<div class="card-group" v-for="(censorChunk, i) in chunkify(censors, [4, 3, 2].find(size => !(censors.length % size)) || 4)" :key="i">
				<div class="card color-600 color-hover-630" v-for="(censor, index) in censorChunk" :key="index" data-toggle="modal" data-target="#edit-censor" @click="editModel = Object.assign({}, censor); editModel.regex = `/${censor.regex}/${censor.flags.join('')}`; delete editModel.flags">
					<div class="card-body">
						<p class="card-text">Regex: /{{ censor.regex }}/{{ censor.flags.join("") }}</p>
						<p class="card-text">
							Action: {{ actions.find(action => action.value === censor.action).display }}
							<br v-if="censor.action === 'role'" />
							<small class="card-text" v-if="censor.action === 'role'">Role: {{ roles.find(role => role.id === censor.roleID).name }}</small>
						</p>
						<p class="card-text">Message: {{ censor.message }}</p>
					</div>
				</div>
			</div>

			<div class="modal fade" tabindex="-1" role="dialog" id="edit-censor" aria-hidden="true">
				<div class="modal-dialog" role="document">
					<form class="modal-content color-700" @submit.prevent="edit()">
						<div class="modal-header border-dark">
							<h5 class="modal-title">Edit Censor</h5>
							<button type="button" class="close text-danger" data-dismiss="modal" aria-label="Close">
								<span aria-hidden="true">&times;</span>
							</button>
						</div>
						<div class="modal-body">
							<div class="form-group">
								<label for="regex-edit">
									Censor Regex
									<small class="form-text">The regex for the censor to use</small>
								</label>
								<input id="regex-edit" class="form-control" placeholder="/test/i" v-model="editModel.regex" required />
								<small class="form-text text-danger" v-if="errors.edit.invalidRegex">Invalid regex: {{ errors.add.invalidRegex }}. Please contact support if you need help with regular expressions.</small>
							</div>
							<div class="form-group">
								<label for="action-edit">
									Action
									<small class="form-text">The action to take when someone says a censored phrase. This is added to the message being deleted</small>
								</label>
								<select class="form-control" id="action-edit" v-model="editModel.action" required>
									<option v-for="(action, index) in actions" :key="index" :value="action.value" :selected="action.value === editModel.action">{{ action.display }}</option>
								</select>
							</div>
							<div class="form-group" v-if="editModel.action === 'role'">
								<label for="role-edit">
									Role
									<small class="form-text">The Discord role to give the user when the phrase is said</small>
								</label>
								<select class="form-control" id="role-edit" v-model="editModel.roleID" required>
									<option v-for="(role, index) in roles.filter(({ canGive }) => canGive)" :key="index" :value="role.id" :selected="role.id === editModel.roleID">{{ role.name }}</option>
								</select>
								<small class="form-text text-muted">Don't see your role? Make sure Oxyl has permission to Manage Roles and that his highest role is above the role you want to give.</small>
							</div>
							<div class="form-group" v-if="~['ban', 'role'].indexOf(editModel.action)">
								<label for="time">
									Time
									<small class="form-text">The amount of time in seconds, until the ban/role is removed (0 = no removal)</small>
								</label>
								<input id="song-length" class="form-control" type="number" min="0" max="63113904" v-model.number="editModel.time" required />
							</div>
							<div class="form-group">
								<label for="message-edit">
									Message
									<small class="form-text" v-pre>The message to send if this regex is triggered. Placeholders {{id}}, {{disrim}}, {{mention}} and {{username}} will be replaced accordingly.</small>
								</label>
								<input id="message-edit" class="form-control" v-model.trim="editModel.message" required  />
							</div>
						</div>
						<div class="modal-footer border-dark">
							<button type="submit" class="btn btn-success">Save</button>
							<button type="button" class="btn btn-danger" @click="remove()">Delete</button>
						</div>
					</form>
				</div>
			</div>
		</div>
		<div v-else class="mt-4 loading">
			<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>
		</div>
	</div>
</template>

<script>
const errors = { invalidRegex: false };
const defaultInsert = {
	action: "none",
	message: "{{mention}}, Please don't send messages with censored phrases"
};

export default {
	data() {
		return {
			loaded: false,
			censors: [],
			roles: [],
			errors: { add: Object.assign({}, errors), edit: Object.assign({}, errors) },
			actions: [
				{ value: "none", display: "None" },
				{ value: "warn", display: "Warn" },
				{ value: "kick", display: "Kick" },
				{ value: "softban", display: "Softban" },
				{ value: "ban", display: "Ban" },
				{ value: "role", display: "Add Role" }
			],
			insertModel: Object.assign({}, defaultInsert),
			editModel: {}
		};
	},
	async created() {
		const { error, body: { censors, roles } } = await apiCall.get(`censors/${this.$route.params.guild}`);

		if(error) return;
		this.censors = censors;
		this.roles = roles;
		this.loaded = true;
	},
	methods: {
		chunkify(array, size) {
			const chunkified = [];
			for(let i = 0; i < array.length; i += size) chunkified.push(array.slice(i, i + size));
			return chunkified;
		},
		async add() {
			this.errors.add = Object.assign({}, errors);

			const match = this.insertModel.regex.match(/^(?:\/(.+)\/([gimyu]*)|.+)$/);
			try {
				RegExp(match[1] || match[0]);
			} catch(err) {
				this.errors.add.invalidRegex = err.message;
				return;
			}

			$("#add-censor button[type=submit]").addClass("disabled");
			const { error, body: censor } = await apiCall.put(`censors/${this.$route.params.guild}`).send({
				regex: match[1] || match[0],
				flags: match[2] ? match[2].split("") : [],
				action: this.insertModel.action,
				roleID: this.insertModel.action === "role" ? this.insertModel.roleID : undefined,
				message: this.insertModel.message,
				time: this.insertModel.time && ~["role", "ban"].indexOf(this.insertModel.action) ?
					this.insertModel.time :
					undefined
			});

			if(error) return;
			this.censors.push(censor);

			this.insertModel = Object.assign({}, defaultInsert);
			$("#add-censor").trigger("reset");
		},
		async remove() {
			$("#edit-censor button").addClass("disabled");
			const { error } = await apiCall.delete(`censors/${this.$route.params.guild}`)
				.send({ uuid: this.editModel.uuid });

			if(error) return;
			this.censors.splice(this.censors.findIndex(censor => censor.uuid === this.editModel.uuid), 1);
			$("#edit-censor button").removeClass("disabled");
			$("#edit-censor").modal("hide");
		},
		async edit() {
			this.errors.edit = Object.assign({}, errors);

			const match = this.editModel.regex.match(/^(?:\/(.+)\/([gimyu]*)|.+)$/);
			try {
				RegExp(match[1] || match[0]);
			} catch(err) {
				this.errors.edit.invalidRegex = err.message;
				return;
			}

			$("#edit-censor button").addClass("disabled");
			const { error, body: censor } = await apiCall.patch(`censors/${this.$route.params.guild}`).send({
				previous: { uuid: this.editModel.uuid },
				edited: {
					regex: match[1] || match[0],
					flags: match[2] ? match[2].split("") : [],
					action: this.editModel.action,
					roleID: this.editModel.action === "role" ? this.editModel.roleID : undefined,
					message: this.editModel.message
				}
			});

			if(error) return;
			Object.assign(this.censors[this.censors.findIndex(cen => cen.uuid === this.editModel.uuid)], censor);

			$("#edit-censor button").removeClass("disabled");
			$("#edit-censor").modal("hide");
		}
	}
};
</script>