const Config = require('./config.json')
const {
    Client,
    GatewayIntentBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Events,
    User,
    Message,
    EmbedBuilder
} = require('discord.js');
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

async function Login() {
    await noblox.setCookie(Config.cookie);
}
//Login()

async function MakeButton(UserID, Username, roleID, roleName) {
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

    const Embed = new EmbedBuilder()
        .setTitle("ABA | Promotion Requests")
        .setDescription(`Promotion requested for **${Username}**`)
        .setFooter({
            text: "Alfia's British Army",
            iconURL: `https://tr.rbxcdn.com/dc5f13c33dd4561c77c4232bd031895c/150/150/Image/Png`
        })
        .setColor(7482725)
        .setTimestamp()
        .addFields({
            name: 'Rank',
            value: `${await noblox.getRankNameInGroup(Config.groupid, Number(UserID))}`
        }, {
            name: 'Rank after promotion',
            value: `${roleName}`
        }, {
            name: 'Event',
            value: `N/A`
        })
    return ({
        embeds: [Embed],
        components: [NewButton]
    });
}

async function NextRank(RankId) {
    const GroupNames = await noblox.getRoles(Config.groupid)

    for (var i = 0; i < GroupNames.length; i++) {
        if (GroupNames[i].rank == (Number(RankId))) {
            return [GroupNames[i].rank, GroupNames[i].name];
        }
    }
    return undefined;

}

var UserId = ""
var RankID = ""

app.get("/setrank", async (req, res) => {
    var Authkey = req.param("key")
    var UserID = req.param("userid")
    var RankId = req.param("rank")

    if (!Authkey) return res.status(404).send("Provide an authentication key.")
    if (Authkey !== Config['auth-key']) return res.status(404).send("Invaild authentication key.")

    if (!UserID) return res.status(404).send("Provide a userID")
    if (!RankId) return res.status(404).send("Provide a rankid")

    UserId = Number(UserID)
    RankID = Number(RankId)

    const rank = await NextRank(RankId)

    if (rank === undefined) {
        return res.status(404).send("Invaild rankID")
    }

    const Channel = client.channels.cache.get(Config.channelId)
    Channel.send(await MakeButton(UserID, await noblox.getUsernameFromId(UserID), rank[0], rank[1]))

    res.status(200).send("Sent to discord.")
})

client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isButton()) {
        if (interaction.customId == "Accept") {
            interaction.message.delete();

            const AcceptedEmbed = new EmbedBuilder()
                .setTitle("SUCCESSFULLY PROMOTED")
                .setDescription(`${interaction.user.tag} Approved ${await noblox.getUsernameFromId(UserId)}'s promotion`)
                .setColor(5111308)
                .setFooter({
                    text: "ABA | Web Development Team"
                })

            const channel2 = client.channels.cache.get(Config.channel2)
            channel2.send({
                embeds: [AcceptedEmbed]
            });

            try {
                await noblox.setRank(Config.groupid, UserId, Number(RankID))
            } catch (err) {
                console.error(err)
            }
        }

        if (interaction.customId == "Decline") {
            interaction.message.delete();
        }
    }
})

client.login(Config.token)

app.listen(PORT, () => {
    console.log(`Online | https://localhost:${PORT}`)
})