<template>
	<div>
		<div v-if="loaded">
			<div class="row">
				<div class="col-sm-12 col-md-6">
					<h4>Premium</h4>
					<p>Oxyl Premium is a great way to enhance Oxyl in your server, as well as supporting it's development at the same time</p>
					<h6>Premium Features</h6>
					<ul>
						<li>Donator Role + Donator Channel in Support Server</li>
						<li>Volume Control</li>
					</ul>
				</div>
				<div class="col-sm-12 col-md-6">
					<h5>Obtaining Oxyl Premium</h5>
					<p>To get Oxyl Premium, you must link your Patreon to your Discord account (click the button below). For every dollar you donate, you will be able to enable premium features on a server.</p>
				</div>
				<div class="col-sm-12 col-md-3"></div>
				<div class="col-sm-12 col-md-6 text-center" v-if="!data.linked">
					<button type="button" class="btn btn-info" @click="openPopup()">
						Link Patreon
					</button>
				</div>
				<div class="col-sm-12 col-md-6 text-center" v-else-if="!data.pledge">
					<router-link :to="{ name: 'patreon' }">
						<img class="patron-button" src="/static/become_patron.png" />
					</router-link>
				</div>
				<div class="col-sm-12 col-md-6 text-center" v-else-if="data.activator === data.self">
					<button type="button" class="btn btn-danger" @click="setPremium(false)">
						Disable Premium
					</button>
				</div>
				<div class="col-sm-12 col-md-6 text-center" v-else-if="!data.premium && data.serversRemaining">
					<button type="button" class="btn btn-success" @click="setPremium(true)">
						Enable Premium
					</button>
				</div>
				<div class="col-sm-12 col-md-6 text-center" v-else-if="data.premium && data.activator">
					<p>Premium is already actived by another user in this server</p>
				</div>
				<div class="col-sm-12 col-md-6 text-center" v-else-if="!data.serversRemaining">
					<p>You do not have any remaining premium servers</p>
				</div>
				<div class="col-sm-12 col-md-3"></div>
				<div class="col-sm-12 col-md-3"></div>
				<div class="col-sm-12 col-md-6 text-center mt-3" v-if="data.pledge">
					<p>{{ data.serversRemaining }} Servers Remaining</p>
				</div>
			</div>
		</div>
		<div v-else class="mt-4 loading">
			<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>
		</div>
	</div>
</template>

<style lang="scss" scoped>
@import "../../variables";
@keyframes zoom {
    from { transform: scale(1); }
    to { transform: scale(1.1); }
}

.patron-button {
	animation-name: zoom;
	animation-duration: 0.5s;
	animation-iteration-count: infinite;
	animation-direction: alternate;
}
</style>


<script>
export default {
	data() {
		return {
			clientID: null,
			loaded: false,
			data: {}
		};
	},
	async created() {
		const { error, body } = await apiCall
			.get(`premium/${this.$route.params.guild}`);

		if(error) return;
		this.data = body;

		const { body: { clientID } } = await apiCall.get("oauth/patreon/clientid");
		this.clientID = clientID;

		this.loaded = true;
	},
	methods: {
		openPopup() {
			const url = "https://www.patreon.com/oauth2/authorize?response_type=code" +
						`&redirect_uri=${encodeURIComponent(window.location.origin)}` +
						`&client_id=${encodeURIComponent(this.clientID)}&state=patreon`;
			const options = `dependent=yes,width=500,height=${window.innerHeight}`;

			const popup = window.open(url, "_blank", options);
			if(!popup) window.location = url;
			else popup.focus();
		},
		async setPremium(enabled) {
			this.$el.querySelectorAll("button").forEach(button => {
				button.classList.add("disabled");
				button.disabled = true;
			});

			const { error } = await apiCall
				.put(`premium/${this.$route.params.guild}`)
				.send({ enabled });

			if(error) return;

			this.data.premium = enabled;
			if(enabled) {
				this.serversRemaining--;
				this.activator = this.self;
			} else {
				this.serversRemaining--;
				this.activator = null;
			}

			this.$el.querySelectorAll("button").forEach(button => {
				button.classList.remove("disabled");
				button.disabled = false;
			});
		}
	}
};
</script>