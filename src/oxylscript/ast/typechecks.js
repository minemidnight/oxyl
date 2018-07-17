module.exports = {
	LoopStatement: { times: "integer" },
	AddRoleStatement_noReason: {
		role: "role",
		member: "member"
	},
	AddRoleStatement_reason: {
		role: "role",
		member: "member",
		reason: "string"
	},
	RemoveRoleStatement_noReason: {
		role: "role",
		member: "member"
	},
	RemoveRoleStatement_reason: {
		role: "role",
		member: "member",
		reason: "string"
	},
	BanStatement_noReason: { member: "member" },
	BanStatement_reason: {
		member: "member",
		reason: "string"
	},
	KickStatement_noReason: { member: "member" },
	KickStatement_reason: {
		member: "member",
		reason: "string"
	},
	CreateMessageStatement: { content: "string" },
	SendDMStatement: {
		content: "string",
		user: ["user", "member"]
	},
	SetNicknameStatement: {
		member: "member",
		nickname: "string"
	},
	AbsoluteValueExpression: { value: "number" },
	CleanContentExpression: { message: "message" },
	CreationTimestampExpression: { message: "message" },
	DifferenceExpression: {
		numberOne: ["float", "integer"],
		numberTwo: ["float", "integer"]
	},
	FormatDateExpression: { integer: "integer" },
	IDExpression: { discordType: ["user", "message", "channel", "guild", "role"] },
	IndexOfExpression: {
		search: "string",
		full: "string"
	},
	MemberCountExpression: { guild: "guild" },
	MemberGameExpression: { member: "member" },
	MemberJoinTimestampExpression: { member: "member" },
	MemberStatusExpression: { member: "member" },
	MentionExpression: { mentionable: ["channel", "role", "user", "member"] },
	MessageAuthorExpression: { message: "message" },
	MessageContentExpression: { message: "message" },
	NameExpression: { hasName: ["channel", "role", "user", "member", "guild"] },
	UsernameExpression: { user: ["user", "member"] },
	RandomNumberExpression: {
		from: "integer",
		to: "integer"
	},
	RoundExpression: { number: "number" },
	GuildIconExpression: { guild: "guild" },
	GuildRegionExpression: { guild: "guild" },
	GuildOwnerExpression: { guild: "guild" },
	SubstringExpression_indicies: {
		string: "string",
		start: "integer",
		end: "integer"
	},
	SubstringExpression_first: {
		string: "string",
		characters: "integer"
	},
	SubstringExpression_last: {
		string: "string",
		characters: "characters"
	},
	LengthExpression: { string: "string" },
	LowercaseExpression: { string: "string" },
	UppercaseExpression: { string: "string" },
	UserAvatarExpression: { user: ["user", "member"] },
	UserDiscriminatorExpression: { user: ["user", "member"] },
	UserTagExpression: { user: ["user", "member"] },
	UserFromIDExpression: { id: "string" },
	MemberFromUserExpression: { user: ["user", "member"] },
	MemberFromIDExpression: { id: "string" },
	ChannelFromIDExpression: { id: "string" },
	RoleFromIDExpression: { id: "string" },
	RoleFromNameExpression: { name: "string" },
	ChannelFromMessageExpression: { message: "message" },
	GuildFromRoleExpression: { role: "role" },
	GuildFromMessageExpression: { message: "message" },
	GuildFromChannelExpression: { channel: "channel" },
	ContainsExpression: {
		string: "string",
		search: "string"
	},
	DoesntContainExpression: {
		string: "string",
		search: "string"
	},
	HasPermissionExpression: {
		member: "member",
		permission: "permission"
	},
	HasChannelPermissionExpression: {
		member: "member",
		permission: "permission",
		channel: "channel"
	},
	HasRoleExpression: {
		member: "member",
		role: "role"
	},
	IsBotExpression: { user: ["user", "member"] },
	IsHoistedExpression: { role: "role" },
	AdditiveExpression_add: {
		left: ["number", "string"],
		right: ["number", "string"]
	},
	AdditiveExpression_sub: {
		left: "number",
		right: "number"
	},
	MultiplicativeExpression_div: {
		left: "number",
		right: "number"
	},
	MultiplicativeExpression_exp: {
		left: "number",
		right: "number"
	},
	MultiplicativeExpression_mod: {
		left: "number",
		right: "number"
	},
	MultiplicativeExpression_mul: {
		left: "number",
		right: "number"
	},
	variable: { type: "variable" }
};
