var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Config: () => Config,
  apply: () => apply,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(src_exports);
var import_koishi5 = require("koishi");
var import_sharp = __toESM(require("sharp"));

// src/config.ts
var import_koishi = require("koishi");
var Config = import_koishi.Schema.object({
  words_blacklist: import_koishi.Schema.array(String).description("屏蔽词"),
  discordAvatar: import_koishi.Schema.boolean().default(true).description("discord -> QQ：转发头像"),
  debug: import_koishi.Schema.boolean().description("开启 Debug 模式").default(false),
  file_processor: import_koishi.Schema.union([
    import_koishi.Schema.const("Koishi"),
    import_koishi.Schema.const("QQBot")
  ]).default("Koishi").description("将由哪个平台处理文件（对于 Discord -> QQ 来说，建议使用可以访问 Discord 的平台处理，通常为 Koishi）"),
  discord_default_avatar_color: import_koishi.Schema.union([
    import_koishi.Schema.const(99).description("随机颜色"),
    import_koishi.Schema.const(0).description("蓝色"),
    import_koishi.Schema.const(1).description("灰色"),
    import_koishi.Schema.const(2).description("绿色"),
    import_koishi.Schema.const(3).description("橙色"),
    import_koishi.Schema.const(4).description("红色")
  ]).default(0).description("Discord 默认头像颜色"),
  download_threads: import_koishi.Schema.number().description("下载文件时的默认线程数").default(4),
  qq_file_limit: import_koishi.Schema.number().description("QQ 文件上传大小上限，单位为字节").default(20971520),
  discord_file_limit: import_koishi.Schema.number().description("Discord 文件上传大小上限，单位为字节（该选项不应设置太高，避免超过 Discord 本身的限制）").default(10485760),
  constant: import_koishi.Schema.array(import_koishi.Schema.object({
    enable: import_koishi.Schema.boolean().description("启用").default(true),
    note: import_koishi.Schema.string().description("备注"),
    from: import_koishi.Schema.array(import_koishi.Schema.object({
      platform: import_koishi.Schema.string().description("来源平台"),
      channel_id: import_koishi.Schema.string().description("频道ID"),
      self_id: import_koishi.Schema.string().description("自身ID")
    })),
    to: import_koishi.Schema.array(import_koishi.Schema.object({
      platform: import_koishi.Schema.string().description("目标平台"),
      channel_id: import_koishi.Schema.string().description("频道ID"),
      self_id: import_koishi.Schema.string().description("自身ID")
    }))
  })).description("设置转发平台")
});

// src/utils.ts
var import_koishi2 = require("koishi");
var logger = new import_koishi2.Logger("bridge");
function convertMsTimestampToISO8601(msTimestamp) {
  const date = new Date(msTimestamp);
  return date.toISOString();
}
__name(convertMsTimestampToISO8601, "convertMsTimestampToISO8601");
function generateMessageBody() {
  return {
    text: "",
    form: new FormData(),
    n: 0,
    embed: [],
    validElement: false,
    hasFile: false,
    mentionEveryone: false
  };
}
__name(generateMessageBody, "generateMessageBody");
function getDate() {
  const now = /* @__PURE__ */ new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
__name(getDate, "getDate");
async function getBinary(url, http) {
  try {
    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
    };
    const response = await http(url, {
      method: "GET",
      headers
    });
    if (response.status !== 200) {
      throw new Error(`Request Error! URL: ${url} | Status: ${response.status} | Response: ${response.data}`);
    }
    const blob = new Blob([response.data], { type: response.headers.get("Content-Type") });
    return [blob, response.headers.get("Content-Type"), null];
  } catch (error) {
    return [null, null, error];
  }
}
__name(getBinary, "getBinary");
var BlacklistDetector = class {
  static {
    __name(this, "BlacklistDetector");
  }
  blacklist;
  constructor(blacklist) {
    this.blacklist = blacklist;
  }
  check(input) {
    for (const word of this.blacklist) {
      if (input.toLowerCase().indexOf(word.toLowerCase()) !== -1) return true;
    }
    return false;
  }
};

