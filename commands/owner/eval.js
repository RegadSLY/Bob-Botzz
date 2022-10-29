exports.run = async(d) => {
	d.f.onlyOwner(d, async function() {
		try {
	      var evaled = await eval(d.args.join(" "));
	      return d.f.reply(d, {text:require("util").inspect(evaled, { depth: 0 })})
	    } catch (err) {
	      return d.f.reply(d, {text: `${err}!`});
	    }
	})
}

exports.help = {
	name: "Eval",
	aliases: ['e'],
	description: "evaling code",
	usage: "{prefix}eval <code>"
}