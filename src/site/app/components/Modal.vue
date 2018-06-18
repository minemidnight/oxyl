<template>
	<div class="modal fade" role="dialog" aria-hidden="true" :class="{ show: shown }" @keydown.esc="close()">
		<div class="modal-dialog modal-dialog-centered" role="document">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title">
						<slot name="header" />
					</h5>
					<button v-if="closeable" type="button" class="close" data-dismiss aria-label="Close">
						<span aria-hidden="true">&times;</span>
					</button>
				</div>
				<div class="modal-body">
					<slot />
				</div>
				<div class="modal-footer" v-if="$slots.footer">
					<slot name="footer" />
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.modal.show {
	display: block;
}
</style>


<script>
module.exports = {
	props: {
		closeable: {
			default: true,
			type: Boolean
		}
	},
	data() {
		const backdrop = document.createElement("div");
		backdrop.classList.add("modal-backdrop");
		backdrop.classList.add("fade");
		return {
			backdrop,
			shown: false
		};
	},
	async mounted() {
		await this.$nextTick();
		if(this.closeable) {
			this.$el.querySelectorAll("[data-dismiss]").forEach(element => {
				element.addEventListener("click", this.close.bind(this));
			});
			this.$el.addEventListener("click", event => {
				if(event.target === this.$el) this.close();
			});
		}
	},
	methods: {
		show() {
			if(this.shown) return;
			this.shown = true;
			if(this.$el.querySelector("[autofocus]")) this.$el.querySelector("[autofocus]").focus();
			this.animate("show");
		},
		close() {
			if(!this.shown) return;
			this.shown = false;
			this.animate("hide");
		},
		async animate(type) {
			if(type === "show") {
				document.body.appendChild(this.backdrop);
				await this.$nextTick();
				this.backdrop.focus();
				this.backdrop.classList.add("show");
			} else if(type === "hide") {
				this.backdrop.classList.remove("show");
				await new Promise(resolve => setTimeout(resolve, 200));
				this.backdrop.remove();
			}
		}
	},
	destroyed() {
		this.close();
	}
};
</script>