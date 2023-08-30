import { CommandContext, SlashCommand, SlashCreator } from 'slash-create';
import { v4 } from 'uuid';
import { ApiKey } from '../models/api_key.js';

export default class ApiKeyCommand extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: 'apikey',
      description: 'Generate Historical Stats API key.',
    });

    this.filePath = import.meta.url;
  }

  async run(interaction: CommandContext) {
    const newKey = v4();

    const keyInfo = await ApiKey.findOneAndUpdate(
      { ownerId: interaction.user.id },
      { $set: { apiKey: newKey } },
      { upsert: true, new: true }
    );

    await interaction.send(
      `# Historical Stats API
Here's your **secret** API key:

\`${newKey}\`

Limit: \`${keyInfo.rateLimit}\`/min
# What's next
Visit the [API Documentation](https://api.historicalstats.net/) and if you have any questions ask in the [Support Server](https://discord.gg/wX8RJxZZZ8)`,
      { ephemeral: true }
    );
  }
}
