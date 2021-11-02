import { rejects } from "assert";
import { Message, Weechat } from "../src/weechat";


describe('weechat integration test', () => {
    function client() {
        return Weechat.make({
            url: "http://localhost",
            port: 9001
        });
    } 

    it('should not currently work', async () => {
        var wc = client();

        const messages = new Promise((res) => {
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

        var result = await Promise.race([
            messages,
            new Promise((_, rej) => {
                setTimeout(() => {
                    rej("took too long to receive message");
                }, 2000);
            })
        ]);

        expect(result).toEqual({
            'not': 'the-same'
        })
    })
});
