loop 2 times {
	set {l1} to loop-index
	create message saying {l1}

	loop 2 times {
		set {r} to {l1} * loop-index
	}
}