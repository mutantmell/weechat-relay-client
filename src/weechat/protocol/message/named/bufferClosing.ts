import { Message, WeeInt, WeeString }  from "../../message";

export interface BufferClosing {
    type: '_buffer_closing'
    number: number
}

export function parse(msg: Message): BufferClosing[] {
    if (msg.values.length !== 1) {
        throw new Error("what");
    }

    const value = msg.values[0];

    if (value.type !== "hdata") {
        throw new Error("what");
    }

    return value.value.map(hdata => ({
        type: '_buffer_closing',
        number: (hdata.entries['number'] as WeeInt).value,
    }));
}
