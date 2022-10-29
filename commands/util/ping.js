exports.run = async(d) => {
	d.f.reply(d, { text: 'pong!' })
}

exports.help = {
	name: "Ping",
	aliases: ['pong'],
	description: "Ping Pong!",
	usage: "{prefix}ping"
}