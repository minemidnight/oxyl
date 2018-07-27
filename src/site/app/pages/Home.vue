<template>
	<div style="height:calc(100vh - 80px);overflow:hidden">
		<div class="container-fluid text-center mt-3 mb-5">
			<h1><img src="/static/oxyl-text.svg" style="height:40px" /></h1>
			<h5 class="color-text mb-3">A Discord bot for all your needs</h5>
			<router-link class="discord-button btn m-1 p-2" :to="{ name: 'invite' }">
				<img src="/static/discord-logo.png" />
				<i class="fa fa-sign-in" aria-hidden="true"></i>
			</router-link>
			<router-link class="btn learn-more m-1" :to="{ name: 'features' }">
				Features
			</router-link>
		</div>
		<div class="container">
			<img class="float" src="/static/discord-screen.png" style="width:100%" />
		</div>
	</div>
</template>

<script>
export default {
	async beforeRouteEnter(to, from, next) {
		if(to.query.state) {
			if(!localStorage.token) {
				const { app } = window.opener;

				if(window.opener) {
					if(app.$route.name === "accounts") window.opener.location.reload();
					else app.$router.push({ name: "accounts" });

					window.close();
					return next(false);
				} else {
					return next({ name: "accounts" });
				}
			}

			const { code } = to.query;
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
				return next(false);
			} else {
				return next({ name: "dashboard_premium" });
			}
		} else if(to.query.guild_id) {
			if(!window.opener) return next(false);
			const { app } = window.opener;

			if(app.$route.name === "dashboard") window.opener.location.reload();
			else app.$router.replace({ name: "dashboard", params: { guild: to.query.guild_id } });

			window.close();
			return next(false);
		} else if(to.query.code) {
			const accounts = localStorage.accounts ? JSON.parse(localStorage.accounts) : [];
			const { code } = to.query;
			const { error, body: token } = await apiCall.post("oauth/discord/callback").send({ code });
			if(error) return next(false);

			localStorage.accounts = JSON.stringify(accounts.concat(token));
			if(window.opener) {
				const { app } = window.opener;

				if(app.$route.name === "accounts") window.opener.location.reload();
				else app.$router.replace({ name: "accounts" });

				window.close();
				return next(false);
			} else {
				return next({ name: "accounts" });
			}
		} else {
			return next();
		}
	}
};
</script>

<style lang="scss" scoped>
@import "../variables";
.learn-more, .discord-button {
	transition: 0.25s ease-in-out;
	color: white;

	&:hover {
		transform: scale(1.1);
	}
}

.learn-more {
	background: $color-600;
	font-size: 20px;
	padding: 9px;

	&:hover {
		background: $color-630;
	}
}

.discord-button {
	background: #7289DA;
	font-size: 20px;

	&:hover {
		background: darken(#7289DA, 10);
	}

	& img {
		height: 30px;
	}
}
</style>
