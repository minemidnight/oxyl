<template>
	<div class="row">
		<div class="col">
			<div class="card border-info">
				<div class="card-header bg-elegant-dark text-white">Memory Usage</div>
				<div class="card-body bg-elegant">
					<chartjs-line :fill="true" datalabel="Usage (GiB)"></chartjs-line>
				</div>
			</div>
		</div>
		<div class="col">
			<div class="card border-info">
				<div class="card-header bg-elegant-dark text-white">CPU Usage</div>
				<div class="card-body bg-elegant">
					<chartjs-line :fill="true" datalabel="Usage (%)"></chartjs-line>
				</div>
			</div>
		</div>
	</div>
</template>
