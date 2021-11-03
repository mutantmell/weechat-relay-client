import { Message, WeeString, WeeValue }  from "../../message";

export interface HandshakeResponse {
    type: 'handshake_response'
    passwordHashAlgo: string
    passwordHashIterations: number
    totp: boolean
    nonce: string
    compression: string
}

export function parse(msg: Message): HandshakeResponse {
    if (msg.values.length !== 1) {
        throw new Error("what");
    }

    const value = msg.values[0];

    if (value.type !== "hash") {
        throw new Error("what");
    }
    if (value.keyTy !== 'string' || value.valueTy !== 'string') {
        throw new Error("what");
    }
    
    const hash = new Map<string, string>();
    value.value.forEach((v,k) => hash[(k as WeeString).value] = (v as WeeString).value);

    return {
        type: 'handshake_response',
        passwordHashAlgo: hash['password_hash_algo'],
        passwordHashIterations: Number.parseInt(hash['password_hash_iterations']),
        totp: hash['totp'] === 'on',
        nonce: hash['nonce'],
        compression: hash['compression'],
    };
}
