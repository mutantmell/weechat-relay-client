import * as Reference from "./reference";

export interface Completion {
    name: 'completion';
    buffer: Reference.Reference;
    position?: number;
    data?: string
}

export function format(c: Completion): string {
    var args = [
        'completion',
        Reference.format(c.buffer),
        c.position ? c.position.toString() : "-1"
    ];
    if (c.data) {
        args.push(c.data);
    }

    return args.join(' ');
}
