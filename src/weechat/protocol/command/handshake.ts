import * as Encryption from "./encryption";

export type PasswordHashAlgorithm =
  'plain' | Encryption.Encryption

export type Compression = 'zlib' | 'off';

export interface Handshake {
    name: 'handshake';
    passwordHashAlgorithm?: PasswordHashAlgorithm[];
    compression?: Compression;
}

export function format(h: Handshake): string {
    const command = [
        'handshake'
    ];

    const args = [];
    if (h.passwordHashAlgorithm) {
        const algos = [];
        h.passwordHashAlgorithm.forEach((algo) => {
            if (algo === 'plain') {
                algos.push('plain');
            } else {
                algos.push(Encryption.format(algo));
            }
        });
        args.push(`password_hash_algo=${algos.join(':')}`);
    }
    if (h.compression) {
        args.push(`compression=${h.compression}`);
    }
    if (args.length > 0) {
        command.push(args.join(","));
    }

    return command.join(' ');
}
