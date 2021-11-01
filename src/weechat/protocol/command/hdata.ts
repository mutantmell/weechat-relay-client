import * as Reference from "./reference";

export type Count = number | '*';

function formatCount(c: Count): string {
    if (c === '*') {
        return '(*)';
    } else {
        return `(${c})`;
    }
}

export interface Var {
    name: string;
    count?: Count;
}

export interface Path {
    name: string;
    pointer: Reference.Reference;
    count?: Count;
    vars?: [Var, ...Var[]];
}

export interface HData {
    name: 'hdata';
    path: Path;
    keys?: [string, ...string[]];
}

export function format(h: HData): string {
    const args = ['hdata'];

    var path = [];
    path.push(
        h.path.name,
        ':',
        Reference.format(h.path.pointer)
    );
    if (h.path.count) {
        path.push(formatCount(h.path.count));
    }
    if (h.path.vars) {
        h.path.vars.forEach((v) => {
            path.push('/', v.name);
            if (v.count) {
                path.push(formatCount(v.count));
            }
        });
    }
    args.push(path.join(''));

    if (h.keys) {
        args.push(h.keys.join(','));
    }

    return args.join(' ');
};
