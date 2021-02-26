import * as Reference from "./reference";

export type Count = number | '*'

function formatCount(c: Count): string {
    if (c === '*') {
        return '(*)';
    } else {
        return `(${c})`;
    }
}

export interface Var {
    name: string
    count?: Count
}

export interface Path {
    name: string
    pointer: Reference.Reference
    count?: Count
    vars: [Var]
}

export interface HData {
    name: 'hdata';
    path: Path
    keys?: [string, ...string[]];
}

export function format(h: HData): string {
    const args = [];

    args.push(
        h.path.name,
        ':',
        Reference.format(h.path.pointer)
    );
    if (h.path.count) {
        args.push(formatCount(h.path.count));
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