// src/qq/index.ts
var import_koishi3 = require("koishi");
var import_uuid = require("uuid");
var ProcessorQQ = class {
  static {
    __name(this, "ProcessorQQ");
  }
  // return [stop, reason]
  static async process(elements, session, config, [from, to], ctx, message_body, Blacklist) {
    const http = ctx.http;
    const dc_bot = ctx.bots[`discord:${to.self_id}`];
    for (const element of elements) {
      switch (element.type) {
        case "at": {
          if (element.attrs.type === "all") {
            message_body.text += "@everyone";
            message_body.validElement = true;
            message_body.mentionEveryone = true;
            break;
          }
          const [stop, reason] = await this.at(element.attrs.id, from.channel_id, session, message_body);
          if (stop) return [true, reason];
          break;
        }
        case "face": {
          const [stop, reason] = await this.face(element.children[0].attrs.src, message_body, http);
          if (stop) return [true, reason];
          break;
        }
        case "mface": {
          const [stop, reason] = await this.face(element.attrs.url, message_body, http);
          if (stop) return [true, reason];
          break;
        }
        case "file": {
          const [stop, reason] = await this.file(element.attrs, config.discord_file_limit, session, message_body, from.channel_id, http);
          if (stop) return [true, reason];
          break;
        }
        case "forward": {
          await this.forward(Blacklist, to.channel_id, element.attrs.content, dc_bot, [from, to], ctx);
          return [true, "done"];
        }
        case "img": {
          const [stop, reason] = await this.image(element.attrs.src, message_body, http);
          if (stop) return [true, reason];
          break;
        }
        case "json": {
          const [stop, reason] = this.json(element.attrs.data, message_body);
          if (stop) return [true, reason];
          break;
        }
        case "text": {
          const [stop, reason] = this.text(Blacklist, element.attrs.content, message_body);
          if (stop) return [true, reason];
          break;
        }
        case "video": {
          const [stop, reason] = await this.video(element.attrs, config.discord_file_limit, message_body, http, session);
          if (stop) return [true, reason];
          break;
        }
        default: {
          break;
        }
      }
    }
    return [false, ""];
  }
  static async at(uid, group_id, session, message_body) {
    const member = await session.onebot.getGroupMemberInfo(group_id, uid, true);
    const name2 = member.card === "" ? member.nickname : member.card;
    message_body.text += `\`@${name2}\``;
    message_body.validElement = true;
    return [false, ""];
  }
  static async face(url, message_body, http) {
    if (url === "") return [false, ""];
    const [blob, type] = await getBinary(url, http);
    message_body.form.append(`files[${message_body.n}]`, blob, `${(0, import_uuid.v4)()}.${type.split("/")[1]}`);
    message_body.n++;
    message_body.validElement = true;
    return [false, ""];
  }
  static async file(attrs, discord_file_limit, session, message_body, group_id, http) {
    try {
      const url = await session.onebot.getGroupFileUrl(group_id, attrs.fileId, 102);
      const filename = attrs.file;
      const download_url = `${url}${filename.replace(/ /g, "%20")}`;
      if (parseInt(attrs.fileSize) > discord_file_limit) {
        message_body.text += `【检测到大小大于设置上限的文件，请自行下载】
下载链接：${download_url}
文件名：${filename}`;
        message_body.validElement = true;
        await session.send(`${import_koishi3.h.quote(session.messageId)}【该条消息中的文件大小超出限制，已发送文件直链到 Discord 以供下载】`);
        return [false, ""];
      }
      const [file, _, error] = await getBinary(download_url, http);
      if (error !== null) {
        message_body.text += "【文件传输失败，请联系管理员】";
        message_body.validElement = true;
        return [false, ""];
      }
      message_body.form.append(`files[${message_body.n}]`, file, filename);
      message_body.n++;
      message_body.validElement = true;
      message_body.hasFile = true;
      message_body.text += "【检测到文件，若没有收到请前往q群查看】";
    } catch (error) {
      logger.info(error);
      message_body.text += "【文件传输失败，请联系管理员】";
      message_body.validElement = true;
    }
    return [false, ""];
  }
  static async forward(blacklist, channel_id, contents, dc_bot, [from, to], ctx) {
    const thread = await dc_bot.internal.startThreadWithoutMessage(channel_id, { name: `转发消息 ${getDate()}`, type: 11 });
    await dc_bot.internal.modifyChannel(thread.id, { locked: true });
    for (const content of contents) {
      const message_body = generateMessageBody();
      let bridge_message = false;
      let avatar = "";
      let nickname = "";
      if (content["sender"]["user_id"] === from.self_id) bridge_message = true;
      for (const element of content["message"]) {
        switch (element.type) {
          // face 和 mface 在转发消息中都为表情名称 (text)
          case "forward": {
            message_body.text += "【检测到嵌套合并转发消息，请前往 QQ 查看】";
            message_body.validElement = true;
            break;
          }
          case "image": {
            if (bridge_message && avatar === "") {
              avatar = element["data"]["url"];
              break;
            }
            await this.image(element["data"]["url"], message_body, ctx.http);
            break;
          }
          case "json": {
            this.json(element["data"]["data"], message_body);
            break;
          }
          case "text": {
            this.text(blacklist, element["data"]["text"], message_body);
            break;
          }
          default: {
            break;
          }
        }
      }
      if (!message_body.validElement) continue;
      let webhook_url = "";
      let webhook_id = "";
      let has_webhook = false;
      const webhooks_list = await dc_bot.internal.getChannelWebhooks(channel_id);
      for (const webhook of webhooks_list) {
        if (webhook["user"]["id"] === to.self_id && "url" in webhook) {
          webhook_url = webhook["url"];
          webhook_id = webhook["id"];
          has_webhook = true;
        }
      }
      if (!has_webhook) {
        const webhook = await dc_bot.internal.createWebhook(channel_id, { name: "Bridge" });
        webhook_url = webhook["url"];
        webhook_id = webhook["id"];
      }
      const payload_json = JSON.stringify({
        content: message_body.text,
        username: nickname === "" ? `[QQ:${content["sender"]["user_id"]}] ${content["sender"]["nickname"]}` : nickname,
        avatar_url: avatar === "" ? `https://q.qlogo.cn/headimg_dl?dst_uin=${content["sender"]["user_id"]}&spec=640` : avatar,
        embeds: message_body.embed
      });
      message_body.form.append("payload_json", payload_json);
      try {
        await ctx.http.post(`${webhook_url}?wait=true&thread_id=${thread.id}`, message_body.form);
      } catch (error) {
        logger.error(error);
      }
      if (!has_webhook) {
        await dc_bot.internal.deleteWebhook(webhook_id);
      }
    }
  }
  static async image(url, message_body, http) {
    const [blob, type] = await getBinary(url, http);
    message_body.form.append(`files[${message_body.n}]`, blob, `${(0, import_uuid.v4)()}.${type.split("/")[1]}`);
    message_body.n++;
    message_body.validElement = true;
    return [false, ""];
  }
  static json(raw, message_body) {
    const data = JSON.parse(raw);
    switch (data["app"]) {
      case "com.tencent.structmsg": {
        let image = {};
        if ("preview" in data["meta"]["news"]) image = { url: data["meta"]["news"]["preview"] };
        message_body.embed = [
          {
            author: {
              name: data["meta"]["news"]["title"]
            },
            description: `${data["meta"]["news"]["desc"]}

[点我跳转](${data["meta"]["news"]["jumpUrl"]})`,
            footer: {
              text: data["meta"]["news"]["tag"],
              icon_url: data["meta"]["news"]["source_icon"]
            },
            color: 2605017,
            image
          }
        ];
        message_body.validElement = true;
        break;
      }
      case "com.tencent.miniapp_01": {
        const image = {
          url: `https://${data["meta"]["detail_1"]["preview"]}`
        };
        message_body.embed = [
          {
            description: `${data["meta"]["detail_1"]["desc"]}

[点我跳转](${data["meta"]["detail_1"]["qqdocurl"]})`,
            author: {
              name: data["meta"]["detail_1"]["title"],
              icon_url: data["meta"]["detail_1"]["icon"]
            },
            color: 2605017,
            image
          }
        ];
        message_body.validElement = true;
        break;
      }
      case "com.tencent.forum": {
        const detail = data["meta"]["detail"];
        const feed = detail["feed"];
        const image = {
          url: feed["images"][0]["pic_url"]
        };
        message_body.embed = [
          {
            description: `${feed["title"]["contents"][0]["text_content"]["text"]}

*浏览 ${feed["view_count"]} | 赞 ${feed["prefer_count"]}*

[点我跳转](${detail["jump_url"]})`,
            author: {
              name: detail["channel_info"]["guild_name"],
              icon_url: detail["channel_info"]["guild_icon"]
            },
            footer: {
              text: "腾讯频道"
            },
            color: 2605017,
            image
          }
        ];
        message_body.validElement = true;
        break;
      }
      default: {
        break;
      }
    }
    return [false, ""];
  }
  static text(blacklist, message_content, message_body) {
    if (blacklist.check(message_content)) return [true, "found blacklist words"];
    message_body.text += message_content;
    message_body.validElement = true;
    return [false, ""];
  }
  static async video(attrs, discord_file_limit, message_body, http, session) {
    if (parseInt(attrs.fileSize) > discord_file_limit) {
      message_body.text += `【检测到大小大于设置上限的视频，请自行下载】
下载链接：${attrs.src || attrs.url}
文件名：${attrs.file}`;
      message_body.validElement = true;
      await session.send(`${import_koishi3.h.quote(session.messageId)}【该条消息中的视频大小超出限制，已发送视频直链到 Discord 以供下载】`);
      return [false, ""];
    }
    const [file, _] = await getBinary(attrs.src || attrs.url, http);
    message_body.form.append(`files[${message_body.n}]`, file, attrs.file);
    message_body.n++;
    message_body.validElement = true;
    message_body.hasFile = true;
    message_body.text += "【检测到视频，若没有收到请前往 QQ 查看】";
    return [false, ""];
  }
};

