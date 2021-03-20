import * as Message from './protocol/message';
import * as Request from './protocol/request';

export interface Config {
    url: string,
    port: number
}

export class Weechat {
    private ws: WebSocket;
    private parser: Message.MessageParser;

    private constructor (ws: WebSocket, parser: Message.MessageParser) {
        this.ws = ws;
        this.parser = parser;
    }

    public static make(config: Config): Weechat {
        const ws = new WebSocket(
            `ws://${config.url}:${config.port}`
        );
        const parser = new Message.MessageParser(
            new TextDecoder()
        );
        return new Weechat(ws, parser);
    }

    public send(requests: [Request.Request, ...Request.Request[]]): void {
        this.ws.send(requests.map((req) => Request.format(req)).join());
    }

    public register(onMessage: (msg: Message.Message) => void) {
        // this is inefficient, as we have to parse once/consumer, but eh
        this.ws.addEventListener('message', event => onMessage(this.parser.parse(event.data)))
    }

}
