export interface MessageBody {
    text: string;
    form: FormData;
    n: number;
    embed: Array<object>;
    validElement: boolean;
    hasFile: boolean;
    mentionEveryone: boolean;
}
