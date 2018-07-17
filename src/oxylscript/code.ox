create message saying {jeff}

loop 2 times {
	set {l1} to loop-index

	loop 3 times {
		set {r} to {l1} * loop-index
		create message saying {r}
	}
}