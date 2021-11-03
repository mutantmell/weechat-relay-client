import { Message, Weechat } from "../src/weechat";
import * as HandshakeResponse from "../src/weechat/protocol/message/implicit/handshakeResponse";


describe('weechat integration test', () => {
    function client() {
        return Weechat.make({
            url: "localhost",
            port: 9000
        });
    } 

    it('should not currently work', async () => {
        var wc = client();

        const messages = new Promise<Message>((res) => {
            wc.register(msg => {
                res(msg);
            })
        })
        
        wc.send([{
            id: 'it-test-1',
            command: {
                name: 'handshake', // no security for this test
            }
        }])

        var result = await messages.then(HandshakeResponse.parse);

        expect(result).toEqual({
            type: 'handshake_response',
            passwordHashAlgo: 'plain',
            passwordHashIterations: 100000,
            totp: false,
            nonce: result.nonce, // randomly generated
            compression: 'zlib',
        })

        wc.close();
    })
});
