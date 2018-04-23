<template>
	<div class="color-text form-group">
		<div class="container-fluid main rounded p-1">
			<ul>
				<li class="role" v-for="(roleID, index) in value" :key="index">
					<button type="button" @click="removeRole(roleID)"><span>x</span></button>
					{{ roles.find(role => role.id === roleID).name }}
				</li>

				<li>
					<div class="dropdown">
						<button type="button" id="add-role" class="dropdown-toggle color-text" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
							<i class="fa fa-plus-circle" aria-hidden="true"></i>
						</button>

						<div class="dropdown-menu" aria-labelledby="add-role">
							<button type="button" class="dropdown-item" v-for="(role, index) in roles.filter(role => !~value.indexOf(role.id))" :key="index" @click="addRole(role)">{{role.name}}</button>
						</div>
					</div>
				</li>
			</ul>
		</div>
	</div>
</template>

<style lang="scss" scoped>
@import "../../../scss/_variables";

div.main {
	background: $color-600;
	border: 1px solid $color-800;

	& ul {
		list-style: none;
		margin: 0;
		padding: 1px;

		& li {
			display: inline-block;
			margin: 1px 2px;
		}
	}
}

.role {
	border-radius: 12px;
	border: 1px solid $color-800;
	background: $color-630;
	padding: 2px 6px;
	font-size: 14px;

	& button {
		outline: none;
		border: none;
		background: $color-400;
		border-radius: 50%;
		width: 15px;
		height: 15px;
		margin-top: 2px;
		margin-right: 4px;
		float: left;
		cursor: pointer;
		position: relative;

		& span {
			opacity: 0;
			color: white;
			position: absolute;
			top: -3px;
			left: 4px;
			font-size: 14px;
		}

		&:hover span {
			opacity: 1;
		}
	}
}

#add-role {
	transition: 0.25s ease-in-out 0.1s;
	cursor: pointer;
	border: none;
	outline: none;
	background: transparent;
	padding: 0;
	font-size: 20px;
	vertical-align: middle;
	min-height: 25px;

	&:hover {
		color: white !important;
		transform: scale(1.25);
	}

	&::after {
		content: none;
	}
}

.dropdown-menu {
	overflow-y: auto;
	background: $color-630;

	&.show {
		border: 1px solid $color-800;
		max-height: 150px;
	}
}

.dropdown-item {
	color: rgba(255, 255, 255, 0.8);
	padding-left: 8px;
	padding-right: 8px;

	&:hover {
		color: white;
		background: rgba(0, 0, 0, .3);
	}	
}
</style>

<script>
module.exports = {
	props: { roles: Array, value: Array },
	methods: {
		addRole(role) {
			this.value.push(role.id);
			this.$emit("input", this.value);
		},
		removeRole(roleID) {
			this.value.splice(this.value.indexOf(roleID), 1);
			this.$emit("input", this.value);
		}
	}
};
</script>

