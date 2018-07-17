module.exports = async(_a, _b, number1, _c, number2) =>
	Math.abs(await number1.run() - await number2.run());
