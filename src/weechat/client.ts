import * as Message from './protocol/message';
import * as Request from './protocol/request';
import * as WebSocket from 'ws';

export interface Config {
    url: string,
    port: number,
    ssl: boolean,
}

export class Weechat {
    private ws: WebSocket;
    private parser: Message.MessageParser;
    private messages: string[]

    private constructor (ws: WebSocket, parser: Message.MessageParser, messages: string[]) {
        this.ws = ws;
        this.parser = parser;
        this.messages = messages;
    }

    public static make(config: Config): Weechat {
        const messages = [];
        const ws = new WebSocket(
            `${config.ssl ? 'wss' : 'ws'}://${config.url}:${config.port}/weechat`
        );
        ws.binaryType = 'arraybuffer';
        ws.onopen = () => {
            while (messages.length > 0) {
                ws.send(messages.pop());
            }
        };
        const parser = new Message.MessageParser(
            new TextDecoder()
        );
        ws.onerror = (ev) => {
            console.log(ev);
        };
        
        return new Weechat(ws, parser, messages);
    }

    public send(requests: [Request.Request, ...Request.Request[]]): void {
        var msg = requests.map((req) => Request.format(req)).join();
        if (this.ws.readyState !== 1) {
            this.messages.push(msg)
        } else {
            this.ws.send(msg);
        }
    }
    
    public register(onMessage: (msg: Message.Message) => void) {
        // this is inefficient, as we have to parse once/consumer, but eh
        this.ws.addEventListener('message', event => {
            onMessage(this.parser.parse(event.data as ArrayBuffer));
        });
    }

    public close(): void {
        this.ws.close();
    }
}

export interface WeechatListener {
    
}
