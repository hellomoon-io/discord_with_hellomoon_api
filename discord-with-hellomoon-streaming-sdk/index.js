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

// https://docs.hellomoon.io/reference/post_v0-nft-social
async function getHelloMoonCollectionId(id) {
  const { data: nftSocialResponse } = await helloMoonClient.send(
    new NftSocialRequest({
      helloMoonCollectionId: id,
    })
  );

  const imageUrl = nftSocialResponse[0].image;
  const description = nftSocialResponse[0].description;
  const collectionName = nftSocialResponse[0].collectionName;

  return {
    imageUrl,
    description,
    collectionName,
  };
}

client.on("messageCreate", async (message) => {
  if (message.webhookId) {
    const messageId = message.id;
    const fetchedWebhookMessage = await webhookClient.fetchMessage(messageId);

    const helloMoonCollectionIdFields = fetchedWebhookMessage.embeds.map(
      (embed) => {
        return embed.fields.find(
          (field) => field.name === "helloMoonCollectionId"
        ).value;
      }
    );

    const collectionMetaData = helloMoonCollectionIdFields.map(
      async (helloMoonCollectionId) => {
        const { imageUrl, description, collectionName } =
          await getHelloMoonCollectionId(helloMoonCollectionId);

        return {
          imageUrl,
          description,
          collectionName,
        };
      }
    );

    const resolvedCollectionMetaData = await Promise.all(collectionMetaData);

    const embededBuilders = resolvedCollectionMetaData.map((data) => {
      const { imageUrl, description, collectionName } = data;

      const priceField = fetchedWebhookMessage.embeds[0].fields.find(
        (field) => field.name === "price"
      );

      const sellerField = fetchedWebhookMessage.embeds[0].fields.find(
        (field) => field.name === "seller"
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

      return new EmbedBuilder()
        .setColor("Blue")
        .setTitle(collectionName)
        .setDescription(description ?? "-")
        .setThumbnail(imageUrl)
        .addFields(
          {
            name: "Price",
            value: String(priceField.value ?? "-"),
          },
          { name: "Seller", value: String(sellerField.value ?? "-") },
          {
            name: "Nft Mint",
            value: String(mintField.value ?? "-"),
          },
          {
            name: "Nft Mint",
            value: String(mintField.value ?? "-"),
          },
          {
            name: "Market Action Type",
            value: String(marketActionField.value ?? "-"),
          },
          {
            name: "MarketPlace",
            value: String(marketPlaceField.value ?? "-"),
          }
        );
    });

    const editedMessage = await webhookClient.editMessage(messageId, {
      username: "Edited User",
      embeds: [...embededBuilders],
    });
  }
});

// login our discord bot
client.login(process.env.DISCORD_KEY);
