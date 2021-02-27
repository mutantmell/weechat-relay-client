export type Compression = 'none' | 'zlib';

export interface Header {
    length: number;
    compression: Compression;
}

export interface Payload {
    id?: string;
}

const objectTypes = [
    'char',
    'int',
    'long',
    'string',
    'buffer',
    'pointer',
    'time',
    'hash',
    'hdata',
    'info',
    'infolist',
    'array',
] as const;

export type ObjectType = typeof objectTypes[number];
function isObjectType (str: string): str is ObjectType {
    return (objectTypes as readonly string[]).includes(str);
}

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
export interface WeeHDataEntry {
    ppath: string[];
    entries: Map<string, WeeValue>
}
export interface WeeHData {
    type: 'hdata';
    hpath: string[];
    value: WeeHDataEntry[];
}

export type WeeValue =
    WeeChar |
    WeeInt |
    WeeLong |
    WeeString |
    WeeBuffer |
    WeePointer |
    WeeTime |
    WeeHash |
    WeeHData;

function exhaustive(never: never) {
    throw new Error('inexhaustive match on WeeValue');
}

export class MessageParser {
    header(data: ArrayBuffer): [ArrayBuffer, Header | null] | null {
        const [ptr2, length] = this.integer(data, 0);
        if (length !== data.byteLength) {
            return null;
        }
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
    private integer(data: ArrayBuffer, ptr: number): [number, number] {
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
        const [ptr2, len] = this.integer(data, ptr);
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
                return this.hdata;
            case 'info':
                return null;
            case 'infolist':
                return null;
            case 'int':
                return (data, ptr) => this.map(
                    this.integer(data, ptr),
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
        const [ptr4, count] = this.integer(data, ptr3);

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

    private hdata(data: ArrayBuffer, ptr: number): [number, WeeHData] {
        const [ptr2, hpath] = this.map(
            this.string(data, ptr),
            (path) => path ? path.split('/') : [],
        );
        const [ptr3, keys] = this.map(
            this.string(data, ptr2),
            (keys) => keys ? keys.split(',').map((kv) => kv.split(':')) : [],
        );
        const [ptr4, count] = this.integer(data, ptr3);

        const value: WeeHDataEntry[] = [];
        var loopPtr = ptr4;
        for (var i = 0; i < count; i++) {
            const ppath = [];
            for (var j = 0; j < hpath.length; j++) {
                const [ppathsPtr, ptr] = this.pointer(data, loopPtr);
                ppath.push(ptr);
                loopPtr = ppathsPtr;
            }
            const entries = new Map<string, WeeValue>();
            keys.forEach(([key, val]) => {
                if (isObjectType(val)) {
                    const parser = this.parserFor(val);
                    const [keysPtr, value] = parser(data, loopPtr);
                    entries.set(key, value);
                    loopPtr = keysPtr;
                } else {
                    throw new Error(`invalid hdata: ${val} is not a valid type`);
                }
            });

            value.push({ ppath, entries, });
        }

        return [loopPtr, { type: 'hdata', hpath, value }];
    }
}
