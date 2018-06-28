module.exports = (_a, count, _b) => block => {
	count = count.run();
	for(let i = 0; i < count; i++) block.run();
};
