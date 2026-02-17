import { Logger, HTTP } from 'koishi';
import { MessageBody } from './types';
export declare const logger: Logger;
export declare function convertMsTimestampToISO8601(msTimestamp: number): string;
export declare function generateMessageBody(): MessageBody;
export declare function getDate(): string;
export declare function getBinary(url: string, http: HTTP): Promise<[Blob, string, string]>;
export declare class BlacklistDetector {
    private blacklist;
    constructor(blacklist: string[]);
    check(input: string): boolean;
}
