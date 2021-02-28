export interface Ping {
    name: 'ping';
    argument?: string;
}

export function format(p: Ping) {
    var args = ['ping'];
    if (p.argument) {
        args.push(p.argument);
    }

    return args.join(' ');
}
