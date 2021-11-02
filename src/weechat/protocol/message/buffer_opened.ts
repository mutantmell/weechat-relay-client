import { exception } from "console";
import { Message, WeeBuffer, WeeHash, WeeInt, WeePointer, WeeString, WeeValue } from "../message";

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

    return value.value.map(hdata => {
        const weeHash = (hdata.entries['local_variables'] as WeeHash);
        if (weeHash.keyTy !== 'string' && weeHash.valueTy !== 'string') {
            throw new exception("what");
        }
        const lv = new Map<string, string>();
        weeHash.value.forEach((value: WeeValue, key: WeeValue) => {
            lv[(key as WeeString).value] = (value as WeeString).value;
        });

        return {
            type: '_buffer_opened',
            number: (hdata.entries['number'] as WeeInt).value,
            fullName: (hdata.entries['full_name'] as WeeString).value,
            shortName: (hdata.entries['full_name'] as WeeString).value,
            hasNicklist: (hdata.entries['nicklist'] as WeeInt).value == 1,
            title: (hdata.entries['title'] as WeeString).value,
            localVariables: lv,
            prevBuffer: (hdata.entries['prev_buffer'] as WeeBuffer),
            nextBuffer: (hdata.entries['next_buffer'] as WeeBuffer),
        };
    });
}
