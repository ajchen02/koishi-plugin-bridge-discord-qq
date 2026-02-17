import { Schema } from 'koishi';
export interface Constant {
    enable: boolean;
    note: string;
    from: Array<BasicType>;
    to: Array<BasicType>;
}
export interface BasicType {
    platform: string;
    channel_id: string;
    self_id: string;
}
export interface Config {
    words_blacklist: Array<string>;
    discordAvatar: boolean;
    debug: boolean;
    file_processor: "Koishi" | "QQBot";
    discord_default_avatar_color: 99 | 0 | 1 | 2 | 3 | 4;
    download_threads: number;
    qq_file_limit: number;
    discord_file_limit: number;
    constant?: Array<Constant>;
}
declare module "koishi" {
    interface Tables {
        bridge_message: BridgeMessage;
    }
}
export interface BridgeMessage {
    id: number;
    timestamp: bigint;
    from_message_id: string;
    from_platform: string;
    from_channel_id: string;
    from_guild_id: string;
    from_sender_id: string;
    from_sender_name: string;
    to_message_id: string;
    to_platform: string;
    to_channel_id: string;
    to_guild_id: string;
    onebot_real_message_id: string;
}
export declare const Config: Schema<Config>;
