module.exports = (content, lang) => {
	if(!lang) lang = "";
	return `\n\`\`\`${lang}\n${content}\n\`\`\``;
};
