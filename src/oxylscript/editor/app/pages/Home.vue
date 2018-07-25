<template>
	<div class="mt-0 display-1 d-flex justify-content-center align-items-center flex-column rubber" style="height:100vh">
		<p v-scroll-reveal="{ delay: 250, duration: 2500 }">&lt;/&gt;</p>
		<h1 class="display-1" v-scroll-reveal="{ delay: 750, duration: 2000 }">Oxylscript</h1>

		<div v-scroll-reveal="{ delay: 1250, duration: 1500 }">
			<button type="button" class="discord-button btn m-1 py-1 px-2 d-flex align-items-center" @click="login()">
				<img src="/static/discord-logo.svg" class="mr-2" />
				<div class="d-flex justify-content-center align-items-center flex-column">
					<p class="m-0">Log in with</p>
					<img src="/static/discord-wordmark.svg" />
				</div>
			</button>
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return { clientID: null };
	},
	async beforeRouteEnter(to, from, next) {
		if(to.query.code) {
			const { error, body: token } = await apiCall.post("oauth/discord/callback")
				.send({ code: to.query.code });

			if(error) return next(false);
			else localStorage.token = JSON.stringify(token);

			if(window.opener) {
				const { app } = window.opener;

				if(app.$route.name === "dashboard") window.opener.location.reload();
				else app.$router.replace({ name: "dashboard" });

				window.close();
				return next(false);
			} else {
				return next({ name: "dashboard" });
			}
		} else if(localStorage.token) {
			return next({ name: "dashboard" });
		} else {
			return next();
		}
	},
	async created() {
		const { body: { clientID } } = await apiCall.get("oauth/discord/clientid");
		this.clientID = clientID;
	},
	methods: {
		login() {
			const url = "https://discordapp.com/oauth2/authorize?response_type=code" +
						`&redirect_uri=${encodeURIComponent(window.location.origin)}` +
						`&scope=identify&client_id=${this.clientID}`;
			const options = `dependent=yes,width=500,height=${window.innerHeight}`;

			const popup = window.open(url, "_blank", options);
			if(!popup) window.location = url;
			else popup.focus();
		}
	}
};
</script>


<style lang="scss" scoped>
@font-face {
	font-family: "Rubber";
	src: url("/static/Rubber.ttf") format("truetype");
	font-style: normal;
}

.rubber {
	font-family: Rubber, Arial, sans-serif;
}

.discord-button {
	transition: 0.25s ease-in-out;
	color: white;
	background: #7289DA;
	font-size: 24px;
	letter-spacing: -1px;

	&:hover {
		background: darken(#7289DA, 10);
		transform: scale(1.1);
	}

	& div > img {
		height: 32px;
	}

	& > img {
		height: 72px;
	}
}
</style>
