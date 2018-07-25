<template>
	<div class="row">
		<div class="col-sm-12 col-md-3 col-lg-2">
			<div class="card color-600 mb-4">
				<img class="card-img-top" :src="`https://cdn.discordapp.com/avatars/155112606661607425/${info.avatar}.jpg?size=256`">
				<div class="card-body">
					<p class="card-text">{{ info.username }}#{{ info.discriminator }}</p>
					<button type="button" class="btn btn-outline-danger float-right" @click="logout()">
						<i class="fa fa-sign-out" aria-hidden="true"></i>
					</button>
				</div>
			</div>
			<div class="card color-600 mb-4">
				<div class="card-body">
					<h5 class="card-title">Create Script</h5>
					<form @submit.prevent="createScript()">
						<div class="form-group">
							<label for="scriptName">Name</label>
							<input type="text" class="form-control" id="scriptName" placeholder="Ban command" v-model="scriptOptions.name" />
							<small class="form-text text-muted">The name of the script to show up on this dashboard. You can change this later on.</small>
						</div>

						<button type="submit" class="btn btn-outline-primary float-right">
							<i class="fa fa-plus" aria-hidden="true"></i>
						</button>
					</form>
				</div>
			</div>
		</div>
		<div class="col-sm-12 col-md-9 col-lg-10">
			<div class="table-responsive">
				<table class="table">
					<col width="55%" />
					<col width="25%" />
					<col width="10%" />
					<col width="10%" />
					<thead>
						<tr>
							<th>Name</th>
							<th>Last Updated</th>
							<th>Lines</th>
							<th class="text-center">Delete</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="(script, i) in scripts" :key="i" @click="$router.push({ name: 'editor', params: { id: script.id } })">
							<td>{{ script.name }}</td>
							<td>{{ new Date(script.lastUpdated).toLocaleString() }}</td>
							<td>{{ script.lineCount }}</td>
							<td class="text-center">
								<button type="button" class="btn btn-outline-danger" @click.stop="deleteScript(script.id)">
									<i class="fa fa-trash-o" aria-hidden="true"></i>
								</button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
@import "../variables";
table {
	color: $color-text;

	thead {
		background-color: $color-700;

		th {
			border-top: none;
			border-bottom: 1px solid $color-400;
		}
	}

	tr:first-child {
		:first-child {
			border-top-left-radius: 0.25rem;
		}

		:last-child {
			border-top-right-radius: 0.25rem;
		}
	}

	tr:last-child {
		:first-child {
			border-bottom-left-radius: 0.25rem;
		}

		:last-child {
			border-bottom-right-radius: 0.25rem;
		}
	}

	th, td {
		border-top: 1px solid $color-400;
	}

	tbody {
		background-color: $color-600;

		> tr {
			cursor: pointer;
			transition: 0.25s;

			&:hover {
				background-color: $color-630;
			}
		}
	}
}

input, select {
	max-width: 420px;
	transition: 0.4s ease-in-out !important;
	border: none !important;
	background: $color-700 !important;
	color: rgba(255, 255, 255, 0.8) !important;
	outline: none !important;

	&[disabled] {
		background: $color-800 !important;
		cursor: not-allowed;
	}

	&:focus:not([disabled]), &:hover:not([disabled]) {
		max-width: 720px;
		color: white !important;
		background: $color-800 !important;
	}
}
</style>

<script>
export default {
	data() {
		return {
			info: JSON.parse(sessionStorage.info),
			scriptOptions: {},
			scripts: []
		};
	},
	async created() {
		const { error, body: { scripts } } = await apiCall.get("scripts/");

		if(error) this.logout();
		else this.scripts = scripts;
	},
	methods: {
		logout() {
			delete localStorage.token;
			delete sessionStorage.info;

			this.$router.push({ name: "home" });
		},
		async deleteScript(id) {
			this.scripts.splice(this.scripts.findIndex(script => script.id === id), 1);
			await apiCall.delete(`scripts/${id}`);
		},
		async createScript() {
			const { body: { script } } = await apiCall.put("scripts/")
				.send({ name: this.scriptOptions.name });

			this.$router.push({ name: "editor", params: { id: script.id } });
		}
	}
};
</script>
