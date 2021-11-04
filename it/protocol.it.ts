import { Message, Weechat } from "../src/weechat";
import * as HandshakeResponse from "../src/weechat/protocol/message/implicit/handshakeResponse";
import * as Reference from '../src/weechat/protocol/command/reference';

describe('weechat integration test', () => {
    function client() {
        return Weechat.make({
            url: "localhost",
            port: 9000
        });
    } 

    it('should not currently work', async () => {
        var wc = client();

        var pr = new Promise<[HandshakeResponse.HandshakeResponse, Message]>(res => {
            var hr: HandshakeResponse.HandshakeResponse = null;
            const msgs: Message[] = [];
            wc.register(msg => {
                if (hr === null) {
                    console.log("hrm1");
                    hr = HandshakeResponse.parse(msg)
                } else {
                    console.log("hrm2");
                    res([hr, msg]);
                }
            })
        });
        
        enum ListenState {
            Ready,
            Handshake,
            Init,
            Active,
        }

        class F {

            wc: Weechat;
            listenState: ListenState;

            private constructor(wc: Weechat, ls: ListenState) {
                this.wc = wc;
                this.listenState = ls;
            }

            public static make(wc: Weechat) {
                const f = new F(wc, ListenState.Ready);
                wc.register(msg => f.listener(msg))
                return f;
            }

            public init(): void {
                this.listenState = ListenState.Handshake;
                wc.send([{
                    id: 'it-test-1',
                    command: {
                        name: 'handshake', // no security for this test
                    },
                }])
            }

            private listener(msg: Message): void {
                switch(this.listenState) {
                    case ListenState.Ready:
                        return; // todo: this is unexpected, should we fail?
                    case ListenState.Handshake:
                        const init = HandshakeResponse.parse(msg);
                        this.listenState = ListenState.Ready;
                        this.wc.send([{
                            id: 'it-test-2',
                            command: {
                                name: 'init',
                                password: {
                                    type: 'plain',
                                    value: "",
                                },
                            },
                        }]);
                        this.wc.send([{
                            id: 'test',
                            command: {
                                name: 'test',
                            },
                        }]);
                        // // In real code, would be best to send version message to check if weechat is ready
                        // this.wc.send([{
                        //     id: 'initial-buffer-request',
                        //     command: {
                        //         name: 'hdata',
                        //         path: {
                        //             name: 'buffer',
                        //             pointer: Reference.parse('gui_buffers'),
                        //             count: '*',
                        //         },
                        //         keys: [
                        //             'local_variables',
                        //             'notify',
                        //             'number',
                        //             'full_name',
                        //             'short_name',
                        //             'title',
                        //             'hidden',
                        //             'type',
                        //         ],
                        //     },
                        // },{
                        //     id: 'initial-sync-request',
                        //     command: {
                        //         name: 'sync',
                        //         type: 'full',
                        //     },
                        // }]);
                    case ListenState.Ready:
                        return;
                }
            }
        }

        const f = F.make(wc);
        f.init();

        var [result, initResult] = await pr;

        expect(result).toEqual({
            type: 'handshake_response',
            passwordHashAlgo: 'plain',
            passwordHashIterations: 100000,
            totp: false,
            nonce: result.nonce, // randomly generated
            compression: 'zlib',
        });

        expect(initResult).toEqual({
            'todo': 'fill-in',
        });

        wc.close();
    })
});
