module.exports = (num, options) => {
	let accum = "";
	for(let i = num; i--;) accum += options.fn({ index: i });
	return accum;
};
