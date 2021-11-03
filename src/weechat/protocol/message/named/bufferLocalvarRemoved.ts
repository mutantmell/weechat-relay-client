import { Message, WeeInt, WeeString }  from "../../message";
import { constructLocalVariables } from "../constructLocalVariables";

export interface BufferLocalvarRemoved {
    type: '_buffer_localvar_removed'
    number: number
    fullName: string
    localVariables: Map<string, string>
}

export function parse(msg: Message): BufferLocalvarRemoved[] {
    if (msg.values.length !== 1) {
        throw new Error("what");
    }

    const value = msg.values[0];

    if (value.type !== "hdata") {
        throw new Error("what");
    }

    return value.value.map(hdata => ({
        type: '_buffer_localvar_removed',
        number: (hdata.entries['number'] as WeeInt).value,
        fullName: (hdata.entries['full_name'] as WeeString).value,
        localVariables: constructLocalVariables(hdata),
    }));
}
