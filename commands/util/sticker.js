const { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter');
const { pack, author } = require('../../config.json').sticker;
const fs = require('fs');
exports.run = async(d) => {
	let path = `./tmp/${d.msg.messageTimestamp}.webp`;
	let img = d.msg.message.imageMessage;
	let isq = d.f.Quoted(d);

	if(isq.isQuoted && isq.type === 'imageMessage') {
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
		const s = new Sticker(path, {
		    pack,
		    author,
		    type: StickerTypes.FULL,
		    categories: ['🤩', '🎉'],
		    id: '12345',
		    quality: 50,
		})

		await d.f.reply(d, await s.toMessage());
		fs.unlinkSync(path)
	} else {
		d.f.reply(d, {text: 'Pakai command sticker ini di caption sebuah image atau kamu dapat me-reply imagenya!'})
	}
	
}

exports.help = {
	name: "Sticker",
	aliases: ['s', 'stickers'],
	description: "Make sticker from image!",
	usage: "{prefix}sticker"
}