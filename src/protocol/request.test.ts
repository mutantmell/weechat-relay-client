import { Console } from 'console';
import * as Command from './command';
import * as Handshake from './command/handshake';
import * as Request from './request';

describe('handshake serialization', () => {
    test('serialize an empty handshake', () => {
        const request: Request.Request = {
            id: 'handshake',
            command: {
              name: 'handshake',
            }
        };
        
        expect(Request.format(request)).toEqual(
            '(handshake) handshake\n'
        )
    });
});