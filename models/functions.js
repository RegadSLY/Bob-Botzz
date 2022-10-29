let baileys = require("@adiwajshing/baileys");
let { ownerNumbers } = require('../config.json');

exports.reply = async(d, n) => {
	await d.sock.sendMessage(d.msg.key.remoteJid, n, { quoted: d.msg })
}

exports.Quoted = (d) => {
	let i = d.msg.message.extendedTextMessage? d.msg.message.extendedTextMessage.contextInfo.quotedMessage? true : false : false;
	let type = i? require('@adiwajshing/baileys').getContentType(d.msg.message.extendedTextMessage.contextInfo.quotedMessage) : null
	let data = {
		isQuoted: i,
		type,
		data: {
			viaType: i? d.msg.message.extendedTextMessage.contextInfo.quotedMessage[type] : null,
			normal: i? d.msg.message.extendedTextMessage.contextInfo.quotedMessage : null
		},
	}

	return data;
}

exports.decodeJid = (jid) => {
	if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      let decode = baileys.jidDecode(jid) || {};
      return (
        (decode.user && decode.server && decode.user + "@" + decode.server) ||
        jid
      );
    } else return jid;
}

exports.sender = (d) => {
	return d.msg.key.fromMe
	    ? d.client.user.jid
	    : d.msg.participant
	    ? d.msg.participant
	    : d.msg.key.participant
	    ? d.msg.key.participant
	    : d.msg.key.remoteJid;
}

exports.react = (d, emoji, id) => {
	if(!id) {
		id = d.msg.key.remoteJid
	}

	id === undefined? id = d.msg.key.remoteJid : "";
	d.sock.sendMessage(id, {
		react: {
		    text: emoji, // use an empty string to remove the reaction
		    key: d.msg.key
		}
	})
}

exports.onlyOwner = (d, callback) => {
	if(ownerNumbers.includes(module.exports.decodeJid(module.exports.sender(d)).replace("@s.whatsapp.net", ""))) {
		callback();
	} else {
		module.exports.react(d, "👀");
	}
}