export type Count = number | '*'

export interface Pointer {
    name: string
    count?: Count
}

export interface Var {
    name: string
    count?: Count
}

export interface Path {
    name: string
    pointer: Pointer
    vars: [Var]
}

export interface HData {
    name: 'hdata';
    path: Path
    keys?: [string, ...string[]];
}

export function format(h: HData) {
    const args = [];

    args.push(`${h.path.name}:${h.path.pointer}`);
    if (h.path.pointer.count) {
        args.push(formatCount(h.path.pointer.count));
    }
    h.path.vars.forEach((v) => {
        args.push(`/${v.name}`);
        if (v.count) {
            args.push(formatCount(v.count));
        }
    });

    if (h.keys) {
        args.push(
            ' ',
            h.keys.join(',')
        );
    }

    return `hdata ${args.join()}`;
}

function formatCount(c: Count) {
    if (c === '*') {
        return '(*)';
    } else {
        return `(${c})`;
    }
}
