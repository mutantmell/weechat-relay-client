export interface Input {
    name: 'input';
    buffer: string;
    data: string; // can start with '/'
}

export function format(i: Input): string {
    return `input ${i.buffer} ${i.data}`;
}
