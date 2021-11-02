import { exception } from "console";
import { WeeHash, WeeHDataEntry, WeeString, WeeValue } from "../../message";

export function constructLocalVariables(hdata: WeeHDataEntry) {
    const weeHash = (hdata.entries['local_variables'] as WeeHash);
    if (weeHash.keyTy !== 'string' && weeHash.valueTy !== 'string') {
        throw new exception("what");
    }
    const lv = new Map<string, string>();
    weeHash.value.forEach((value: WeeValue, key: WeeValue) => {
        lv[(key as WeeString).value] = (value as WeeString).value;
    });
    return lv;
}
