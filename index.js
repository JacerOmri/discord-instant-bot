const Discord = require("discord.js"),
got = require('got'),
client = new Discord.Client(),
settings = {
    prefix: process.env.DISCORD_PREFIX || "-",
    token: process.env.DISCORD_TOKEN
};

client.on("ready", () => {
    console.log("I'm ready !");
});

const myInstantsExtractor = async (query) => {
    const searchUrl = 'https://www.myinstants.com/api/v1/instants/?format=json&name=' + query
    const body = await got(searchUrl).json()
    const result = body.results[0].sound
    return result;
}
  
client.on("message", async (message) => {

    console.log({message})
    const args = message.content.slice(settings.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if(command === "instant"){
        if (!message.member.voice.channel) return message.reply("You must be in a voice channel.");
        if (message.guild.me.voice.channel) return message.reply("I'm already playing.");

        const VoiceConnection = await message.member.voice.channel.join()

        try {
            const instant = await myInstantsExtractor(args.join(' '))

            // Joining the channel and creating a VoiceConnection.
            VoiceConnection.play(instant).on("finish", () => VoiceConnection.disconnect());
            message.reply("Playing...");
        } catch (error) {
            message.reply("Couldn't play...");
            VoiceConnection.disconnect()
            console.error(error)
        }
    }

});

client.login(settings.token);