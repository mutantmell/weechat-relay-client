import * as Encryption from "./encryption";

export type PasswordHashAlgorithm =
  'plain' | Encryption.Encryption

export type Compression = 'zlib' | 'off';

export interface Handshake {
    name: 'handshake';
    passwordHashAlgorithm?: PasswordHashAlgorithm;
    compression?: Compression;
}

export function format(h: Handshake) {
    const args = [];

    if (h.passwordHashAlgorithm === 'plain') {
        args.push('password_hash_algo=plain');
    } else if (h.passwordHashAlgorithm) {
        const pass = Encryption.format(h.passwordHashAlgorithm)
        args.push(`password_hash_algo=${pass}`);
    }

    if (h.compression) {
        args.push(`compression=${h.compression}`);
    }

    return `handshake ${args.join(",")}`;
}
