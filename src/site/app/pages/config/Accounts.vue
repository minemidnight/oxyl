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
				<a class="list-group-item list-group-item-action text-light color-630 color-hover-700 transition" @click="openPopup()">
					<i class="fa fa-plus" aria-hidden="true"></i>
					Add account
				</a>
			</div>
		</div>
		<div v-else class="mt-4 loading">
			<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
			accountData: [],
			selected: null,
			loaded: false,
			clientID: null
		};
	},
	async created() {
		const updatedAccounts = [];
		const accounts = localStorage.accounts ? JSON.parse(localStorage.accounts) : [];
		for(const account of accounts) {
			const { error, body, token } = await apiCall.get("oauth/discord/info")
				.token(account)
				.query({ path: "/users/@me" });

			if(error) continue;
			updatedAccounts.push(token || account);
			this.accountData.push(body);
		}

		localStorage.accounts = JSON.stringify(updatedAccounts);

		const { body: { clientID } } = await apiCall.get("oauth/discord/clientid");
		this.clientID = clientID;

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
		},
		openPopup() {
			const url = "https://discordapp.com/oauth2/authorize?response_type=code" +
						`&redirect_uri=${encodeURIComponent(window.location.origin)}` +
						`&scope=identify+guilds&client_id=${this.clientID}`;
			const options = `dependent=yes,width=500,height=${window.innerHeight}`;

			const popup = window.open(url, "_blank", options);
			if(!popup) window.location = url;
			else popup.focus();
		}
	}
};
</script>