// src/discord/webhook.ts
async function getWebhook(dc_bot, self_id, channel_id) {
  let webhook_url = "";
  let webhook_id = "";
  let hasWebhook = false;
  const webhooks_list = await dc_bot.internal.getChannelWebhooks(channel_id);
  for (const webhook of webhooks_list) {
    if (webhook["user"]["id"] === self_id && "url" in webhook) {
      webhook_url = webhook["url"];
      webhook_id = webhook["id"];
      hasWebhook = true;
    }
  }
  if (!hasWebhook) {
    const webhook = await dc_bot.internal.createWebhook(channel_id, { name: "Bridge" });
    webhook_url = webhook["url"];
    webhook_id = webhook["id"];
  }
  return [webhook_url, webhook_id, hasWebhook];
}
__name(getWebhook, "getWebhook");

// src/discord/index.ts
var import_koishi4 = require("koishi");
var import_url = require("url");
var ProcessorDiscord = class {
  static {
    __name(this, "ProcessorDiscord");
  }
  static async process(elements, config, [from, to], ctx, message, message_data, dc_bot, qqbot, Blacklist) {
    for (const element of elements.length === 0 ? message_data.quote.elements : elements) {
      switch (element.type) {
        case "text": {
          if (Blacklist.check(element.attrs.content)) return;
          message += element.attrs.content;
          break;
        }
        case "at": {
          if (element.attrs.type === "all") {
            message += "@everyone ";
            break;
          }
          if (element.attrs.type === "here") {
            message += "@here ";
            break;
          }
          const user_info = await dc_bot.internal.getUser(element.attrs.id);
          message += `@${user_info["global_name"] === null ? element.attrs.name : user_info["global_name"]}`;
          break;
        }
        case "https:": {
          message += `https:${Object.keys(element.attrs).join("=")}`;
          break;
        }
        case "img": {
          if (config.file_processor === "Koishi") {
            const [img_blob, _, img_error] = await getBinary(element.attrs.src, ctx.http);
            if (img_error) {
              logger.error(img_error);
              break;
            }
            const img_arrayBuffer = await img_blob.arrayBuffer();
            message += import_koishi4.h.image(img_arrayBuffer, element.attrs.type);
          } else {
            message += import_koishi4.h.image(element.attrs.src);
          }
          break;
        }
        case "face": {
          const src = element.children[0].attrs.src;
          const url = `${src}${src.indexOf("?quality=lossless") !== -1 ? "&size=44" : ""}`;
          if (config.file_processor === "Koishi") {
            const [img_blob, _, img_error] = await getBinary(url, ctx.http);
            if (img_error) {
              logger.error(img_error);
              break;
            }
            const img_arrayBuffer = await img_blob.arrayBuffer();
            message += import_koishi4.h.image(img_arrayBuffer, element.attrs.type);
          } else {
            message += import_koishi4.h.image(url);
          }
          break;
        }
        case "record":
        case "file": {
          if (parseInt(element.attrs.size) > config.qq_file_limit) {
            message += "【检测到大小超过设置上限的文件，请到 Discord 查看】";
            break;
          }
          const path = await qqbot.internal.downloadFile(element.attrs.src);
          await qqbot.internal.uploadGroupFile(to.channel_id, path, element.attrs.file);
          break;
        }
        case "video": {
          if (parseInt(element.attrs.size) > config.qq_file_limit) {
            message += "【检测到大小超过设置上限的视频，请到 Discord 查看】";
            break;
          }
          try {
            const urlHost = new import_url.URL(element.attrs.src).host;
            const allowedHosts = ["youtube.com", "www.youtube.com"];
            if (allowedHosts.includes(urlHost)) break;
          } catch (error) {
            logger.error(`Invalid URL: ${element.attrs.src}`);
            break;
          }
          if (config.file_processor === "Koishi") {
            const [video_blob, _, video_error] = await getBinary(element.attrs.src, ctx.http);
            if (video_error) {
              logger.error(video_error);
              break;
            }
            const video_arrayBuffer = await video_blob.arrayBuffer();
            message += import_koishi4.h.video(video_arrayBuffer, element.attrs.type);
          } else {
            message += import_koishi4.h.video(element.attrs.src);
          }
          break;
        }
        default: {
          break;
        }
      }
    }
    return message;
  }
};

