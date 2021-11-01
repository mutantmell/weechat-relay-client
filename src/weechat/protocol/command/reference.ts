export interface Pointer {
    type: 'pointer';
    value: string;
}
export interface Name {
    type: 'name';
    name: string;
}
export type Reference = Pointer | Name;

function exhaustive(never: never) {
    throw new Error('inexhaustive match on Reference');
}

export function format(r: Reference): string {
    switch (r.type) {
        case 'pointer': return r.value;
        case 'name': return r.name;
        default: exhaustive(r);
    }
}

export function parse(s: string): Reference {
    if (s.startsWith('0x')) {
        return {
            type: 'pointer',
            value: s
        };
    } else {
        return {
            type: 'name',
            name: s
        };
    }
}
