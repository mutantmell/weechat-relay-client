import * as Completion from './completion';
import * as Handshake from './handshake';
import * as HData from './hdata';
import * as Init from './init';
import * as Info from './info';
import * as Infolist from './infolist';
import * as Input from './input';
import * as Nicklist from './nicklist';
import * as Ping from './ping';
import * as Quit from './quit';
import * as Sync from './sync';
import * as Test from './test';

export type Command =
  Handshake.Handshake |
  Init.Init |
  HData.HData |
  Info.Info |
  Infolist.Infolist |
  Nicklist.Nicklist |
  Input.Input |
  Completion.Completion |
  Sync.Sync |
  Sync.Desync |
  Test.Test |
  Ping.Ping |
  Quit.Quit;

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
        case 'completion':
            return Completion.format(c);
        case 'sync':
            return Sync.format(c);
        case 'desync':
            return Sync.format(c);
        case 'test':
            return Test.format(c);
        case 'ping':
            return Ping.format(c);
        case 'quit':
            return Quit.format(c);
        default:
            exhaustive(c);
    }
}
