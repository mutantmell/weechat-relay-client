import * as Init from './init'
import * as Handshake from './handshake'

export type Command =
  Handshake.Handshake |
  Init.Init

function exhaustive(never: never) {
    throw new Error('inexhaustive match on Command');
}

export function format(c: Command) {
    switch(c.name) {
        case 'handshake':
            return Handshake.format(c)
        case 'init':
            return "";
        default:
            exhaustive(c);
    }
}