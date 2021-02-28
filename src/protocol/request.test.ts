import * as Encryption from './command/encryption';
import * as Reference from './command/reference';
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

describe('hdata serialization', () => {
    test('hdata request for "number" and "full_name" of all buffers', () => {
        const request: Request.Request = {
            id: 'hdata_buffers',
            command: {
                name: 'hdata',
                path: {
                    name: 'buffer',
                    pointer: Reference.parse('gui_buffers'),
                    count: '*',
                },
                keys: ['number','full_name'],
            },
        };

        expect(Request.format(request)).toEqual(
            '(hdata_buffers) hdata buffer:gui_buffers(*) number,full_name\n'
        );
    });

    test('hdata request for all lines of the first buffer', () => {
        const request: Request.Request = {
            id: 'hdata_lines',
            command: {
                name: 'hdata',
                path: {
                    name: 'buffer',
                    pointer: Reference.parse('gui_buffers'),
                    vars: [
                        {
                            name: 'own_lines',
                        },
                        {
                            name: 'first_line',
                            count: '*',
                        },
                        {
                            name: 'data',
                        },
                    ],
                },
            },
        };

        expect(Request.format(request)).toEqual(
            '(hdata_lines) hdata buffer:gui_buffers/own_lines/first_line(*)/data\n'
        );
    });

    test('hdata request for the hotlist contents', () => {
        const request: Request.Request = {
            id: 'hdata_hotlist',
            command: {
                name: 'hdata',
                path: {
                    name: 'hotlist',
                    pointer: Reference.parse('gui_hotlist'),
                    count: '*',
                },
            },
        };

        expect(Request.format(request)).toEqual(
            '(hdata_hotlist) hdata hotlist:gui_hotlist(*)\n'
        );
    });
});

describe('info serialization', () => {
    test('info request for "version"', () => {
        const request: Request.Request = {
            id: 'info_version',
            command: {
                name: 'info',
                value: 'version',
            },
        };

        expect(Request.format(request)).toEqual(
            '(info_version) info version\n'
        );
    });

    test('info request for "version_number"', () => {
        const request: Request.Request = {
            id: 'info_version_number',
            command: {
                name: 'info',
                value: 'version_number',
            },
        };

        expect(Request.format(request)).toEqual(
            '(info_version_number) info version_number\n'
        );
    });

    test('info request for "weechat_dir"', () => {
        const request: Request.Request = {
            id: 'info_weechat_dir',
            command: {
                name: 'info',
                value: 'weechat_dir',
            },
        };

        expect(Request.format(request)).toEqual(
            '(info_weechat_dir) info weechat_dir\n'
        );
    });
});

describe('infolist serialization', () => {
    test('infolist request for "buffer"', () => {
        const request: Request.Request = {
            id: 'infolist_buffer',
            command: {
                name: 'infolist',
                value: 'buffer',
            },
        };

        expect(Request.format(request)).toEqual(
            '(infolist_buffer) infolist buffer\n'
        );
    });

    test('infolist request for "window"', () => {
        const request: Request.Request = {
            id: 'infolist_window',
            command: {
                name: 'infolist',
                value: 'window',
            },
        };

        expect(Request.format(request)).toEqual(
            '(infolist_window) infolist window\n'
        );
    });
});

describe('nicklist serialization', () => {
    test('nicklist request for all buffers', () => {
        const request: Request.Request = {
            id: 'nicklist_all',
            command: {
                name: 'nicklist',
            },
        };

        expect(Request.format(request)).toEqual(
            '(nicklist_all) nicklist\n'
        );
    });

    test('nicklist request for buffer "irc.freenode.#weechat"', () => {
        const request: Request.Request = {
            id: 'nicklist_weechat',
            command: {
                name: 'nicklist',
                buffer: 'irc.freenode.#weechat',
            },
        };

        expect(Request.format(request)).toEqual(
            '(nicklist_weechat) nicklist irc.freenode.#weechat\n'
        );
    });
});

