<template>
	<div>
		<div class="container" v-if="loaded">
			<div class="list-group">
				<button class="list-group-item list-group-item-action text-light color-600 color-hover-700 transition" v-for="(account, index) in accountData" :key="index" @click="selected = account.id">
					{{ account.username }}#{{ account.discriminator }}
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
			accounts: localStorage.accounts ? JSON.parse(localStorage.accounts) : [],
			accountData: [],
			selected: null,
			loaded: false
		};
	},
	async created() {
		const updatedAccounts = [];
		for(let i = 0; i < this.accounts.length; i++) {
			const { error, body, token } = await apiCall("get", "oauth/info", {
				query: { path: "/users/@me" },
				token: this.accounts[i]
			});

			if(token) {
				updatedAccounts.push(token);
			} else if(!error) {
				updatedAccounts.push(this.accounts[i]);
				this.accountData.push(body);
			}
		}

		this.accounts = updatedAccounts;
		this.loaded = true;
		localStorage.accounts = JSON.stringify(this.accounts);
	},
	watch: {
		selected(id) {
			localStorage.token = JSON.stringify(this.accounts[this.accountData.findIndex(data => data.id === id)]);
			this.$router.push({ name: "selector" });
		}
	}
};
</script>