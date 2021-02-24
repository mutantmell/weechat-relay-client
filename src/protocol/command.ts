import * as Handshake from './handshake'
import * as HData from './hdata'
import * as Init from './init'

export type Command =
  Handshake.Handshake |
  Init.Init |
  HData.HData

function exhaustive(never: never) {
    throw new Error('inexhaustive match on Command');
}

export function format(c: Command) {
    switch(c.name) {
        case 'handshake':
            return Handshake.format(c)
        case 'init':
            return Init.format(c);
        case 'hdata':
            return HData.format(c);
        default:
            exhaustive(c);
    }
}