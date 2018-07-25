<template>
	<div>
		<div v-if="loaded">
			<form @submit.prevent="add()">
				<div class="row mb-3">
					<div class="col-sm-12 col-md-6">
						<h4>Add a script</h4>
						<p>Add a script to execute on a trigger</p>
					</div>
					<div class="col-sm-12 col-md-6"></div>
					<div class="col-sm-12 col-md-6">
						<label>
							Script
							<small class="form-text">The script to execute. Links with the <a href="https://script.oxyl.website">Oxylscript Editor</a></small>
						</label>
						<select class="form-control" id="script" v-model="insertModel.scriptID" required>
							<option v-for="(script, index) in userscripts" :key="index" :value="script.id" :selected="script.id === insertModel.scriptID">{{ script.name }}</option>
						</select>
					</div>
					<div class="col-sm-12 col-md-6">
						<label>
							Trigger
							<small class="form-text">The event that must happen to run the script</small>
						</label>
						<select class="form-control" id="event" v-model="insertModel.event" required>
							<option v-for="(value, key) in events" :key="key" :value="key" :selected="key === insertModel.event">{{ value }}</option>
						</select>
					</div>
				</div>

				<button type="submit" class="btn btn-primary">Add script</button>
			</form>

			<h4 class="mt-4" v-if="scripts.length">Current Scripts</h4>
			<div class="card-group" v-for="(scriptChunk, i) in chunkify(scripts, [4, 3, 2].find(size => !(scripts.length % size)) || 4)" :key="i">
				<div class="card color-600 color-hover-630" v-for="(script, index) in scriptChunk" :key="index" :data-index="index">
					<div class="card-body">
						<button class="btn btn-danger float-right" @click="remove(index)">
							<i class="fa fa-trash-o" aria-hidden="true"></i>
						</button>
						<h5 class="card-title">{{ script.name }}</h5>
						<p class="card-text">Trigger: {{ events[script.event] }}</p>
					</div>
				</div>
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
			loaded: false,
			scripts: [],
			userscripts: [],
			insertModel: {},
			events: {
				guildMemberAdd: "member join",
				guildMemberRemove: "member leave",
				customCommand: "custom command",
				guildBanAdd: "ban",
				guildBanRemove: "unban"
			}
		};
	},
	async created() {
		const { error, body: { userscripts, scripts } } = await apiCall.get(`oxylscript/${this.$route.params.guild}`);

		if(error) return;
		this.userscripts = userscripts;
		this.scripts = scripts;
		this.loaded = true;
	},
	methods: {
		chunkify(array, size) {
			const chunkified = [];
			for(let i = 0; i < array.length; i += size) chunkified.push(array.slice(i, i + size));
			return chunkified;
		},
		async add() {
			this.$el.querySelectorAll("form button[type=submit]").forEach(button => {
				button.classList.add("disabled");
				button.disabled = true;
			});

			const { error, body: { script } } = await apiCall
				.put(`oxylscript/${this.$route.params.guild}`)
				.send(this.insertModel);

			this.$el.querySelectorAll("form button[type=submit]").forEach(button => {
				button.classList.remove("disabled");
				button.disabled = false;
			});

			if(error) {
				return;
			} else {
				this.scripts.push(script);
				this.insertModel = {};
				this.$el.querySelector("form").reset();
			}
		},
		async remove(index) {
			this.$el.querySelector(`[data-index="${index}"] button`).classList.add("disabled");
			this.$el.querySelector(`[data-index="${index}"] button`).disabled = true;
			const { error } = await apiCall.delete(`oxylscript/${this.$route.params.guild}`).send({
				scriptID: this.scripts[index].scriptID,
				event: this.scripts[index].event
			});

			if(error) return;
			this.scripts.splice(index, 1);
		}
	}
};
</script>