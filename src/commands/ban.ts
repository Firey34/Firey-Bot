import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed, GuildMember } from 'discord.js';
import { userRoleManager } from '../utils/roleManager';
import { sendLog, LogType } from '../utils/eventLogger';
import { adminRoleID }  from '../config';

/* Command Builder */
const BanCmd = new SlashCommandBuilder()
    .setName('ban')
    .setDescription(`Bans the target user.`)
    .addUserOption(option =>
        option.setName('user')
            .setDescription('The user to ban.')
            .setRequired(true)
    )
    .addStringOption(option=>
        option.setName("reason")
            .setDescription("The reason for the ban, user will see this.")
            .setRequired(true)
    )
    .addBooleanOption(option=>
        option.setName("delete")
            .setDescription("Delete all messages from the user banned user.")
            .setRequired(true)
    );

/* Function Builder */
const BanFunc = async (interaction : CommandInteraction) => {
    if (!(new userRoleManager(interaction.member as GuildMember)).check(adminRoleID)) return await interaction.reply({content: 'Access Denied!', ephemeral: true});
    const targetMember = interaction.options.getMember('user',true) as GuildMember;
    const reason = interaction.options.getString('reason',true);
    const deleteMessages = interaction.options.getBoolean('delete',true);
    const embed = new MessageEmbed()
        .setColor('#ff0000')
        .setTitle('Banned')
        .setDescription(`You have been banned from ${interaction.guild!.name}!`)
        .addField('Reason', reason)
        .setFooter({text: `Banned by ${interaction.user.username}#${interaction.user.discriminator}`})
        .setTimestamp();
    await targetMember.send({embeds:[embed]});
    await targetMember.ban({days: deleteMessages ? 7 : 0, reason: reason});
    await interaction.reply({content: 'User has been successfully banned!', ephemeral: true});
    await sendLog(LogType.Interaction, `${interaction.user.tag} has executed **ban** command`, {
        target: targetMember.user.tag,
        reason: reason,
        deleteMessages: deleteMessages.toString(),
    });
}

export default {
    command: BanCmd,
    function: BanFunc,
    disabled: false,
};