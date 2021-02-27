export interface Nicklist {
    name: 'nicklist';
    buffer?: string;
}

export function format(n: Nicklist): string {
    var args = ['nicklist'];
    if (n.buffer) {
        args.push(n.buffer);
    }

    return args.join(' ');
}
