import { loadLevels } from "./config.js";

export function resolveLoad(defaultVus, defaultDuration) {
    const levelKey = (__ENV.LOAD_LEVEL || "scenario").toLowerCase();

    if (levelKey === "light" || levelKey === "medium" || levelKey === "heavy") {
        return loadLevels[levelKey];
    }

    return {
        vus: Number(__ENV.VUS || defaultVus),
        duration: __ENV.DURATION || defaultDuration,
    };
}
