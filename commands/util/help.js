let { prefix } = require('../../config.json');

exports.run = async(d) => {
	let val = Array.from(d.cmd.values());
	let dummy = {};
	val.forEach((e) => {
		dummy[e.name] = e;
	})

    if(!d.args[0]) {
    	await d.f.reply(d, { text: `All Commands: *${Object.keys(dummy).join(', ')}*\n\n\`\`\`${prefix}help <command name>\`\`\` for details...` })
    } else {
    	let { name, aliases, description, usage } = dummy[d.args[0]];
    	await d.f.reply(d, { text: `*${name}*\n\nAliases: ${aliases.join(", ")}\nDescription: ${description}\nUsage: \`\`\`${usage.replace('{prefix}', prefix)}\`\`\`` })
    }
}

exports.help = {
	name: "Help",
	aliases: ['menu', '?'],
	description: "Help menu.",
	usage: "{prefix}help"
}