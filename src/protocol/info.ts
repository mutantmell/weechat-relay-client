export interface Info {
    name: 'info';
    value: string;
}

export function format(i: Info) {
    return `info ${i.value}`;
}
