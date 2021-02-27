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
});
