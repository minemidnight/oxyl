<template>
	<div>
		<form v-if="loaded" @submit.prevent="update()">
			<h4>Userlog</h4>
			<p>Oxyl will create welcome or farewell messages in a certain channel</p>
			<div class="form-check">
				<label>
					Enabled
					<small class="form-text">Whether or not to enable this</small>
				</label>
				<label class="tgl">
					<input type="checkbox" v-model="updateModel.enabled" :checked="data.enabled" />
					<span class="tgl_body">
						<span class="tgl_switch"></span>
						<span class="tgl_track">
							<span class="tgl_bgd"></span>
							<span class="tgl_bgd tgl_bgd-negative"></span>
						</span>
					</span>
				</label>
			</div>
			<div class="form-group">
				<label for="channel">
					Channel
					<small class="form-text">What Discord channel to post greetings and farewells</small>
				</label>
				<select class="form-control" id="channel" v-model="updateModel.channelID" required>
					<option v-for="(channel, index) in channels.filter(({ canSend }) => canSend)" :selected="channel.id === data.channelID" :key="index" :value="channel.id">#{{ channel.name }}</option>
				</select>
				<small class="form-text text-muted">Don't see your channel? Make sure Oxyl has permission to Send Messages and Read Messages in that channel.</small>
			</div>
			<div class="form-group">
				<label for="greeting">
					Greeting Message
					<small class="form-text" v-pre>The greeting message. Placeholders {{id}}, {{discrim}}, {{mention}} and {{username}} will be replaced accordingly.</small>
				</label>
				<input id="greeting" class="form-control" :placeholder="'Welcome {{mention}} to the server'" v-model.trim="updateModel.greeting" :value="data.greeting" />
			</div>
			<div class="form-check">
				<label>
					DM Greeting
					<small class="form-text">Whether or not Oxyl should DM the user the greeting message</small>
				</label>
				<label class="tgl">
					<input type="checkbox" :value="data.dmGreeting" v-model="updateModel.dmGreeting" />
					<span class="tgl_body">
						<span class="tgl_switch"></span>
						<span class="tgl_track">
							<span class="tgl_bgd"></span>
							<span class="tgl_bgd tgl_bgd-negative"></span>
						</span>
					</span>
				</label>
			</div>
			<div class="form-group">
				<label for="farewell">
					Farewell
					<small class="form-text" v-pre>The farewell message. Placeholders {{id}}, {{discrim}}, {{mention}} and {{username}} will be replaced accordingly.</small>
				</label>
				<input id="farewell" class="form-control" :placeholder="'Welcome {{mention}} to the server'" v-model.trim="updateModel.farewell" :value="data.farewell" />
			</div>
			<button type="submit" class="btn btn-success">Save</button>
		</form>
		<div v-else class="d-flex justify-content-center mt-4">
			<i class="fa fa-spinner fa-spin" aria-hidden="true" style="font-size:48px"></i>
		</div>
	</div>
</template>

<script>
module.exports = {
	data() {
		return {
			loaded: false,
			channels: [],
			data: {},
			updateModel: {}
		};
	},
	async created() {
		const { error, body } = await apiCall.get(`userlog/${this.$route.params.guild}`);

		if(error) return;
		this.channels = body.channels;
		delete body.channels;

		this.data = body;
		this.updateModel = Object.assign({}, this.data);
		this.loaded = true;
	},
	methods: {
		async update() {
			$("form button[type=submit]").addClass("disabled");

			const { error } = await apiCall
				.put(`userlog/${this.$route.params.guild}`)
				.send(this.updateModel);

			if(error) return;
			$("form button[type=submit]").removeClass("disabled");
		}
	}
};
</script>