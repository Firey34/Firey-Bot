const YouTubeNotifier = require('youtube-notification');
import { Client, TextChannel } from 'discord.js';


/*
import WebhookServer from '../utils/WebhookServer';
WebhookServer.use("/youtube/callback", notifier.listen());

Example Reference
{
  video: {
    id: 'oah97oNMz28',
    title: 'aaaaaaaaaaa',
    link: 'https://www.youtube.com/watch?v=oah97oNMz28'
  },
  channel: {
    id: 'UCNZslkqeU_592TWvxs4zxtg',
    name: 'The overseer',
    link: 'https://www.youtube.com/channel/UCNZslkqeU_592TWvxs4zxtg'
  },
  published: 2022-04-28T20:34:48.000Z,
  updated: 2022-04-28T20:35:09.471Z
}

{
  type: 'subscribe',
  channel: 'UCNZslkqeU_592TWvxs4zxtg',
  lease_seconds: '432000'
}
*/



const ChannelID = "UCKsRmVfwU-IkVWhfiSVp1ig";
export default (client : Client) => {
    const NotificationChannel = client.channels.cache.find(channel => channel.id === "912150616908890142") as TextChannel;
    const notifier = new YouTubeNotifier({
        hubCallback: 'http://service.zhiyan114.com:46271/youtube/callback',
        port: 46271,
        secret: 'NotifierSecret_aos9z8vh2na68z8df7aa982jahfg6738',
        path: '/youtube/callback'
    })
    notifier.setup();

    // @ts-ignore (Legacy Library)
    notifier.on('notified', data =>{
        NotificationChannel.send({ content: `<@968319680093773844> New Video is out!! Check it out here: ${data.video.link}` });
    })
    // @ts-ignore
    notifier.on('subscribe', data =>{
        console.log("Youtube Notification Service started...");
    })
    // @ts-ignore
    notifier.on('unsubscribe', data => {
        console.log("Youtube Notification Service Stopped. Restarting....")
        notifier.subscribe(ChannelID)
    })
    notifier.subscribe(ChannelID);
}