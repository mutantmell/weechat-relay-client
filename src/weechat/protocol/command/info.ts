export interface Info {
    name: 'info';
    value: string;
}

export function format(i: Info): string {
    return `info ${i.value}`;
}
