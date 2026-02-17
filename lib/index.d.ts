import { Context } from 'koishi';
import { Config } from './config';
export * from "./config";
export declare const name = "bridge-qq-discord";
export declare const inject: string[];
export declare function apply(ctx: Context, config: Config): void;
