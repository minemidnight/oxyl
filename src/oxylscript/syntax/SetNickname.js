module.exports = (_a, _b, _c, member, _d, nickname) =>
	member.run().edit({ nickname: nickname.run() });
