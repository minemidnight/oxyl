<template>
	<div>
		<div v-if="loaded">
			<h4>Edit Categories</h4>
			<p>Click a category to edit if it's commands are enabled, who they can be used by, and where they can be used</p>
			<div class="card-group" v-for="(cats, i) in chunkify(categories,  [4, 3, 2].find(size => !(categories.length % size)) || 4)" :key="i">
				<div class="card color-600 color-hover-630" v-for="(category, index) in cats" :key="index" data-toggle="modal" data-target="#edit" @click="currentEdit = ['category', index]">
					<div class="card-body">
						<h5 class="card-title">{{ category.name.charAt(0).toUpperCase() + category.name.substring(1) }}</h5>
					</div>
				</div>
			</div>
			<h4>Edit Commands</h4>
			<p>Click a command to edit if it is usable, who it can be used by, and where it can be used</p>
			<div class="card-group" v-for="(cmds, i) in chunkify(commands,  [4, 3, 2].find(size => !(categories.length % size)) || 4)" :key="i">
				<div class="card color-600 color-hover-630" v-for="(command, index) in cmds" :key="index" data-toggle="modal" data-target="#edit" @click="currentEdit = ['category', index]">
					<div class="card-body">
						<h5 class="card-title">{{ command.name }}</h5>
					</div>
				</div>
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
			loaded: false,
			currentEdit: null,
			categores: [],
			commands: []
		};
	},
	async created() {
		this.loaded = true;
	}
};
</script>