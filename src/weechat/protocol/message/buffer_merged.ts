import { exception } from "console";
import { Message, WeeBuffer, WeeHash, WeeInt, WeePointer, WeeString, WeeValue } from "../message";

export interface BufferMerged {
    type: '_buffer_merged'
    number: number
    fullName: string
    prevBuffer: WeeBuffer
    nextBuffer: WeeBuffer
}

export function parse(msg: Message): BufferMerged[] {
    if (msg.values.length !== 1) {
        throw new exception("what");
    }

    const value = msg.values[0];

    if (value.type !== "hdata") {
        throw new exception("what");
    }

    return value.value.map(hdata => ({
        type: '_buffer_merged',
        number: (hdata.entries['number'] as WeeInt).value,
        fullName: (hdata.entries['full_name'] as WeeString).value,
        prevBuffer: (hdata.entries['prev_buffer'] as WeeBuffer),
        nextBuffer: (hdata.entries['next_buffer'] as WeeBuffer),
    }));
}
