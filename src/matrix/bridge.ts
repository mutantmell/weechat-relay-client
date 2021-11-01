import {
    Bridge,
    BridgeContext,
    MatrixUser,
    Request,
    WeakEvent,
} from 'matrix-appservice-bridge';
    
export interface WeechatBridgeConfig {

}

export function bridge(config: WeechatBridgeConfig) {
    return new Bridge({
        homeserverUrl: "http://localhost:8008",
        domain: "localhost",
        registration: "slack-registration.yaml",
        controller: {
            onUserQuery: function(user: MatrixUser) {
                return {}; // auto-provision users with no additonal data
            },
    
            onEvent: function(request: Request<WeakEvent>, context: BridgeContext) {
                return; // we will handle incoming matrix requests later
            }
        }
    });
}
