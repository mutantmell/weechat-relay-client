import { exception } from "console";
import { Message, WeeBuffer, WeeInt, WeeString } from "../../message";
import { constructLocalVariables } from "../constructLocalVariables";

export interface BufferOpened {
    type: '_buffer_opened',
    number: number
    fullName: string
    shortName: string | null
    hasNicklist: boolean
    title: string
    localVariables: Map<string, string>
    prevBuffer: WeeBuffer
    nextBuffer: WeeBuffer
}

export function parse(msg: Message): BufferOpened[] {
    if (msg.values.length !== 1) {
        throw new exception("what");
    }

    const value = msg.values[0];

    if (value.type !== "hdata") {
        throw new exception("what");
    }

    return value.value.map(hdata => ({
            type: '_buffer_opened',
            number: (hdata.entries['number'] as WeeInt).value,
            fullName: (hdata.entries['full_name'] as WeeString).value,
            shortName: (hdata.entries['full_name'] as WeeString).value,
            hasNicklist: (hdata.entries['nicklist'] as WeeInt).value == 1,
            title: (hdata.entries['title'] as WeeString).value,
            localVariables: constructLocalVariables(hdata),
            prevBuffer: (hdata.entries['prev_buffer'] as WeeBuffer),
            nextBuffer: (hdata.entries['next_buffer'] as WeeBuffer),
    }));
}
