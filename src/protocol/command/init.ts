import * as Encryption from "./encryption";

export interface PasswordPlain {
    type: 'password';
    password: string;
}

export interface PasswordHash {
    type: 'password_hash';
    encryption: Encryption.HashEncryption;
    salt: string;
    hash: string;
}

export interface PasswordKeyHash {
    type: 'password_key_hash';
    encryption: Encryption.HashKeyEncryption;
    salt: string;
    hash: string;
    iterations: number; //int
}

export type Password = PasswordPlain | PasswordHash | PasswordKeyHash

function exhaustive(never: never) {
    throw new Error('inexhaustive match on Password')
}

export interface Init {
    name: 'init';
    password: Password;
    totp?: string
}

function escape(s: string): string {
    return s.replace(/,/g, "\\,");
}

export function format(i: Init): string {
    const args = [];
    switch (i.password.type) {
        case 'password':
            args.push(`password=${escape(i.password.password)}`);
            break;
        case 'password_hash':
            args.push('password_hash=' + [
                Encryption.format(i.password.encryption),
                i.password.salt,
                i.password.hash
            ].join(':'));
            break;
        case 'password_key_hash':
            args.push('password_hash=' + [
                Encryption.format(i.password.encryption),
                i.password.salt,
                i.password.iterations.toString(),
                i.password.hash
            ].join(':'));
            break;
        default:
            exhaustive(i.password);
    }
    if (i.totp) {
        args.push(`totp=${i.totp}`);
    }

    return `init ${args.join(",")}`;
}
