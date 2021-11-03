import { Message, WeeInt, WeeString }  from "../../message";

export interface BufferCleared {
    type: '_buffer_cleared'
    number: number
    fullName: string
}

export function parse(msg: Message): BufferCleared[] {
    if (msg.values.length !== 1) {
        throw new Error("what");
    }

    const value = msg.values[0];

    if (value.type !== "hdata") {
        throw new Error("what");
    }

    return value.value.map(hdata => ({
        type: '_buffer_cleared',
        number: (hdata.entries['number'] as WeeInt).value,
        fullName: (hdata.entries['full_name'] as WeeString).value,
    }));
}
