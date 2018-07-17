const transformations = {
	Program: { sourceElements: 0 },
	SourceElement: 0,
	Statement: 0,
	VariableStatement_setWithEqual: {
		type: "VariableStatement",
		name: 0,
		value: 2
	},
	VariableStatement_setNoEqual: {
		type: "VariableStatement",
		name: 2,
		value: 4
	},
	IfStatement: {
		condition: 1,
		statement: 2,
		else: 3
	},
	LoopStatement: {
		times: 1,
		statement: 3
	},
	AddRoleStatement_noReason: {
		role: 1,
		member: 3
	},
	AddRoleStatement_reason: {
		role: 1,
		member: 3,
		reason: 5
	},
	RemoveRoleStatement_noReason: {
		role: 1,
		member: 3
	},
	RemoveRoleStatement_reason: {
		role: 1,
		member: 3,
		reason: 5
	},
	BanStatement_noReason: { member: 1 },
	BanStatement_reason: {
		member: 1,
		reason: 3
	},
	KickStatement_noReason: { member: 1 },
	KickStatement_reason: {
		member: 1,
		reason: 3
	},
	CreateMessageStatement: { content: 3 },
	SendDMStatement: {
		content: 3,
		user: 5
	},
	SetNicknameStatement: {
		member: 3,
		nickname: 5
	},
	ExpressionStatement: 0,
	AbsoluteValueExpression_words: {
		type: "AbsoluteValueExpression",
		value: 2
	},
	AbsoluteValueExpression_pipes: {
		type: "AbsoluteValueExpression",
		value: 1
	},
	CleanContentExpression_exprLast: {
		type: "CleanContentExpression",
		message: 2
	},
	CleanContentExpression_exprFirst: {
		type: "CleanContentExpression",
		message: 0
	},
	CreationTimestampExpression_exprLast: {
		type: "CreationTimestampExpression",
		discordType: 2
	},
	CreationTimestampExpression_exprFirst: {
		type: "CreationTimestampExpression",
		discordType: 0
	},
	DifferenceExpression: {
		numberOne: 2,
		numberTwo: 4
	},
	FormatDateExpression: { integer: 0 },
	IDExpression_exprLast: {
		type: "IDExpression",
		discordType: 2
	},
	IDExpression_exprFirst: {
		type: "IDExpression",
		discordType: 0
	},
	IndexOfExpression: {
		search: 2,
		full: 4
	},
	MemberCountExpression_exprLast: {
		type: "MemberCountExpression",
		guild: 2
	},
	MemberCountExpression_exprFirst: {
		type: "MemberCountExpression",
		guild: 0
	},
	MemberGameExpression_exprLast: {
		type: "MemberGameExpression",
		member: 2
	},
	MemberGameExpression_exprFirst: {
		type: "MemberGameExpression",
		member: 0
	},
	MemberJoinTimestampExpression_exprLast: {
		type: "MemberJoinTimestampExpression",
		member: 2
	},
	MemberJoinTimestampExpression_exprFirst: {
		type: "MemberJoinTimestampExpression",
		member: 0
	},
	MemberStatusExpression_exprLast: {
		type: "MemberStatusExpression",
		member: 2
	},
	MemberStatusExpression_exprFirst: {
		type: "MemberStatusExpression",
		member: 0
	},
	MentionExpression_exprLast: {
		type: "MentionExpression",
		mentionable: 2
	},
	MentionExpression_exprFirst: {
		type: "MentionExpression",
		mentionable: 0
	},
	MessageAuthorExpression_exprLast: {
		type: "MessageAuthorExpression",
		message: 2
	},
	MessageAuthorExpression_exprFirst: {
		type: "MessageAuthorExpression",
		message: 0
	},
	MessageContentExpression_exprLast: {
		type: "MessageContentExpression",
		message: 2
	},
	MessageContentExpression_exprFirst: {
		type: "MessageContentExpression",
		message: 0
	},
	NameExpression_exprLast: {
		type: "NameExpression",
		hasName: 2
	},
	NameExpression_exprFirst: {
		type: "NameExpression",
		hasName: 0
	},
	UsernameExpression_exprLast: {
		type: "UsernameExpression",
		user: 2
	},
	UsernameExpression_exprFirst: {
		type: "UsernameExpression",
		user: 0
	},
	RandomNumberExpression_exclusive: {
		type: "RandomNumberExpression",
		from: 2,
		to: 4
	},
	RandomNumberExpression_inclusive: 0,
	RoundExpression_round: {
		type: "RoundExpression",
		number: 0
	},
	RoundExpression_downExprFirst: {
		type: "RoundExpression",
		number: 0
	},
	RoundExpression_upExprFirst: {
		type: "RoundExpression",
		number: 0
	},
	RoundExpression_downExprLast: {
		type: "RoundExpression",
		number: 1
	},
	RoundExpression_upExprLast: {
		type: "RoundExpression",
		number: 1
	},
	GuildIconExpression_exprLast: {
		type: "GuildIconExpression",
		guild: 2
	},
	GuildIconExpression_exprFirst: {
		type: "GuildIconExpression",
		guild: 0
	},
	GuildRegionExpression_exprLast: {
		type: "GuildRegionExpression",
		guild: 2
	},
	GuildRegionExpression_exprFirst: {
		type: "GuildRegionExpression",
		guild: 0
	},
	GuildOwnerExpression_exprLast: {
		type: "GuildOwnerExpression",
		guild: 2
	},
	GuildOwnerExpression_exprFirst: {
		type: "GuildOwnerExpression",
		guild: 0
	},
	SubstringExpression_indicies: {
		string: 2,
		start: 4,
		end: 6
	},
	SubstringExpression_first: {
		string: 1,
		characters: 3
	},
	SubstringExpression_last: {
		string: 1,
		characters: 3
	},
	LengthExpression_exprLast: {
		type: "LengthExpression",
		string: 2
	},
	LengthExpression_exprFirst: {
		type: "LengthExpression",
		string: 0
	},
	LowercaseExpression: { string: 1 },
	UppercaseExpression: { string: 1 },
	UserAvatarExpression_exprLast: {
		type: "UserAvatarExpression",
		user: 2
	},
	UserAvatarExpression_exprFirst: {
		type: "UserAvatarExpression",
		user: 0
	},
	UserDiscriminatorExpression_exprLast: {
		type: "UserDiscriminatorExpression",
		user: 2
	},
	UserDiscriminatorExpression_exprFirst: {
		type: "UserDiscriminatorExpression",
		user: 0
	},
	UserTagExpression_exprLast: {
		type: "UserTagExpression",
		user: 2
	},
	UserTagExpression_exprFirst: {
		type: "UserTagExpression",
		user: 0
	},
	UserFromIDExpression: { id: 3 },
	MemberFromUserExpression: { user: 2 },
	MemberFromIDExpression: { id: 3 },
	ChannelFromIDExpression: { id: 3 },
	RoleFromIDExpression: { id: 3 },
	RoleFromNameExpression: { name: 3 },
	ChannelFromMessageExpression: { message: 3 },
	GuildFromRoleExpression: { role: 3 },
	GuildFromMessageExpression: { message: 3 },
	GuildFromChannelExpression: { channel: 3 },
	ContainsExpression: {
		string: 0,
		search: 2
	},
	DoesntContainExpression: {
		string: 0,
		search: 3
	},
	HasPermissionExpression: {
		member: 0,
		permission: 4
	},
	HasChannelPermissionExpression: {
		member: 0,
		permission: 4,
		channel: 6
	},
	HasRoleExpression: {
		member: 0,
		role: 3
	},
	IsBotExpression: { user: 0 },
	IsHoistedExpression: { role: 0 },
	OrExpression: 0,
	AndExpression: 0,
	ExistanceExpression: 0,
	EqualityExpression: 0,
	RelationalExpression: 0,
	AdditiveExpression_add: {
		left: 0,
		right: 2
	},
	AdditiveExpression_sub: {
		left: 0,
		right: 2
	},
	AdditiveExpression: 0,
	MultiplicativeExpression_mul: {
		left: 0,
		right: 2
	},
	MultiplicativeExpression_div: {
		left: 0,
		right: 2
	},
	MultiplicativeExpression_exp: {
		left: 0,
		right: 2
	},
	MultiplicativeExpression_mod: {
		left: 0,
		right: 2
	},
	MultiplicativeExpression: 0,
	UnaryExpression: 0,
	PrimaryExpression: 0,
	PrimaryExpression_precedence: 1,
	literal: 0,
	numericLiteral: 0,
	integerLiteral: { type: "integer" },
	floatLiteral: { type: "float" },
	loopIndexLiteral: { type: "integer" },
	stringLiteral: { type: "string" },
	booleanLiteral: { type: "boolean" },
	permissionLiteral: { type: "permission" },
	userLiteral: { type: "user" },
	messageLiteral: { type: "message" },
	channelLiteral: { type: "channel" },
	guildLiteral: { type: "guild" },
	variableLiteral: {
		type: "variable",
		name: 1
	},
	variableName: function (_a, _b, _c) {
		return this.sourceString.slice(1, -1);
	}
};

Object.values(transformations).forEach(transformation => {
	if(Array.isArray(transformation) || typeof transformation !== "object") return;

	transformation.startIndex = function(children) {
		return this.source.startIdx;
	};

	transformation.endIndex = function(children) {
		return this.source.endIdx;
	};
});

module.exports = transformations;