// src/index.ts
var name = "bridge-qq-discord";
var inject = ["database"];
var main = /* @__PURE__ */ __name(async (ctx, config, session) => {
  const sender = session.event.user;
  if (sender.id === session.bot.selfId) return;
  const pattern = /\[QQ:\d+\]/;
  if (pattern.test(sender.name)) return;
  const platform = session.event.platform;
  const self_id = session.event.selfId;
  const channel_id = session.event.channel.id;
  const message_data = session.event.message;
  const Blacklist = new BlacklistDetector(config.words_blacklist);
  if (config.debug) {
    logger.info("-------Message-------");
    logger.info(message_data);
    logger.info("-------Sender-------");
    logger.info(sender);
    logger.info("-------End--------");
  }
  let is_qq_file = true;
  if ("id" in message_data) is_qq_file = false;
  if (is_qq_file) return;
  let nickname = sender.isBot ? sender.name : "member" in session.event ? session.event.member.nick : sender.name;
  const elements = message_data.elements;
  if (elements.length <= 0 && !Object.keys(message_data).includes("quote")) return;
  for (const constant of config.constant) {
    if (!constant.enable) continue;
    for (const from of constant.from) {
      if (from.platform === platform && from.self_id === self_id && from.channel_id === channel_id) {
        for (const to of constant.to) {
          try {
            if (to.platform === "discord") {
              if (nickname === null) nickname = sender.name;
              const dc_bot2 = ctx.bots[`discord:${to.self_id}`];
              const message_body = generateMessageBody();
              if ("quote" in message_data) {
                const diff_platform_quote_message = await ctx.database.get("bridge_message", {
                  to_message_id: message_data.quote.id,
                  to_channel_id: channel_id
                });
                const same_platform_quote_message = await ctx.database.get("bridge_message", {
                  from_message_id: message_data.quote.id,
                  from_channel_id: channel_id
                });
                const quote_message = { type: diff_platform_quote_message.length !== 0 ? "diff" : "same", data: diff_platform_quote_message.length !== 0 ? diff_platform_quote_message : same_platform_quote_message };
                if (quote_message.data.length !== 0) {
                  let message2 = "";
                  let image = {};
                  let source = "";
                  switch (quote_message["type"]) {
                    case "same": {
                      source = "to";
                      break;
                    }
                    case "diff": {
                      source = "from";
                      if (elements[0].type === "at" && elements[0].attrs.id === self_id) {
                        elements.shift();
                      }
                      break;
                    }
                    default: {
                      break;
                    }
                  }
                  if (source === "") return;
                  const dc_message = await dc_bot2.getMessage(quote_message["data"][0][`${source}_channel_id`], quote_message["data"][0][`${source}_message_id`]);
                  if (source === "from") {
                    message_body.text += `<@${dc_message.user.id}>`;
                    message_body.validElement = true;
                  }
                  for (const element of dc_message.elements) {
                    switch (element.type) {
                      case "text": {
                        message2 += element.attrs.content;
                        break;
                      }
                      case "img": {
                        image = {
                          url: element.attrs.src
                        };
                        break;
                      }
                      case "face": {
                        message2 += import_koishi5.h.image(element.children[0].attrs.src);
                        break;
                      }
                      default: {
                        break;
                      }
                    }
                  }
                  if (Blacklist.check(message2)) return;
                  message_body.embed = [{
                    author: {
                      name: dc_message["user"]["nick"] === null ? dc_message["user"]["name"] : dc_message["user"]["nick"],
                      icon_url: dc_message["user"]["avatar"]
                    },
                    timestamp: convertMsTimestampToISO8601(Number(quote_message["data"][0]["timestamp"])),
                    description: `${message2}

[[ ↑ ]](https://discord.com/channels/${quote_message["data"][0][`${source}_guild_id`]}/${quote_message["data"][0][`${source}_channel_id`]}/${dc_message.id})`,
                    color: 2605017,
                    image
                  }];
                }
              }
              const [stop, _] = await ProcessorQQ.process(elements, session, config, [from, to], ctx, message_body, Blacklist);
              if (stop || !message_body.validElement) return;
              if (nickname === null || nickname === "") nickname = sender.name;
              const [webhook_url, webhook_id, hasWebhook] = await getWebhook(dc_bot2, to.self_id, to.channel_id);
              const payload_json = JSON.stringify({
                content: message_body.text,
                username: `[QQ] ${nickname}`,
                avatar_url: sender.avatar,
                embeds: message_body.embed,
                // https://github.com/Cola-Ace/koishi-plugin-bridge-discord-qq/issues/8
                allowed_mentions: {
                  parse: message_body.mentionEveryone ? ["everyone"] : []
                }
              });
              message_body.form.append("payload_json", payload_json);
              try {
                const res = await ctx.http.post(`${webhook_url}?wait=true`, message_body.form);
                const from_guild_id = await ctx.database.get("channel", {
                  id: channel_id
                });
                const to_guild_id = await ctx.database.get("channel", {
                  id: to.channel_id
                });
                await ctx.database.create("bridge_message", {
                  timestamp: BigInt(Date.now()),
                  from_message_id: message_data.id,
                  from_platform: platform,
                  from_channel_id: channel_id,
                  from_guild_id: from_guild_id[0]["guildId"],
                  from_sender_id: sender.id,
                  from_sender_name: nickname,
                  to_message_id: res.id,
                  to_platform: "discord",
                  to_channel_id: to.channel_id,
                  to_guild_id: to_guild_id[0]["guildId"],
                  onebot_real_message_id: message_data.id
                });
              } catch (error) {
                logger.error(error);
                if (message_body.hasFile) {
                  for (let i = 0; i < message_body.n; i++) {
                    message_body.form.delete(`files[${i}]`);
                  }
                  await ctx.http.post(`${webhook_url}?wait=true`, message_body.form);
                }
              }
              if (!hasWebhook) {
                await dc_bot2.internal.deleteWebhook(webhook_id);
              }
              continue;
            }
            const qqbot = ctx.bots[`${to.platform}:${to.self_id}`];
            const dc_bot = ctx.bots[`discord:${from.self_id}`];
            let message = "";
            let quoted_message_id = null;
            if ("quote" in message_data && message_data.content === "") {
              const data = await dc_bot.internal.getChannelMessage(channel_id, message_data.id);
              if (data.type === 6) return;
              const guild_id = await dc_bot.internal.getChannel(message_data.quote.channel.id);
              const quoted_nick = message_data.quote.user.nick === null ? message_data.quote.user.name : message_data.quote.user.nick;
              message += `===== 转发消息 =====
https://discord.com/channels/${guild_id["guild_id"]}/${message_data.quote.channel.id}/${message_data.quote.id}
===== 以下为转发内容 =====
${config.discordAvatar ? import_koishi5.h.image(`${message_data.quote.user.avatar}?size=64`) : ""}
${quoted_nick.indexOf("[QQ:") !== -1 ? "" : "[Discord] "}${quoted_nick}:
`;
            }
            if ("quote" in message_data && elements.length !== 0) {
              const diff_platform_quote_message = await ctx.database.get("bridge_message", {
                to_message_id: message_data.quote.id,
                to_channel_id: message_data.quote.channel.id
              });
              const same_platform_quote_message = await ctx.database.get("bridge_message", {
                from_message_id: message_data.quote.id,
                from_channel_id: message_data.quote.channel.id
              });
              const quote_message = diff_platform_quote_message.length !== 0 ? diff_platform_quote_message : same_platform_quote_message;
              if (quote_message.length !== 0) {
                quoted_message_id = quote_message[0]["onebot_real_message_id"];
              }
            }
            message = await ProcessorDiscord.process(elements, config, [from, to], ctx, message, message_data, dc_bot, qqbot, Blacklist);
            if (!sender.isBot) {
              const member = await dc_bot.internal.getGuildMember(session.guildId, sender.id);
              nickname = member.nick === null ? member.user.global_name : member.nick;
            }
            let avatar_color = "";
            let avatar = `${sender.avatar}?size=64`;
            if (sender.avatar === null) {
              avatar_color = config.discord_default_avatar_color.toString();
              if (config.discord_default_avatar_color === 99) {
                avatar_color = Math.floor(Math.random() * 5).toString();
              }
              avatar = `https://cdn.discordapp.com/embed/avatars/${avatar_color}.png`;
            }
            let message_content = `${quoted_message_id === null ? "" : import_koishi5.h.quote(quoted_message_id)}${config.discordAvatar ? import_koishi5.h.image(avatar) : ""}[Discord] ${nickname}:
${message}`;
            if (config.file_processor === "Koishi") {
              const [avatar_blob, avatar_type, avatar_error] = await getBinary(avatar, ctx.http);
              if (avatar_error) {
                logger.error(avatar_error);
                return;
              }
              const avatar_arrayBuffer = await avatar_blob.arrayBuffer();
              const avatar_resize_arrayBuffer = await (0, import_sharp.default)(avatar_arrayBuffer).resize(64, 64).toBuffer();
              message_content = `${quoted_message_id === null ? "" : import_koishi5.h.quote(quoted_message_id)}${config.discordAvatar ? import_koishi5.h.image(avatar_resize_arrayBuffer, avatar_type) : ""}[Discord] ${nickname}:
${message}`;
            }
            let retry_count = 0;
            while (retry_count <= 3) {
              try {
                const message_id = await qqbot.sendMessage(to.channel_id, message_content);
                const from_guild_id = await ctx.database.get("channel", {
                  id: channel_id
                });
                const to_guild_id = await ctx.database.get("channel", {
                  id: to.channel_id
                });
                try {
                  await ctx.database.create("bridge_message", {
                    timestamp: BigInt(Date.now()),
                    from_message_id: message_data.id,
                    from_platform: platform,
                    from_channel_id: channel_id,
                    from_guild_id: from_guild_id[0]["guildId"],
                    from_sender_id: sender.id,
                    from_sender_name: nickname,
                    to_message_id: message_id[0],
                    to_platform: "onebot",
                    to_channel_id: to.channel_id,
                    to_guild_id: to_guild_id[0]["guildId"],
                    onebot_real_message_id: message_id[0]
                  });
                } catch (error) {
                  logger.error(error);
                }
                break;
              } catch (error) {
                retry_count++;
                if (retry_count >= 3) {
                  logger.error(error);
                  break;
                }
                logger.info(`发送消息失败，正在重试... (${retry_count}/3)`);
                await new Promise((resolve) => setTimeout(resolve, 1e3));
              }
            }
          } catch (error) {
            logger.error(error);
          }
        }
      }
    }
  }
}, "main");
function apply(ctx, config) {
  ctx.model.extend("bridge_message", {
    id: "unsigned",
    timestamp: "bigint",
    from_message_id: "string",
    from_platform: "string",
    from_channel_id: "string",
    from_guild_id: "string",
    from_sender_id: "string",
    from_sender_name: "string",
    to_message_id: "string",
    to_platform: "string",
    to_channel_id: "string",
    to_guild_id: "string",
    onebot_real_message_id: "string"
  }, {
    primary: "id",
    autoInc: true
  });
  ctx.on("message", async (session) => await main(ctx, config, session));
}
__name(apply, "apply");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Config,
  apply,
  inject,
  name
});
