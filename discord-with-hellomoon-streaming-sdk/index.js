require("dotenv").config();
const {
  Client,
  IntentsBitField,
  EmbedBuilder,
  WebhookClient,
} = require("discord.js");
const { RestClient, NftSocialRequest } = require("@hellomoon/api");

/*
    1. create a .env file 
    2. require("dotenv").config(); to allow process.env to read the .env file
    3. create a key, value pair in the file HELLOMOON_API_KEY="API_KEY_HERE"
    4. checkout https://www.hellomoon.io/dashboard, to get your api key
*/
const helloMoonClient = new RestClient(process.env.HELLOMOON_API_KEY);

// https://discordjs.guide/popular-topics/intents.html#privileged-intents
// https://discord.com/developers/docs/topics/gateway#list-of-intents - checkout all of discord intent
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
});

const webhookClient = new WebhookClient({
  url: process.env.DISCORD_WEBHOOK_URL,
});

const editEmbeddedMessage = (message) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (message.webhookId) {
        const messageId = message.id;
        const fetchedWebhookMessage = await webhookClient.fetchMessage(
          messageId
        );

        if (fetchedWebhookMessage.embeds[0].title === "Test Post") {
          resolve(`successfully fetched... ${messageId}`);
        }

        // sometimes the message sent may have multiple embedded messages in 1 single message.
        // TODO: loop through all the embedded messages and edit them accordingly.
        // RIGHT NOW, we only handle the first embedded message
        console.log({
          embed: fetchedWebhookMessage.embeds.map((embed) =>
            JSON.stringify(embed.fields.map((field) => field))
          ),
        });

        const priceField = fetchedWebhookMessage.embeds[0].fields.find(
          (field) => field.name === "price"
        );
        const sellerField = fetchedWebhookMessage.embeds[0].fields.find(
          (field) => field.name === "seller"
        );
        const buyerField = fetchedWebhookMessage.embeds[0].fields.find(
          (field) => field.name === "buyer"
        );
        const mintField = fetchedWebhookMessage.embeds[0].fields.find(
          (field) => field.name === "mint"
        );
        const marketActionField = fetchedWebhookMessage.embeds[0].fields.find(
          (field) => field.name === "marketActionType"
        );
        const marketPlaceField = fetchedWebhookMessage.embeds[0].fields.find(
          (field) => field.name === "marketName"
        );
        const collectionNameField = fetchedWebhookMessage.embeds[0].fields.find(
          (field) => field.name === "collectionName"
        );
        console.log("successfully fetched...", { collectionNameField });

        const embedBuilder = new EmbedBuilder()
          .setColor("#79ff61")
          .setTitle(collectionNameField.value ? collectionNameField.value : "-")
          .setThumbnail(
            `https://cdn.hellomoon.io/nft/${mintField.value}?apiKey=${process.env.HELLOMOON_API_KEY}&width=500&height=500&format=jpeg`
          )
          .addFields(
            {
              name: "Price",
              value: priceField ? priceField.value : "-",
            },
            { name: "Seller", value: sellerField ? sellerField.value : "-" },
            { name: "Buyer", value: buyerField ? buyerField.value : "-" },
            {
              name: "Nft Mint",
              value: String(mintField.value ?? "-"),
            }
          );
        const editedMessage = await webhookClient.editMessage(messageId, {
          username: "Edited User",
          embeds: [embedBuilder],
        });
        resolve(`successfully fetched... ${messageId}`);
      }
    } catch (err) {
      reject(err);
    }
  });
};

const main = async () => {
  client.on("messageCreate", async (message) => {
    editEmbeddedMessage(message);
  });
};

main().then().catch(console.error);

// login our discord bot
client.login(process.env.DISCORD_KEY);
