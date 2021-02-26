export type Compression = 'none' | 'zlib';

export interface Header {
    length: number;
    compression: Compression;
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

export interface WeeChar {
    type: 'char';
    value: string;
}
export interface WeeInt {
    type: 'int';
    value: number;
}
export interface WeeLong {
    type: 'long';
    value: bigint;
}
export interface WeeString {
    type: 'string';
    value: string;
}
export interface WeeBuffer {
    type: 'buffer';
    value: ArrayBuffer;
}
export interface WeePointer {
    type: 'pointer';
    value: string;
}
export interface WeeTime {
    type: 'time';
    value: bigint;
}
export interface WeeHash {
    type: 'hash';
    keyTy: ObjectType;
    valueTy: ObjectType;
    value: Map<WeeValue, WeeValue>;
}

export type WeeValue = WeeChar | WeeInt | WeeLong | WeeString | WeeBuffer | WeePointer | WeeTime | WeeHash;

function exhaustive(never: never) {
    throw new Error('inexhaustive match on WeeValue');
}

export class MessageParser {
    header(data: ArrayBuffer): [ArrayBuffer, Header | null] {
        const [ptr2, length] = this.number(data, 0);
        const [ptr3, byt] = this.byte(data, ptr2);
        var compression: Compression | null;
        switch (byt) {
            case 0:
                compression = 'none';
                break;
            case 2:
                compression = 'zlib';
                break;
            default:
                compression = null;
                break;
        }
        const header = compression ? { length, compression } : null;
        return [data.slice(ptr3), header];
    }

    private map<A,B>([ptr, a]: [number, A], f: (a: A) => B): [number, B] {
        return [ptr, f(a)];
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
        return this.map(
            this.byte(data, ptr),
            (byt) => String.fromCharCode(byt),
        );
    }

    private utfDecoder: TextDecoder = new TextDecoder();
    private decode(data: ArrayBuffer): string {
        return this.utfDecoder.decode(new Uint8Array(data));
    }

    private type(data: ArrayBuffer, ptr: number): [number, ObjectType | null] {
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

    private buffer(data: ArrayBuffer, ptr: number): [number, ArrayBuffer | null] {
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

    private string(data: ArrayBuffer, ptr: number): [number, string | null] {
        return this.map(
            this.buffer(data, ptr),
            (buf) => buf ? this.decode(buf) : null,
        );
    }

    private longint(data: ArrayBuffer, ptr: number): [number, bigint] {
        return this.map(
            this.shortBuffer(data, ptr),
            (buf) => BigInt(this.decode(buf)),
        );
    }

    private pointer(data: ArrayBuffer, ptr: number): [number, string] {
        return this.map(
            this.shortBuffer(data, ptr),
            (buf) => '0x' + this.decode(buf),
        );
    }

    private time = this.longint;

    private parserFor(t: ObjectType): (data: ArrayBuffer, ptr: number) => [number, WeeValue] {
        switch(t) {
            case 'array':
                return null;
            case 'buffer':
                return (data, ptr) => this.map(
                    this.buffer(data, ptr),
                    buf => ({ type: 'buffer', value: buf }),
                );
            case 'char':
                return (data, ptr) => this.map(
                    this.char(data, ptr),
                    buf => ({ type: 'char', value: buf }),
                );
            case 'hash':
                return this.hashtable;
            case 'hdata':
                return null;
            case 'info':
                return null;
            case 'infolist':
                return null;
            case 'int':
                return (data, ptr) => this.map(
                    this.number(data, ptr),
                    num => ({ type: 'int', value: num })
                );
            case 'long':
                return (data, ptr) => this.map(
                    this.longint(data, ptr),
                    num => ({ type: 'long', value: num })
                );
            case 'pointer':
                return (data, ptr) => this.map(
                    this.pointer(data, ptr),
                    num => ({ type: 'pointer', value: num })
                );
            case 'string':
                return (data, ptr) => this.map(
                    this.string(data, ptr),
                    str => ({ type: 'string', value: str })
                );
            case 'time':
                return (data, ptr) => this.map(
                    this.time(data, ptr),
                    num => ({ type: 'time', value: num })
                );
            default:
                exhaustive(t);
        }
    }

    private hashtable(data: ArrayBuffer, ptr: number): [number, WeeHash] {
        const [ptr2, keyTy] = this.type(data, ptr);
        const [ptr3, valueTy] = this.type(data, ptr2);
        const [ptr4, count] = this.number(data, ptr3);

        const keyPar = this.parserFor(keyTy);
        const valuePar = this.parserFor(valueTy);

        var loopPtr = ptr4;
        const map = new Map<WeeValue, WeeValue>();
        for (var i = 0; i < count; i++) {
            const [loopPtr2, key] = keyPar(data, loopPtr);
            const [loopPtr3, value] = valuePar(data, loopPtr2);
            map.set(key, value);
            loopPtr = loopPtr3;
        }
        return [loopPtr, { type: 'hash', keyTy, valueTy, value: map }];
    }
}
