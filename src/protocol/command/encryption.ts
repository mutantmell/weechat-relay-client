export type Hash = 'sha256' | 'sha512'
export type KeyDerivation = 'pbkdf2'

export interface HashEncryption {
    type: 'hash';
    hash: Hash;
}

export interface HashKeyEncryption {
    type: 'hash-key';
    hash: Hash;
    keyDerivation: KeyDerivation;
}

export type Encryption = HashEncryption | HashKeyEncryption

function exhaustive(never: never) {
    throw new Error('inexhaustive match on Encryption');
}

export function format(e: Encryption): string {
    switch (e.type) {
        case 'hash': return e.hash;
        case 'hash-key': return `${e.hash}-${e.keyDerivation}`;
        default: exhaustive(e);
    }
}
