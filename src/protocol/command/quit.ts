export interface Quit {
    name: 'quit';
}

export function format(q: Quit) {
    return 'quit';
}
