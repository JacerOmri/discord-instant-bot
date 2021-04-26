const Discord = require("discord.js"),
got = require('got'),
cheerio = require('cheerio'),
client = new Discord.Client(),
settings = {
    prefix: process.env.DISCORD_PREFIX || "+",
    token: process.env.DISCORD_TOKEN
};

client.on("ready", () => {
    console.log("I'm ready !");
});

const myInstantsApiExtractor = async (query) => {
    const searchUrl = 'https://www.myinstants.com/api/v1/instants/?format=json&name=' + query
    const body = await got(searchUrl).json()
    const result = body.results[0].sound
    return result;
}

const isValidMyInstantsUrl = (string) => {
    let url;
    
    try {
      url = new URL(string);
    } catch (_) {
      return false;  
    }
  
    return  ['www.myinstants.com', 'myinstants.com'].includes(url.host)
}

const myInstantsUrlExtractor = async (url) => {
    const response = await got(url)
    const $ = cheerio.load(response.body);
    const result = 'https://www.myinstants.com' + $('#instant-page-button[onmousedown]')[0].attribs.onmousedown.match(/play\('(.*)'\)/)[1]
    return result;
}
  
client.on("message", async (message) => {

    if(!message.content.startsWith(settings.prefix)) return

    const args = message.content.slice(settings.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if(command === "instant"){
        if (!message.member.voice.channel) return message.reply("You must be in a voice channel.");
        if (message.guild.me.voice.channel) return message.reply("I'm already playing.");

        let VoiceConnection

        try {
            console.log({args})
            
            const instant = isValidMyInstantsUrl(args[0]) ?
                await myInstantsUrlExtractor(args[0]) :
                await myInstantsApiExtractor(args.join(' ')) 

            // Joining the channel and creating a VoiceConnection.
            VoiceConnection = await message.member.voice.channel.join()
            VoiceConnection.play(instant).on("finish", () => VoiceConnection.disconnect());
            message.reply("Playing...");
        } catch (error) {
            message.reply("Couldn't play...");
            VoiceConnection && VoiceConnection.disconnect()
            console.error(error)
        }
    }

});

client.login(settings.token);