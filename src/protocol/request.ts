import * as Command from "./command";

export interface Request {
    id?: string
    command: Command.Command;
}

export function format(r: Request): string {
    var args = [];
    if (r.id) {
        args.push(`(${r.id})`);
    }
    args.push(Command.format(r.command));

    return args.join(' ');
}
