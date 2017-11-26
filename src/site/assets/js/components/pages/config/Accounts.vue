<template>
	<div>
		<div class="container" v-if="loaded">
			<div class="list-group">
				<button class="list-group-item list-group-item-action text-light color-600 color-hover-700 transition" v-for="(account, index) in accountData" :key="index" @click="selected = account.id">
					{{ account.username }}#{{ account.discriminator }}
					<button class="btn btn-danger float-right" @click.stop="removeAccount(account.id)">
						<i class="fa fa-trash-o" aria-hidden="true"></i>
					</button>
				</button>
				<router-link class="list-group-item list-group-item-action text-light color-630 color-hover-700 transition" :to="{ name: 'oauth' }">
					<i class="fa fa-plus" aria-hidden="true"></i>
					Add account
				</router-link>
			</div>
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
			accountData: [],
			selected: null,
			loaded: false
		};
	},
	async created() {
		const updatedAccounts = [];
		const accounts = localStorage.accounts ? JSON.parse(localStorage.accounts) : [];
		for(const account of accounts) {
			const { error, body, token } = await apiCall.get("oauth/info")
				.token(account)
				.query({ path: "/users/@me" });

			if(error) return;

			updatedAccounts.push(token || account);
			this.accountData.push(body);
		}

		localStorage.accounts = JSON.stringify(updatedAccounts);
		this.loaded = true;
	},
	watch: {
		selected(id) {
			const accounts = localStorage.accounts ? JSON.parse(localStorage.accounts) : [];
			localStorage.token = JSON.stringify(accounts[this.accountData.findIndex(data => data.id === id)]);
			this.$router.push({ name: "selector" });
		}
	},
	methods: {
		removeAccount(id) {
			const accounts = localStorage.accounts ? JSON.parse(localStorage.accounts) : [];
			accounts.splice(accounts.findIndex(data => data.id === id), 1);
			this.accountData.splice(this.accountData.findIndex(data => data.id === id), 1);
			localStorage.accounts = JSON.stringify(accounts);
		}
	}
};
</script>