describe('completion serialization', () => {
    test('completion of a command argument', () => {
        const request: Request.Request = {
            id: 'completion_help',
            command: {
                name: 'completion',
                buffer: Reference.parse('core.weechat'),
                data: '/help fi'
            },
        };

        expect(Request.format(request)).toEqual(
            '(completion_help) completion core.weechat -1 /help fi\n'
        );
    });

    test('completion of a command in the middle of a word', () => {
        const request: Request.Request = {
            id: 'completion_query',
            command: {
                name: 'completion',
                buffer: Reference.parse('core.weechat'),
                position: 5,
                data: '/quernick'
            },
        };

        expect(Request.format(request)).toEqual(
            '(completion_query) completion core.weechat 5 /quernick\n'
        );
    });

    test('completion with nothing to complete', () => {
        const request: Request.Request = {
            id: 'completion_abcdefghijkl',
            command: {
                name: 'completion',
                buffer: Reference.parse('core.weechat'),
                data: 'abcdefghijkl'
            },
        };

        expect(Request.format(request)).toEqual(
            '(completion_abcdefghijkl) completion core.weechat -1 abcdefghijkl\n'
        );
    });
});

(['sync', 'desync'] as ('sync' | 'desync')[]).forEach (command => {
    describe(`${command} serialization`, () => {
        test(`${command} all buffers (1)`, () => {
            const request: Request.Request = {
                command: {
                    name: command,
                    type: 'full',
                },
            };
    
            expect(Request.format(request)).toEqual(
                `${command}\n`
            );
        });

        test(`${command} all buffers (2)`, () => {
            const request: Request.Request = {
                command: {
                    name: command,
                    type: 'all-buffers',
                },
            };
    
            expect(Request.format(request)).toEqual(
                `${command} *\n`
            );
        });

        test(`${command} all buffers (3)`, () => {
            const request: Request.Request = {
                command: {
                    name: command,
                    type: 'all-buffers',
                    options: new Set(['buffers','upgrade','buffer','nicklist']),
                },
            };
    
            expect(Request.format(request)).toEqual(
                `${command} * buffers,upgrade,buffer,nicklist\n`
            );
        });

        test(`${command} weechat core buffer`, () => {
            const request: Request.Request = {
                command: {
                    name: command,
                    type: 'partial',
                    buffer: Reference.parse('core.buffer'),
                },
            };
    
            expect(Request.format(request)).toEqual(
                `${command} core.buffer\n`
            );
        });

        test(`${command} #weechat channel, without nicklist`, () => {
            const request: Request.Request = {
                command: {
                    name: command,
                    type: 'partial',
                    buffer: Reference.parse('irc.freenode.#weechat'),
                    options: new Set(['buffer']),
                },
            };
    
            expect(Request.format(request)).toEqual(
                `${command} irc.freenode.#weechat buffer\n`
            );
        });

        test(`${command} #weechat channel nicklist`, () => {
            const request: Request.Request = {
                command: {
                    name: command,
                    type: 'partial',
                    buffer: Reference.parse('irc.freenode.#weechat'),
                    options: new Set(['nicklist']),
                },
            };
    
            expect(Request.format(request)).toEqual(
                `${command} irc.freenode.#weechat nicklist\n`
            );
        });

        test(`${command} all general signals`, () => {
            const request: Request.Request = {
                command: {
                    name: command,
                    type: 'all-buffers',
                    options: new Set(['buffers','upgrade']),
                },
            };
    
            expect(Request.format(request)).toEqual(
                `${command} * buffers,upgrade\n`
            );
        });

        test(`${command} all signals for #weechat channel`, () => {
            const request: Request.Request = {
                command: {
                    name: command,
                    type: 'partial',
                    buffer:Reference.parse('irc.freenode.#weechat'),
                },
            };
    
            expect(Request.format(request)).toEqual(
                `${command} irc.freenode.#weechat\n`
            );
        });
    });
});
