import * as Reference from "./reference";

export interface Completion {
    name: 'completion';
    buffer: Reference.Reference;
    position?: number;
    data: string
}

export function format(c: Completion): string {
    return [
        'completion',
        Reference.format(c.buffer),
        c.position ? c.position.toString() : "-1",
        c.data,
    ].join(' ');
}
