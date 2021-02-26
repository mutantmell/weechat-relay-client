import * as Request from './protocol/request';

export interface Config {
    url: string,
    port: number
}

export class Weechat {
    private ws: WebSocket;

    private constructor (ws: WebSocket) {
        this.ws = ws;
    }

    public static make(config: Config): Weechat {
        const ws = new WebSocket(
            `ws://${config.url}:${config.port}`
        );
        return new Weechat(ws);
    }

    public send(requests: [Request.Request, ...Request.Request[]]): void {
        this.ws.send(requests.map((req) => Request.format(req)).join("\n") + "\n");
    }

}
