export interface Infolist {
    name: 'infolist';
    value: string;
    pointer?: string;
}

export function format(i: Infolist): string {
    var args = [i.value];
    if (i.pointer) {
        args.push(i.pointer);
    }

    return `infolist ${args.join(' ')}`;
}
