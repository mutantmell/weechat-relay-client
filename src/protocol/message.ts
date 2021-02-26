export interface Header {
    length: number;
    compression: 'none' | 'zlib';
}

export interface Payload {
    id?: string;
}

export type ObjectType =
  'char' |
  'int' |
  'long' |
  'string' |
  'buffer' |
  'pointer' |
  'time' |
  'hash' |
  'hdata' |
  'info' |
  'infolist' |
  'array';

export class MessageParser {
    header(data: ArrayBuffer): [Header, ArrayBuffer] {
        const len = this.number(data, 0);
        return [null, null];
    }

    // unsigned
    private byte(data: ArrayBuffer, ptr: number): [number, number] {
        return [
            ptr + 1,
            new DataView(data).getUint8(ptr),
        ];
    }

    // signed
    private number(data: ArrayBuffer, ptr: number): [number, number] {
        return [
            ptr + 4,
            new DataView(data).getInt32(ptr, false),
        ];
    }

    private char(data: ArrayBuffer, ptr: number): [number, string] {
        const [ptr2, byt] = this.byte(data, ptr);
        return [
            ptr2,
            String.fromCharCode(byt),
        ];
    }


    private utfDecoder: TextDecoder = new TextDecoder();
    private decode(data: ArrayBuffer): string {
        return this.utfDecoder.decode(new Uint8Array(data));
    }

    private type(data: ArrayBuffer, ptr: number): [number, ObjectType?] {
        var type: ObjectType;
        switch (this.decode(data.slice(ptr, ptr + 3))) {
            case 'chr':
                type = 'char';
                break;
            case 'int':
                type = 'int';
                break;
            case 'lon':
                type = 'long';
                break;
            case 'str':
                type = 'string';
                break;
            case 'buf':
                type = 'buffer';
                break;
            case 'ptr':
                type = 'pointer';
                break;
            case 'tim':
                type = 'time';
                break;
            case 'htb':
                type = 'hash';
                break;
            case 'hda':
                type = 'hdata';
                break;
            case 'inf':
                type = 'info';
                break;
            case 'inl':
                type = 'infolist';
                break;
            case 'arr':
                type = 'array';
                break;
            default:
                type = null;
                break;
        }
        return [
            ptr + 3,
            type,
        ]
    }

    private shortBuffer(data: ArrayBuffer, ptr: number): [number, ArrayBuffer] {
        const [ptr2, len] = this.byte(data, ptr);
        return [
            ptr2 + len,
            data.slice(ptr2, ptr2 + len),
        ];
    }

    private buffer(data: ArrayBuffer, ptr: number): [number, ArrayBuffer?] {
        const [ptr2, len] = this.number(data, ptr);
        var data: ArrayBuffer;
        switch(len) {
            case -1:
                data = null;
                break;
            default:  //TODO: do we have to special case 0?
                data = data.slice(ptr2, ptr2 + len);
                break;
        }
        return [
            ptr2 + len,
            data,
        ];
    }

    private string(data: ArrayBuffer, ptr: number): [number, string?] {
        const [ptr2, buf] = this.buffer(data, ptr);
        const str: string = buf ? this.decode(buf) : null;
        return [
            ptr2,
            str,
        ];
    }

    private longint(data: ArrayBuffer, ptr: number): [number, bigint] {
        const [ptr2, buf] = this.shortBuffer(data, ptr);
        const int: bigint = BigInt(this.decode(buf));
        return [
            ptr2,
            int,
        ];
    }

    private pointer(data: ArrayBuffer, ptr: number): [number, string] {
        const [ptr2, buf] = this.shortBuffer(data, ptr);
        return [
            ptr2,
            '0x' + this.decode(buf),
        ]
    }

    private time = this.longint;
}
