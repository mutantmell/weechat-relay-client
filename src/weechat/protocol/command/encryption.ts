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

export const algo: {
    'sha256': HashEncryption,
    'sha512': HashEncryption,
    'sha256-pbkdf2': HashKeyEncryption,
    'sha512-pbkdf2': HashKeyEncryption,
} = {
    'sha256': { type: 'hash', hash: 'sha256', },
    'sha512': { type: 'hash', hash: 'sha512', },
    'sha256-pbkdf2': { type: 'hash-key', hash: 'sha256', keyDerivation: 'pbkdf2', },
    'sha512-pbkdf2': { type: 'hash-key', hash: 'sha512', keyDerivation: 'pbkdf2', },
}

function exhaustive(never: never) {
    throw new Error('inexhaustive match on Encryption');
}

export function format(e: Encryption): string {
    switch (e.type) {
        case 'hash': return e.hash;
        case 'hash-key': return `${e.keyDerivation}+${e.hash}`;
        default: exhaustive(e);
    }
}
