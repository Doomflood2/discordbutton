const Config = require('./config.json')
const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');
const client = new Client({ 
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const noblox = require('noblox.js')
const express = require('express')

const app = express();
const PORT = process.env.PORT || Config.port

async function Login(){
    await noblox.setCookie(Config.cookie);
}
Login()

function MakeButton(User){
    const NewButton = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
        .setCustomId('Accept')
        .setLabel('Accept')
        .setStyle(ButtonStyle.Success)
        .setDisabled(false),

        new ButtonBuilder()
        .setCustomId('Decline')
        .setLabel('Decline')
        .setStyle(ButtonStyle.Danger)
        .setDisabled(false),
        );

        return ({ content: `Rank **${User}**?`, components: [NewButton] });
    }
    
    const DeadButton = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
        .setCustomId('deadAccept')
        .setLabel('Accept')
        .setStyle(ButtonStyle.Success)
        .setDisabled(true),

        new ButtonBuilder()
        .setCustomId('deadDecline')
        .setLabel('Decline')
        .setStyle(ButtonStyle.Danger)
        .setDisabled(true),
        );

        var user =""
        var rank =""


app.get("/setrank", async (req, res)=> {
    var Authkey = req.param("key")
    var UserID = req.param("userid")
    var RankId = req.param("rank")

    if (!Authkey) return res.status(404).send("Provide an authentication key.")
    if (Authkey !== Config['auth-key']) return res.status(404).send("Invaild authentication key.")

    if (!UserID) return res.status(404).send("Provide a userID")
    if (!RankId) return res.status(404).send("Provide a rankid")

    const Channel = client.channels.cache.get(Config.channelId)

    Channel.send(MakeButton(await noblox.getUsernameFromId(UserID)))

    user = UserID
    rank = RankId

    res.status(200).send("Sent to discord.")
})

client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isButton()) {
      if (interaction.customId == "Accept") {
        interaction.update({ content: `**${interaction.user.tag}** Ranked **${await noblox.getUsernameFromId(user)}**` ,components: [DeadButton] });
        await noblox.setRank(Config.groupid, user, Number(rank))
    }

    if (interaction.customId == "Decline") {
        interaction.update({ content: `**${interaction.user.tag}** Declined the request for **${await noblox.getUsernameFromId(user)}**` ,components: [DeadButton] });
    }
}
})

client.login(Config.token)

app.listen(PORT, () => {
    console.log(`Online | https://localhost:${PORT}`)
})
