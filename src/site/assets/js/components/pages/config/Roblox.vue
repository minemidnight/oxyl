<template>
	<div>
		<div v-if="loaded">
			<form id="add-sub" @submit.prevent>
				<h4>
					Account Verification
					<i class="fa fa-info-circle" aria-hidden="true" data-toggle="popover" data-trigger="focus" data-content="Oxyl will give users a certain role after verifying their ROBLOX accounts"></i>	
				</h4>
				<div class="form-check">
					<label>
						Enabled
						<small class="form-text">Whether or not to enable this</small>
					</label>
					<label class="tgl">
						<input type="checkbox" />
						<span class="tgl_body">
							<span class="tgl_switch"></span>
							<span class="tgl_track">
								<span class="tgl_bgd"></span>
								<span class="tgl_bgd tgl_bgd-negative"></span>
							</span>
						</span>
					</label>
				</div>
				<div class="form-check">
					<label>
						Set Nickname
						<small class="form-text">Whether or not Oxyl should set the user's nickname to their roblox name</small>
					</label>
					<label class="tgl">
						<input type="checkbox" checked />
						<span class="tgl_body">
							<span class="tgl_switch"></span>
							<span class="tgl_track">
								<span class="tgl_bgd"></span>
								<span class="tgl_bgd tgl_bgd-negative"></span>
							</span>
						</span>
					</label>
				</div>
				<div class="form-group">
					<label for="role">
						Role
						<small class="form-text">What role Oxyl should give to a user after verifying</small>
					</label>
					<select class="form-control" id="role">
						<option v-for="(role, index) in roles.filter(({ canGive }) => canGive)" :key="index" :value="role.id">#{{ role.name }}</option>
					</select>
					<small class="form-text text-muted">Don't see your role? Make sure Oxyl has permission to Manage Roles and that his highest role is above the role you want to give.</small>
				</div>
				<button type="submit" class="btn btn-primary">Update Settings</button>
			</form>
			<form id="group-sync" @submit.prevent>
				<h4>Group Role Syncing</h4>
				<p>Requires account verification to be enabled. Oxyl will try to assign a role to verified users who are also in the group, based off their rank. The roles should be created by the user, and if the role does not exist, Oxyl does not give the user anything. Only one group is allowed.</p>
				<div class="form-group">
					<label for="group-id">
						Group ID
						<small class="form-text">The ID of the group to sync roles with</small>
					</label>
					<input id="group-id" class="form-control" placeholder="Enter a group ID" required pattern="^[0-9]+$" />
					<small class="form-text text-danger" v-if="errors.group.invalidGroup">Please enter a valid group ID.</small>
				</div>
				<button type="submit" class="btn btn-primary">Add Group</button>
			</form>
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
			loaded: false,
			errors: { group: {} },
			roles: []
		};
	},
	async created() {
		this.loaded = true;
	}
};
</script>