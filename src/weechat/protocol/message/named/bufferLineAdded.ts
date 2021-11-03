import { Message, WeeArray, WeeInt, WeePointer, WeeString, WeeTime } from "../../message";
import { NotifyLevel } from "../notifyLevel";

export interface BufferLineAdded {
    type: '_buffer_line_added',
    buffer: WeePointer,
    date: WeeTime,
    datePrinted: WeeTime,
    displayed: boolean,
    notifyLevel: NotifyLevel,
    highlight: boolean,
    tags: string[],
    prefix: string,
    message: string,
}

export function parse(msg: Message): BufferLineAdded[] {
    if (msg.values.length !== 1) {
        throw new Error("what");
    }

    const value = msg.values[0];

    if (value.type !== "hdata") {
        throw new Error("what");
    }

    return value.value.map(hdata => ({
        type: '_buffer_line_added',
        buffer: (hdata.entries['buffer'] as WeePointer),
        date: (hdata.entries['date'] as WeeTime),
        datePrinted: (hdata.entries['date_printed'] as WeeTime),
        displayed: (hdata.entries['displayed'] as WeeInt).value === 1,
        notifyLevel: (hdata.entries['notify_level'] as WeeInt).value as NotifyLevel,
        highlight: (hdata.entries['highlight'] as WeeInt).value === 1,
        tags: (hdata.entries['tags_array'] as WeeArray).values.map(x => (x as WeeString).value),
        prefix: (hdata.entries['prefix'] as WeeString).value,
        message: (hdata.entries['message'] as WeeString).value,
    }));
}
