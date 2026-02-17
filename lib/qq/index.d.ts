import { Bot, Context, Dict, h, Session, HTTP } from "koishi";
import { BlacklistDetector } from "../utils";
import { Config, BasicType } from "../config";
import { MessageBody } from "../types";
export default class ProcessorQQ {
    static process(elements: h[], session: Session, config: Config, [from, to]: [BasicType, BasicType], ctx: Context, message_body: MessageBody, Blacklist: BlacklistDetector): Promise<[boolean, string]>;
    static at(uid: string, group_id: string, session: Session, message_body: MessageBody): Promise<[boolean, string]>;
    static face(url: string, message_body: MessageBody, http: HTTP): Promise<[boolean, string]>;
    static file(attrs: Dict, discord_file_limit: number, session: Session, message_body: MessageBody, group_id: string, http: HTTP): Promise<[boolean, string]>;
    static forward(blacklist: BlacklistDetector, channel_id: string, contents: Array<object>, dc_bot: Bot, [from, to]: [BasicType, BasicType], ctx: Context): Promise<void>;
    static image(url: string, message_body: MessageBody, http: HTTP): Promise<[boolean, string]>;
    static json(raw: string, message_body: MessageBody): [boolean, string];
    static text(blacklist: BlacklistDetector, message_content: string, message_body: MessageBody): [boolean, string];
    static video(attrs: Dict, discord_file_limit: number, message_body: MessageBody, http: HTTP, session: Session): Promise<[boolean, string]>;
}
