export interface Nicklist {
    name: 'nicklist';
    buffer?: string;
}

export function format(n: Nicklist): string {
    var args = [];
    if (n.buffer) {
        args.push(n.buffer);
    }

    return `nicklist ${args.join()}`;
}
