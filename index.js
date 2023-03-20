require("dotenv").config();
const { Client, IntentsBitField, EmbedBuilder } = require("discord.js");
const {
  RestClient,
  CollectionNameRequest,
  NftSocialRequest,
} = require("@hellomoon/api");
const { paginateUntilEmpty } = require("./util/paginationToken.js");

const helloMoonClient = new RestClient(process.env.HELLOMOON_API_KEY);

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

  switch (interaction.commandName) {
    case "ping": {
      interaction.reply("Pong!");
      break;
    }
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
    case "get-all-collection_ids": {
      const limit = 1000;

      const collectionNamePromise = async (paginationToken) => {
        console.log({ paginationToken });
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
      console.log({ lengthOfCollections: allCollections.length });

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

client.login(process.env.DISCORD_KEY);
