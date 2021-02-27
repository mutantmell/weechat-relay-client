import * as Encryption from './command/encryption';
import * as Request from './request';

describe('handshake serialization', () => {
    test('serialize an empty handshake', () => {
        const request: Request.Request = {
            id: 'handshake',
            command: {
                name: 'handshake',
            },
        };

        expect(Request.format(request)).toEqual(
            '(handshake) handshake\n'
        );
    });

    test('serialize a handshake with plain auth', () => {
        const request: Request.Request = {
            id: 'handshake',
            command: {
                name: 'handshake',
                passwordHashAlgorithm: ['plain'],
            },
        };

        expect(Request.format(request)).toEqual(
            '(handshake) handshake password_hash_algo=plain\n'
        );
    });

    test('serialize a handshake with multiple supported algos', () => {
        const request: Request.Request = {
            id: 'handshake',
            command: {
                name: 'handshake',
                passwordHashAlgorithm: ['plain', Encryption.algo.sha256, Encryption.algo['sha256-pbkdf2']],
            },
        };

        expect(Request.format(request)).toEqual(
            '(handshake) handshake password_hash_algo=plain:sha256:pbkdf2+sha256\n'
        );
    });

    test('serialize a handshake with algos and compression disabled', () => {
        const request: Request.Request = {
            id: 'handshake',
            command: {
                name: 'handshake',
                passwordHashAlgorithm: [Encryption.algo.sha256, Encryption.algo.sha512],
                compression: 'off',
            },
        };

        expect(Request.format(request)).toEqual(
            '(handshake) handshake password_hash_algo=sha256:sha512,compression=off\n'
        );
    });
});

describe('init serialization', () => {
    test('serialize init with password', () => {
        const request: Request.Request = {
            command: {
                name: 'init',
                password: { type: 'password', password: 'mypass', },
            },
        };

        expect(Request.format(request)).toEqual(
            'init password=mypass\n'
        );
    });

    test('serialize init with commas in password', () => {
        const request: Request.Request = {
            command: {
                name: 'init',
                password: { type: 'password', password: 'mypass,with,commas', },
            },
        };

        expect(Request.format(request)).toEqual(
            'init password=mypass\\,with\\,commas\n'
        );
    });

    test('serialize init with password and totp', () => {
        const request: Request.Request = {
            command: {
                name: 'init',
                password: { type: 'password', password: 'mypass', },
                totp: '123456',
            },
        };

        expect(Request.format(request)).toEqual(
            'init password=mypass,totp=123456\n'
        );
    });

    test('serialize init with sha256 hashed password', () =>{
        const request: Request.Request = {
            command: {
                name: 'init',
                password: {
                    type: 'password_hash',
                    encryption: Encryption.algo.sha256,
                    salt: '85b1ee00695a5b254e14f4885538df0da4b73207f5aae4', // `${relay_nonce}${client_nonce}`
                    hash: '2c6ed12eb0109fca3aedc03bf03d9b6e804cd60a23e1731fd17794da423e21db', // password: test
                },
            },
        };

        expect(Request.format(request)).toEqual(
            'init password_hash=sha256:85b1ee00695a5b254e14f4885538df0da4b73207f5aae4:2c6ed12eb0109fca3aedc03bf03d9b6e804cd60a23e1731fd17794da423e21db\n'
        );
    });

    test('serialize init with sha512 hashed password', () =>{
        const request: Request.Request = {
            command: {
                name: 'init',
                password: {
                    type: 'password_hash',
                    encryption: Encryption.algo.sha512,
                    salt: '85b1ee00695a5b254e14f4885538df0da4b73207f5aae4', // `${relay_nonce}${client_nonce}`
                    hash: '0a1f0172a542916bd86e0cbceebc1c38ed791f6be246120452825f0d74ef1078c79e9812de8b0ab3dfaf598b6ca14522374ec6a8653a46df3f96a6b54ac1f0f8',  // password: test
                },
            },
        };

        expect(Request.format(request)).toEqual(
            'init password_hash=sha512:85b1ee00695a5b254e14f4885538df0da4b73207f5aae4:0a1f0172a542916bd86e0cbceebc1c38ed791f6be246120452825f0d74ef1078c79e9812de8b0ab3dfaf598b6ca14522374ec6a8653a46df3f96a6b54ac1f0f8\n'
        );
    });

    test('serialize init with hash-keyed password', () =>{
        const request: Request.Request = {
            command: {
                name: 'init',
                password: {
                    type: 'password_key_hash',
                    encryption: Encryption.algo['sha256-pbkdf2'],
                    salt: '85b1ee00695a5b254e14f4885538df0da4b73207f5aae4', // `${relay_nonce}${client_nonce}`
                    iterations: 100000,
                    hash: 'ba7facc3edb89cd06ae810e29ced85980ff36de2bb596fcf513aaab626876440', // password: test
                },
            },
        };

        expect(Request.format(request)).toEqual(
            'init password_hash=pbkdf2+sha256:85b1ee00695a5b254e14f4885538df0da4b73207f5aae4:100000:ba7facc3edb89cd06ae810e29ced85980ff36de2bb596fcf513aaab626876440\n'
        );
    });
});
