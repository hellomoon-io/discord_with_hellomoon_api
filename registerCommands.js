require("dotenv").config();
const { REST, Routes, ApplicationCommandOptionType } = require("discord.js");

const commands = [
  {
    name: "ping",
    description: "Replies with pong!",
  },
  {
    name: "get-collection-name",
    description: "Input Collection Id to get Collection Name",
    options: [
      {
        name: "input-id-by-collection-name",
        description: "Enter your id",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },
  {
    name: "social-media-links",
    description: "Get social media links",
    options: [
      {
        name: "input-hellomoon-collection-id",
        description: "Enter your id",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },
  {
    name: "get-all-collection_ids",
    description: "Get social media links",
  },
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_KEY);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();
