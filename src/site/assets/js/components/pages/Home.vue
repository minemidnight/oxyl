<template>
	<div>
		Home
	</div>
</template>

<script>
module.exports = {
	async created() {
		if(this.$route.query.code) {
			const accounts = localStorage.accounts ? JSON.parse(localStorage.accounts) : [];
			const { code } = this.$route.query;
			const { error, body: token } = await apiCall.post("oauth/callback").send({ code });
			if(error) return;

			localStorage.accounts = JSON.stringify(accounts.concat(token));
			this.$router.replace({ name: "accounts" });
		}
	}
};
</script>