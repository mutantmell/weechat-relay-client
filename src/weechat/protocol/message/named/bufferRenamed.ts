import { exception } from "console";
import { Message, WeeBuffer, WeeInt, WeeString }  from "../../message";
import { constructLocalVariables } from "../constructLocalVariables";

export interface BufferRenamed {
    type: '_buffer_renamed'
    number: number
    fullName: string
    shortName: string
    localVariables: Map<string, string>
}

export function parse(msg: Message): BufferRenamed[] {
    if (msg.values.length !== 1) {
        throw new exception("what");
    }

    const value = msg.values[0];

    if (value.type !== "hdata") {
        throw new exception("what");
    }

    return value.value.map(hdata => ({
        type: '_buffer_renamed',
        number: (hdata.entries['number'] as WeeInt).value,
        fullName: (hdata.entries['full_name'] as WeeString).value,
        shortName: (hdata.entries['short_name'] as WeeString).value,
        localVariables: constructLocalVariables(hdata),
    }));
}
