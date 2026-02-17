import { Bot, Context, h } from "koishi";
import type { Session } from "koishi";
import { BlacklistDetector } from "../utils";
import { Config, BasicType } from "../config";
export default class ProcessorDiscord {
    static process(elements: h[], config: Config, [from, to]: [BasicType, BasicType], ctx: Context, message: string, message_data: Session["event"]["message"], dc_bot: Bot, qqbot: Bot, Blacklist: BlacklistDetector): Promise<string>;
}
