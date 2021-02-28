import * as Reference from "./reference";

export interface Full {
    type: 'full';
}

export type PartialOptions = 'buffers' | 'upgrade';
export type Options = PartialOptions | 'buffer' | 'nicklist';

export interface AllBuffers {
    type: 'all-buffers';
    options?: Set<Options>;
}

export interface Partial {
    type: 'partial';
    buffer: Reference.Reference;
    options?: Set<PartialOptions>;
}

export type Sync = { name: 'sync' } & (Full | AllBuffers | Partial);
export type Desync = { name: 'desync' } & (Full | AllBuffers | Partial);

function exhaustive(never: never) {
    throw new Error('inexhaustive match on Sync');
}

export function format(s: Sync | Desync) {
    var args = [];
    switch (s.name) {
        case 'sync':
            args.push('sync');
            break;
        case 'desync':
            args.push('desync');
            break;
        default:
            exhaustive(s);
    }
    switch (s.type) {
        case 'full':
            break;
        case 'all-buffers':
            args.push('*')
            if (s.options) {
                args.push(Array.from(s.options).join(','));
            }
            break;
        case 'partial':
            args.push(
                Reference.format(s.buffer)
            );
            if (s.options) {
                args.push(Array.from(s.options).join(','));
            }
            break;
        default:
            exhaustive(s);
    }

    return args.join(' ');
}
