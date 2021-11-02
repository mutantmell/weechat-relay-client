import { exception } from "console";
import { Message, WeeInt, WeeString }  from "../../message";

export interface BufferTitleChanged {
    type: '_buffer_title_changed'
    number: number
    fullName: string
    title: string
}

export function parse(msg: Message): BufferTitleChanged[] {
    if (msg.values.length !== 1) {
        throw new exception("what");
    }

    const value = msg.values[0];

    if (value.type !== "hdata") {
        throw new exception("what");
    }

    return value.value.map(hdata => ({
        type: '_buffer_title_changed',
        number: (hdata.entries['number'] as WeeInt).value,
        fullName: (hdata.entries['full_name'] as WeeString).value,
        title: (hdata.entries['title'] as WeeString).value,
    }));
}