require("dotenv").config();
const { Client, IntentsBitField, EmbedBuilder } = require("discord.js");
const {
  RestClient,
  CollectionNameRequest,
  NftSocialRequest,
} = require("@hellomoon/api");
const { paginateUntilEmpty } = require("../util/paginationToken.js");

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

/* 
    1. "interactionCreate" argument references the commands registered in 'registerCommands.js'
    2. for example, 
        ```
            switch (interaction.commandName) 
                case "ping": 
        ```
        references
        ```
            const commands = [
            {
                name: "ping",
                description: "Replies with pong!",
            },
        ]
        ```
*/

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  switch (interaction.commandName) {
    case "ping": {
      interaction.reply("Pong!");
      break;
    }
    // https://docs.hellomoon.io/reference/post_v0-nft-collection-name
    case "get-collection-name": {
      const { data: collectionNameResponse } = await helloMoonClient.send(
        new CollectionNameRequest({
          helloMoonCollectionId: interaction.options.getString(
            "input-id-by-collection-name"
          ),
        })
      );

      interaction.reply({
        content: `The collection name is: ${collectionNameResponse[0].collectionName}`,
        ephemeral: true,
      });
      break;
    }
    // https://docs.hellomoon.io/reference/post_v0-nft-social
    case "social-media-links": {
      const { data: nftSocialResponse } = await helloMoonClient.send(
        new NftSocialRequest({
          helloMoonCollectionId: interaction.options.getString(
            "input-hellomoon-collection-id"
          ),
        })
      );

      const imageUrl = nftSocialResponse[0].image;
      const description = nftSocialResponse[0].description;

      const embed = new EmbedBuilder()
        .setTitle("NFT Social Links")
        .setColor("Blue")
        .setThumbnail(imageUrl)
        .addFields({
          name: "Description",
          value: description,
          inline: true,
        });

      interaction.reply({
        content: `${nftSocialResponse[0].collectionName}`,
        ephemeral: true,
        embeds: [embed],
      });
      break;
    }
    // https://docs.hellomoon.io/reference/post_v0-nft-collection-name
    // learn how to use paginationTokens
    case "get-all-collection_ids": {
      const limit = 1000;

      const collectionNamePromise = async (paginationToken) => {
        if (paginationToken) {
          return await helloMoonClient.send(
            new CollectionNameRequest({ limit, paginationToken })
          );
        } else {
          return await helloMoonClient.send(
            new CollectionNameRequest({ limit })
          );
        }
      };

      interaction.deferReply({
        content: "getting all collection ids...",
        ephemeral: true,
      });

      const allCollections = await paginateUntilEmpty(collectionNamePromise);

      interaction.editReply({
        content: "finished getting all collection ids",
        ephemeral: true,
      });
      break;
    }
    default: {
      interaction.reply({
        content: "There is no command with that matches the provided name.",
        ephemeral: true,
      });
      break;
    }
  }
});

// bot logs in everytime to make a request
client.login(process.env.DISCORD_KEY);
