<template>
	<div>
		<div class="container-fluid" v-if="loaded">
			<router-link class="switch-account my-2" :to="{ name: 'accounts' }">
				<i class="fa fa-chevron-left pr-1" aria-hidden="true"></i>
				Switch Account
			</router-link>
			<div class="card-group my-2" :key="i" v-for="(guildGroup, i) in chunkify(guilds, [4, 3, 2].find(size => !(guilds.length % size)) || 4)">
				<a class="card color-600 color-hover-630 color-text color-text-hover-100 guild transition no-decoration" style="cursor:pointer" :key="index" v-for="(guild, index) in guildGroup" @click="openPopup(guild)">
					<div class="card-body d-flex align-items-center">
						<h4 class="card-title text-truncate">{{ guild.name }}</h4>
						<img v-if="guild.icon" class="rounded-circle ml-auto" :src="`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`" style="max-height:96px;max-width:96px" />
					</div>
				</a>
			</div>
			<small class="text-muted">Missing guilds? You must have the Manage Server permission to use the dashboard for a guild.</small>
		</div>
		<div v-else class="mt-4 loading">
			<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>
		</div>
	</div>
</template>

<script>
import createNotification from "../../createNotification";

export default {
	data() {
		return {
			guilds: [],
			loaded: false
		};
	},
	async created() {
		const { body: { email, dm } } = await apiCall.get("newsletter");

		if(email === null && dm === null) {
			const notification = createNotification([
				app.$createElement("p",
					{ class: ["card-text"] },
					"Would you like to sign up for our newsletter to recieve updates about Oxyl?"),
				app.$createElement("div", { class: ["text-center"] }, [
					app.$createElement("a", {
						class: ["btn", "btn-outline-success", "mx-1"],
						on: {
							click() {
								notification.$el.remove();
								notification.$destroy();

								const options = createNotification([
									app.$createElement("p",
										{ class: ["card-text"] },
										"How would you like to get these notifications?"),
									app.$createElement("div", { class: ["form-check"] }, [
										app.$createElement("input", {
											attrs: { type: "checkbox", id: "email" },
											class: ["form-check-input"]
										}),
										app.$createElement("label", {
											attrs: { for: "email" },
											class: ["form-check-label"]
										}, "Email")
									]),
									app.$createElement("div", { class: ["form-check"] }, [
										app.$createElement("input", {
											attrs: { type: "checkbox", id: "dm" },
											class: ["form-check-input"]
										}),
										app.$createElement("label", {
											attrs: { for: "dm" },
											class: ["form-check-label"]
										}, "Discord Direct Message")
									]),
									app.$createElement("div", { class: ["text-center"] }, [
										app.$createElement("a", {
											class: ["btn", "btn-outline-primary", "mt-3"],
											on: {
												async click() {
													options.$el.remove();
													options.$destroy();

													await apiCall.put("newsletter").send({
														email: options.$el.querySelector("#email").checked,
														dm: options.$el.querySelector("#dm").checked
													});
												}
											}
										}, "Confirm")
									])
								]);
							}
						}
					}, "Yes"),
					app.$createElement("a", {
						class: ["btn", "btn-outline-danger", "mx-1"],
						on: {
							click() {
								notification.$el.remove();
								notification.$destroy();
							}
						}
					}, "No")
				])
			]);
		}

		const { error, body: guilds } = await apiCall.get("oauth/discord/info")
			.query({ path: "/users/@me/guilds" });
		if(error) return;

		this.guilds = guilds.filter(({ owner, permissions }) => owner || permissions & 32);
		const { body: { clientID } } = await apiCall.get("oauth/discord/clientid");
		this.clientID = clientID;

		this.loaded = true;
	},
	methods: {
		chunkify(array, size) {
			const chunkified = [];
			for(let i = 0; i < array.length; i += size) chunkified.push(array.slice(i, i + size));
			return chunkified;
		},
		openPopup(guild) {
			if(!guild.needsInvite) {
				this.$router.push({ name: "dashboard", params: { guild: guild.id } });
				return;
			}

			const url = `https://discordapp.com/oauth2/authorize?client_id=${this.clientID}&scope=bot&response_type=code` +
				`&permissions=298183686&redirect_uri=${encodeURIComponent(window.location.origin)}&guild_id=${guild.id}`;
			const options = `dependent=yes,width=500,height=${window.innerHeight}`;

			const popup = window.open(url, "_blank", options);
			if(!popup) window.location = url;
			else popup.focus();
		}
	}
};
</script>

<style lang="scss" scoped>
@import "../../variables";
.switch-account {
	color: rgba(255, 255, 255, 0.8);
	transition: 0.25s ease-in;
	text-decoration: none;
	border-radius: 4px;
	background: $color-600;
	padding: 0.5rem;
		
	&:hover {
		color: white;
		background: $color-630;
	}
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3) translate3d(0, 0, 0);
  }

  50% {
    opacity: 0.9;
    transform: scale(1.1);
  }
  80% {
    opacity: 1;
    transform: scale(0.89);
  }

  100% {
    opacity: 1;
    transform: scale(1) translate3d(0, 0, 0);
  }
}

.guild {
	animation-name: bounceIn;
	animation-duration: 0.75s;
}
</style>
