import { Message, Weechat, } from "../weechat";

class WeechatBridge {
    
    private client: Weechat;

    private constructor(weechatClient: Weechat) {
        this.client = weechatClient;
    }

    private mkListener() {
        this.client.register((msg: Message) => {
            msg.values.forEach(value => {
                switch(value.type) {
                    
                }
            });
        })
    }

    public static initialize(weechatClient: Weechat): WeechatBridge {
        const bridge = new WeechatBridge(weechatClient);

        return bridge;
    }

}