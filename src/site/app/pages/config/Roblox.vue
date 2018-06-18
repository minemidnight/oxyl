<template>
	<div>
		<form v-if="loaded" id="account-verification" @submit.prevent="update()">
			<div class="row mb-3">
				<div class="col-sm-12 col-md-6">
					<h4>Account Verification</h4>
					<p>Oxyl will give users a certain role after verifying their ROBLOX accounts</p>
				</div>
				<div class="col-sm-12 col-md-6"></div>
				<div class="col-sm-12 col-md-6">
					<label>
						Enabled
						<small class="form-text">Whether or not to enable this</small>
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
				<div class="col-sm-12 col-md-6">
					<label>
						Set Nickname
						<small class="form-text">Whether or not Oxyl should set the user's nickname to their roblox name</small>
					</label>
					<label class="tgl">
						<input type="checkbox" :checked="data.setNickname" v-model="updateModel.setNickname" />
						<span class="tgl_body">
							<span class="tgl_switch"></span>
							<span class="tgl_track">
								<span class="tgl_bgd"></span>
								<span class="tgl_bgd tgl_bgd-negative"></span>
							</span>
						</span>
					</label>
				</div>
				<div class="col-sm-12 col-md-6">
					<div class="form-group">
						<label for="role">
							Role
							<small class="form-text">The Discord role to give the user after they verify their account</small>
						</label>
						<select class="form-control" id="role" v-model="updateModel.roleID" :required="updateModel.enabled">
							<option v-for="(role, index) in roles.filter(({ canGive }) => canGive)" :key="index" :value="role.id" :selected="role.id === data.roleID">{{ role.name }}</option>
						</select>
						<small class="form-text text-muted">Don't see your role? Make sure Oxyl has permission to Manage Roles and that his highest role is above the role you want to give.</small>
					</div>
				</div>
			</div>
			<div class="row">
				<div class="col-sm-12 col-md-6">
					<h4>Group Role Syncing</h4>
					<p>Requires account verification to be enabled. Oxyl will try to assign a role to verified users who are also in the group, based off their rank. The roles should be created by the user, and if the role does not exist, Oxyl does not give the user anything. Only one group is allowed.</p>
				</div>
				<div class="col-sm-12 col-md-6"></div>
				<div class="col-sm-12 col-md-6">
					<div class="form-group">
						<label for="group-id">
							Group ID
							<small class="form-text">The ID of the group to sync roles with. Leave blank to reset</small>
						</label>
						<input id="group-id" class="form-control" placeholder="Enter a group ID" pattern="^[0-9]+$" v-model="updateModel.groupID"/>
					</div>
				</div>
			</div>
			<button type="submit" class="btn btn-success">Save</button>
		</form>
		<div v-else class="mt-4 loading">
			<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
			loaded: false,
			roles: [],
			data: [],
			updateModel: {}
		};
	},
	async created() {
		const { error, body } = await apiCall.get(`roblox/${this.$route.params.guild}`);

		if(error) return;
		this.roles = body.roles;
		delete body.roles;

		this.data = body;
		this.updateModel = Object.assign({}, this.data);
		this.loaded = true;
	},
	methods: {
		async update() {
			this.$el.querySelectorAll("form button[type=submit]").forEach(button => {
				button.classList.add("disabled");
				button.disabled = true;
			});

			const { error } = await apiCall
				.put(`roblox/${this.$route.params.guild}`)
				.send(this.updateModel);

			if(error) return;

			this.$el.querySelectorAll("form button[type=submit]").forEach(button => {
				button.classList.remove("disabled");
				button.disabled = false;
			});
		}
	}
};
</script>