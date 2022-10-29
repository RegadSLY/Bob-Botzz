const fs = require('fs');
exports.run = async(d) => {
	let path = `./tmp/${d.msg.messageTimestamp}.webp`;
	let img = d.msg.message.imageMessage;
	let isq = d.f.Quoted(d);

	if(isq.isQuoted && isq.type === 'imageMessage' || isq.type === "stickerMessage") {
		img = isq.data.viaType;
	}

	if(img) {
		if(img.url === "https://web.whatsapp.net") {
		    img['url'] = 'https://mmg.whatsapp.net' + img.directPath
		}

		const stream = await require('@adiwajshing/baileys').downloadContentFromMessage(img, 'image');

	    let buffer = Buffer.from([]);
	    for await (const chunk of stream) {
	      buffer = Buffer.concat([buffer, chunk]);
	    }

	    await fs.writeFileSync(path, buffer);
		await d.f.reply(d, { image: { url: path } });
		// fs.unlinkSync(path)
	} else {
		d.f.reply(d, {text: 'Pakai command ini dengan me-reply sebuah sticker!'})
	}
	
}

exports.help = {
	name: "To Image",
	aliases: ['toimg'],
	description: "Sticker to image!",
	usage: "{prefix}toimage"
}