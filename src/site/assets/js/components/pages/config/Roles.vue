<template>
	<div>
		<form v-if="loaded" @submit.prevent="update()">
			<h4>Autorole</h4>
			<p>Roles automatically added to a user when they join the server</p>
			<div class="form-group">
				<div class="row" id="autorole">
					<div class="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-3" v-for="(role, index) in roles.filter(({ canGive }) => canGive)" :key="index">
						<label class="form-check-label">
							<input type="checkbox" class="form-check-input" v-model="updateModel.autoRole" :value="role.id" :checked="~autoRole.indexOf(role.id)">
							{{ role.name }}
						</label>
					</div>
				</div>
			</div>
			<h4>Roleme</h4>
			<p>Roles that a user can recieve by using the roleme command</p>
			<div class="form-group">
				<div class="row" id="roleme">
					<div class="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-3" v-for="(role, index) in roles.filter(({ canGive }) => canGive)" :key="index">
						<label class="form-check-label">
							<input type="checkbox" class="form-check-input" v-model="updateModel.roleMe" :value="role.id" :checked="~roleMe.indexOf(role.id)">
							{{ role.name }}
						</label>
					</div>
				</div>
			</div>
			<h4>Role Persist</h4>
			<p>Roles that are persisted; if a user leaves the server with an enabled role and joins back, they will get the role again</p>
			<div class="form-group">
				<div class="row" id="persist">
					<div class="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-3" v-for="(role, index) in roles.filter(({ canGive }) => canGive)" :key="index">
						<label class="form-check-label">
							<input type="checkbox" class="form-check-input" v-model="updateModel.rolePersist" :value="role.id" :checked="~rolePersist.indexOf(role.id)">
							{{ role.name }}
						</label>
					</div>
				</div>
			</div>
			<p class="form-text text-muted">Don't see your role(s)? Make sure Oxyl has permission to Manage Roles and that his highest role is above the role you want to give.</p>
			<button type="submit" class="btn btn-success">Save All</button>
		</form>
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
			autoRole: [],
			roleMe: [],
			rolePersist: [],
			roles: [],
			updateModel: { autoRole: [], roleMe: [], rolePersist: [] }
		};
	},
	async created() {
		const { error, body } = await apiCall
			.get(`roles/${this.$route.params.guild}`);

		if(error) return;
		Object.assign(this, body);
		delete body.roles;
		this.updateModel = Object.assign(this.updateModel, body);
		this.loaded = true;
	},
	methods: {
		async update() {
			$("form button[type=submit]").addClass("disabled");

			const { error } = await apiCall
				.put(`roles/${this.$route.params.guild}`)
				.send(this.updateModel);

			if(error) return;
			$("form button[type=submit]").removeClass("disabled");
		}
	}
};
</script>