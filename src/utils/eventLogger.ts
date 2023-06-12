import { Client, TextChannel, EmbedBuilder, ColorResolvable } from "discord.js";
import { logChannelID } from "../config";

// Exported data for the loggers
export enum LogType {
    Interaction,
    Info,
    Warning,
    Error
}
export interface LogMetadata {
    [key: string]: string | undefined;
}

interface pendingLogs {
    type: LogType;
    message: string;
    metadata?: LogMetadata;
}

// Main Logging functions
let logChannel : TextChannel;

let pendingLogs : pendingLogs[] | null = [];

export async function initailizeLogger(channel : Client) : Promise<void> {
    // Check if the log channel already initalized
    if(logChannel !== undefined && logChannel !== null) {
        console.log("Log channel already initialized!");
        sendLog(LogType.Error, "System attempted to initialize log channel twice!");
        return;
    }
    // Configure the discord log channel
    logChannel = await channel.channels.fetch(logChannelID) as TextChannel;
    for(const log of pendingLogs!) {
        await sendLog(log.type, log.message, log.metadata);
    }
    pendingLogs = null;
}

export async function sendLog(type: LogType, message: string, extraMetadata?: LogMetadata) : Promise<void> {
    // Check if the log channel is initialized
    if(logChannel === undefined || logChannel === null)  {
        console.log(`Log channel not initialized, this log will be added to the pre-initialization queue! (Log Message: ${message})`);
        pendingLogs?.push({
            type: type,
            message: message,
            metadata: extraMetadata
        });
        return;
    }

    // Check for dev env, if it is, console.log it instead of channel logging.
    if(process.env['ENVIRONMENT'] === "DEV") return console.log(`__DEV-MODE__ [${getLogType(type)}]: ${message}`);

    // Create Discord Channel Log Embed
    const embed = new EmbedBuilder()
        .setTitle(`${getLogType(type)} Log`)
        .setDescription(type === LogType.Error ? "||<@233955058604179457>|| "+message : message)
        .setColor(getEmbedColor(type));
    
    // Add extra metadata
    if(typeof extraMetadata !== "undefined" && extraMetadata !== null) {
        for(const [name, value] of Object.entries(extraMetadata))
            if(value) embed.addFields({name, value});
    }

    // Setup footer
    embed.setTimestamp();
    embed.setFooter({text: `Internal Report System`});

    // Send the embed log
    await logChannel.send({embeds: [embed]});
}

// Internal Functions
function getEmbedColor(type: LogType) : ColorResolvable {
    switch(type) {
        case LogType.Interaction:
            return "#00FF00";
        case LogType.Info:
            return "#0000FF";
        case LogType.Warning:
            return "#FFFF00";
        case LogType.Error:
            return "#FF0000";
        default:
            return "#00FFFF";
    }
}
function getLogType(type: LogType) : string {
    switch(type) {
        case LogType.Interaction:
            return "Interaction";
        case LogType.Info:
            return "Info";
        case LogType.Warning:
            return "Warning";
        case LogType.Error:
            return "Error";
        default:
            return "Unknown";
    }
}