import * as Handshake from './handshake';
import * as HData from './hdata';
import * as Init from './init';
import * as Info from './info';
import * as Infolist from './infolist';
import * as Input from './input';
import * as Nicklist from './nicklist';

export type Command =
  Handshake.Handshake |
  Init.Init |
  HData.HData |
  Info.Info |
  Infolist.Infolist |
  Nicklist.Nicklist |
  Input.Input

function exhaustive(never: never) {
    throw new Error('inexhaustive match on Command');
}

export function format(c: Command): string {
    switch(c.name) {
        case 'handshake':
            return Handshake.format(c);
        case 'init':
            return Init.format(c);
        case 'hdata':
            return HData.format(c);
        case 'info':
            return Info.format(c);
        case 'infolist':
            return Infolist.format(c);
        case 'nicklist':
            return Nicklist.format(c);
        case 'input':
            return Input.format(c);
        default:
            exhaustive(c);
    }
}
