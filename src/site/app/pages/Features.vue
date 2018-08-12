<template>
	<div>
		<div class="row mb-5 feature">
			<div class="col-sm-12 col-md-6 text-right">
				<h2>
					Music
					<i class="fa fa-music" aria-hidden="true"></i>
				</h2>
				<div class="row">
					<div class="col-sm-12 col-md-6"></div>
					<div class="col-sm-12 col-md-6">
						<p>Oxyl's high quality music allows you to listen to any song you want, from a wide variety of sources all day long.</p>
					</div>
				</div>
			</div>
			<div class="img-container col-sm-12 col-md-6">
				<div>
					<img src="/static/features/music.png" />
				</div>
			</div>
		</div>
		<div class="row mb-5 feature">
			<div class="img-container rtl col-sm-12 col-md-6">
				<div>
					<img src="/static/features/reddit.png" />
				</div>
			</div>
			<div class="col-sm-12 col-md-6 text-left">
				<h2>
					Reddit Feeds
					<i class="fa fa-reddit" aria-hidden="true"></i>
				</h2>
				<div class="row">
					<div class="col-sm-12 col-md-6">
						<p>Reddit Feeds allow you to stay up-to-date with all the new, or top, posts from your favorite subreddits.</p>
					</div>
					<div class="col-sm-12 col-md-6"></div>
				</div>
			</div>
		</div>
		<div class="row mb-5 feature">
			<div class="col-sm-12 col-md-6 text-right">
				<h2>
					Mod Log
					<i class="fa fa-table" aria-hidden="true"></i>
				</h2>
				<div class="row">
					<div class="col-sm-12 col-md-6"></div>
					<div class="col-sm-12 col-md-6">
						<p>Oxyl's Mod Log allows users and other moderators to quickly see moderation history, including editable reasons.</p>
					</div>
				</div>
			</div>
			<div class="img-container col-sm-12 col-md-6">
				<div>
					<img src="/static/features/modlog.png" />
				</div>
			</div>
		</div>
		<div class="row mb-5 feature">
			<div class="img-container rtl col-sm-12 col-md-6">
				<div>
					<img src="/static/features/twitch.png" />
				</div>
			</div>
			<div class="col-sm-12 col-md-6 text-left">
				<h2>
					Twitch Feeds
					<i class="fa fa-twitch" aria-hidden="true"></i>
				</h2>
				<div class="row">
					<div class="col-sm-12 col-md-6">
						<p>Twitch Feeds allows you to see when your favorite streamers begin or end their stream. They also allow you to see quick stats about how the stream went such as how many followers and views they gained, along with how long the stream lasted.</p>
					</div>
					<div class="col-sm-12 col-md-6"></div>
				</div>
			</div>
		</div>
		<div class="row mb-5 feature">
			<div class="col-sm-12 col-md-6 text-right">
				<h2>
					Censors
					<i class="fa fa-asterisk" aria-hidden="true"></i>
				</h2>
				<div class="row">
					<div class="col-sm-12 col-md-6"></div>
					<div class="col-sm-12 col-md-6">
						<p>Censors allow you to create custom regular expressions that can help you capture any phrase or word that you'd like, including ways to automatically punish the user for triggering the censor.</p>
					</div>
				</div>
			</div>
			<div class="img-container col-sm-12 col-md-6">
				<div>
					<img src="/static/features/censors.png" />
				</div>
			</div>
		</div>
		<div class="row mb-5 feature">
			<div class="img-container rtl col-sm-12 col-md-6">
				<div>
					<img src="/static/features/roblox.png" />
				</div>
			</div>
			<div class="col-sm-12 col-md-6 text-left">
				<h2>
					Roblox Verification
					<i class="fa fa-id-card" aria-hidden="true"></i>
				</h2>
				<div class="row">
					<div class="col-sm-12 col-md-6">
						<p>Roblox Verification allows users to link their Discord and ROBLOX accounts in each server in order to recieve a role, get a set nickname, and even sync roles with a ROBLOX group!</p>
					</div>
					<div class="col-sm-12 col-md-6"></div>
				</div>
			</div>
		</div>
		<div class="row mb-5 feature">
			<div class="col-sm-12 col-md-6 text-right">
				<h2>
					Paladins Commands
					<i class="fa fa-diamond" aria-hidden="true"></i>
				</h2>
				<div class="row">
					<div class="col-sm-12 col-md-6"></div>
					<div class="col-sm-12 col-md-6">
						<p>The Paladins Commands allows users to directly access statistics and other information about users and matches in Paladins, with easy-to-follow images.</p>
					</div>
				</div>
			</div>
			<div class="img-container col-sm-12 col-md-6">
				<div>
					<img src="/static/features/paladins.png" />
				</div>
			</div>
		</div>
		<div class="row mb-5 feature">
			<div class="img-container rtl col-sm-12 col-md-6">
				<div>
					<img src="/static/features/userlog.png" />
				</div>
			</div>
			<div class="col-sm-12 col-md-6 text-left">
				<h2>
					User Log
					<i class="fa fa-users" aria-hidden="true"></i>
				</h2>
				<div class="row">
					<div class="col-sm-12 col-md-6">
						<p>The User Log allows you to greet and say goodbye to people arriving and leaving the server. This can be used to inform a user about the server, or just to keep track of when someone joins or leaves.</p>
					</div>
					<div class="col-sm-12 col-md-6"></div>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
@import "../variables";
@import "~bootstrap/scss/bootstrap";

@include media-breakpoint-down(sm) {
	.feature div {
		text-align: center !important;
	}

	.img-container {
		& div {
			width: 90% !important;
			margin-right: auto !important;
			margin: auto;
		}

		&.rtl {
			margin-bottom: 1rem;

			& img {
				float: unset !important;
			}
		}
	}
}

.img-container {
	padding: 0;
	overflow-y: hidden;

	& div {
		overflow-y: hidden;
		width: 110%;
		background: #36393e;
		border: 1px solid $color-800;
		border-radius: 8px;
	}
	
	&.rtl {
		direction: rtl;

		& div {
			margin-right: 1px;
		}

		& img {
			float: right;
		}
	}
}
</style>
