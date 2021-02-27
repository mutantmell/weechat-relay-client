import * as Completion from './command/completion';
import * as Handshake from './command/handshake';
import * as HData from './command/hdata';
import * as Init from './command/init';
import * as Info from './command/info';
import * as Infolist from './command/infolist';
import * as Input from './command/input';
import * as Nicklist from './command/nicklist';
import * as Ping from './command/ping';
import * as Quit from './command/quit';
import * as Sync from './command/sync';
import * as Test from './command/test-c';

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
