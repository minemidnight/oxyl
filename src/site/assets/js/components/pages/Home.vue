<template>
	<div>
		Home
	</div>
</template>

<script>
module.exports = {
	async created() {
		if(this.$route.query.state) {
			if(!localStorage.token) {
				const { app } = window.opener;

				if(window.opener) {
					if(app.$route.name === "accounts") window.opener.location.reload();
					else app.$router.push({ name: "accounts" });

					window.close();
				} else {
					this.$router.replace({ name: "accounts" });
				}

				return;
			}

			const { code } = this.$route.query;
			await apiCall.post("oauth/patreon/callback")
				.send({
					discordToken: JSON.parse(localStorage.token),
					code
				});

			if(window.opener) {
				const { app } = window.opener;

				if(app.$route.name === "dashboard_premium") window.opener.location.reload();
				else app.$router.push({ name: "dashboard_premium" });

				window.close();
			} else {
				this.$router.replace({ name: "dashboard_premium" });
			}
		} else if(this.$route.query.guild_id) {
			if(!window.opener) return;
			const { app } = window.opener;

			if(app.$route.name === "dashboard") window.opener.location.reload();
			else app.$router.replace({ name: "dashboard", params: { guild: this.$route.query.guild_id } });

			window.close();
		} else if(this.$route.query.code) {
			const accounts = localStorage.accounts ? JSON.parse(localStorage.accounts) : [];
			const { code } = this.$route.query;
			const { error, body: token } = await apiCall.post("oauth/discord/callback").send({ code });
			if(error) return;

			localStorage.accounts = JSON.stringify(accounts.concat(token));
			if(window.opener) {
				const { app } = window.opener;

				if(app.$route.name === "accounts") window.opener.location.reload();
				else app.$router.replace({ name: "accounts" });

				window.close();
			} else {
				this.$router.replace({ name: "accounts" });
			}
		}
	}
};
</script>