import { REST, Routes, SlashCommandBuilder } from 'discord.js'
import { discordClient } from '../lib/discord'
import { robertinhoDeFinancas } from '../functions/gemini/chat'

const commands = [
  new SlashCommandBuilder()
    .setName('robertinho')
    .setDescription('Converse com o Robertinho para gerenciar suas finanças.')
    .addStringOption(option =>
      option
        .setName('mensagem')
        .setDescription('O que você quer dizer para o Robertinho?')
        .setRequired(true)
    ),
].map(command => command.toJSON())

async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!)

  try {
    console.log('⏳ Registrando comandos do Discord...')

    // Aqui estamos registrando globalmente. Se quiser apenas em um servidor, use applicationGuildCommands
    await rest.put(
      Routes.applicationCommands(
        process.env.DISCORD_CLIENT_ID || '1480712288116936826'
      ),
      { body: commands }
    )

    console.log('✅ Comandos do Discord registrados com sucesso!')
  } catch (error) {
    console.error('❌ Erro ao registrar comandos do Discord:', error)
  }
}

export async function startDiscordBot() {
  discordClient.on('ready', () => {
    console.log(`🤖 Discord Bot logado como ${discordClient.user?.tag}!`)
    registerCommands()
  })

  discordClient.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return

    if (interaction.commandName === 'robertinho') {
      const userInput = interaction.options.getString('mensagem', true)

      // Deferimos a resposta porque a IA pode demorar mais de 3 segundos
      await interaction.deferReply()

      try {
        const response = await robertinhoDeFinancas(
          userInput,
          `discord-${interaction.user.id}`
        )
        await interaction.editReply(response.message)
      } catch (error) {
        console.error('❌ Erro ao processar comando do Discord:', error)
        await interaction.editReply(
          'Puxa, deu um errinho aqui ao falar com o Robertinho. Tente de novo em um instante! 😅'
        )
      }
    }
  })

  discordClient.login(process.env.DISCORD_TOKEN).catch(err => {
    console.error('❌ Erro ao fazer login no Discord:', err)
  })
}
