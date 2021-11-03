import { Message, WeeInt, WeeString } from "../../message";
import { NicklistGroup } from "../nicklistGroup";

export interface Nicklist {
    type: '_nicklist'
    group: NicklistGroup
    visible: boolean
    level: number
    name: string
    color: string | null
    prefix: string | null
    prefixColor: string | null
}

export function parse(msg: Message): Nicklist[] {
    if (msg.values.length !== 1) {
        throw new Error("what");
    }

    const value = msg.values[0];

    if (value.type !== "hdata") {
        throw new Error("what");
    }

    return value.value.map(hdata => ({
        type: '_nicklist',
        group: (hdata.entries['group'] as WeeInt).value as NicklistGroup,
        visible: (hdata.entries['visible'] as WeeInt).value === 1,
        level: (hdata.entries['level'] as WeeInt).value,
        name: (hdata.entries['name'] as WeeString).value,
        color: (hdata.entries['color'] as WeeString).value,
        prefix: (hdata.entries['prefix'] as WeeString).value,
        prefixColor: (hdata.entries['prefix_color'] as WeeString).value,
    }));
}
