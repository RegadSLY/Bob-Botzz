const {
  default: makeWASocket,
  DisconnectReason,
  useSingleFileAuthState,
  getContentType,
} = require("@adiwajshing/baileys");
const { Boom } = require("@hapi/boom");
const P = require("pino");
const fs = require('fs');
const cmd = new Map();
let { prefix, autoRead } = require('./config.json');
let args, command;

function loadCommands() {
    fs.readdir("./commands", (e, files) => {
        if (e) return console.error(e);
        files.forEach(folder => {
            fs.readdir(`./commands/${folder}`, (e, filess) => {
                if (e) return console.error(e);
                filess.forEach(file => {
                    let { aliases, description, usage } =  require(`./commands/${folder}/${file}`).help;
                    let objectToSet = {
                        name: file.replace(".js", ""),
                        aliases,
                        description,
                        usage,
                        loc: folder + "/" + file,
                    }

                    cmd.set(file.replace(".js", ""), objectToSet)
                    console.log(file.replace(".js", "") + " Commands - Loaded")
                })
            })
        });
    });
}

async function connectToWhatsApp() {
    const { state, loadState, saveState } = useSingleFileAuthState('./session.json');
  
    const sock = makeWASocket({
        logger: P({ level: "fatal" }),
        printQRInTerminal: true,
        auth: state,
        browser: ["WeAh", "Safari", "1.0.0"],
    })

    sock.ev.on("creds.update", saveState);
  
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect)
            // reconnect if not logged out
            if(shouldReconnect) {
                connectToWhatsApp()
            }
        } else if(connection === 'open') {
            console.log('opened connection')
        }
    })

    sock.ev.on('messages.upsert', async m => {
        var msg = m.messages[0];
        if (!m || !msg.message) return;
        if (msg.key && msg.key.remoteJid === "status@broadcast") return;
        const type = getContentType(msg.message);
        var text =
            type === "conversation" && msg.message.conversation
              ? msg.message.conversation
              : type == "imageMessage" && msg.message.imageMessage.caption
              ? msg.message.imageMessage.caption
              : type == "documentMessage" && msg.message.documentMessage.caption
              ? msg.message.documentMessage.caption
              : type == "videoMessage" && msg.message.videoMessage.caption
              ? msg.message.videoMessage.caption
              : type == "extendedTextMessage" && msg.message.extendedTextMessage.text
              ? msg.message.extendedTextMessage.text
              : type == "listResponseMessage"
              ? msg.message.listResponseMessage.singleSelectReply.selectedRowId
              : type == "buttonsResponseMessage" &&
                msg.message.buttonsResponseMessage.selectedButtonId
              ? msg.message.buttonsResponseMessage.selectedButtonId
              : type == "templateButtonReplyMessage" &&
                msg.message.templateButtonReplyMessage.selectedId
              ? msg.message.templateButtonReplyMessage.selectedId
              : "";

        if(autoRead) {
            await sock.readMessages([{
                remoteJid: msg.key.remoteJid,
                id: msg.key.id,
                participant: msg.key.participant
            }])
        }

        try {
            if (text.startsWith(prefix)) {
                args = text.slice(prefix.length).trim().split(/ +/g);
                command = args.shift().toLowerCase();
            } else {
                return;
            }
        } catch {}

        const val = Array.from(cmd.values()).find((c) => 
            c.name.toLowerCase() === command.toLowerCase() || 
            (c.aliases && typeof c.aliases === "object" ? 
                c.aliases.includes(command.toLowerCase()) : c.aliases === command.toLowerCase()))

        if (val) {
            let data = {
                sock,
                msg,
                args,
                cmd,
                f: require('./models/functions')
            }
            require(`./commands/${val.loc}`).run(data);
        }
    })
}

if(!fs.existsSync('./tmp')) {
    fs.mkdirSync('./tmp')
}

loadCommands()
connectToWhatsApp()
