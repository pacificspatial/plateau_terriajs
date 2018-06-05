import DefinitionProperty, { DefinitionPropertyOptions } from "./DefinitionProperty";
import ModelReference from "./ModelReference";

export interface ModelArrayPropertyOptions extends DefinitionPropertyOptions {
}

export default function modelReferenceArrayProperty<T>(options: ModelArrayPropertyOptions) {
    return function(target: any, propertyKey: string) {
        const constructor = target.constructor;
        if (!constructor.metadata) {
            constructor.metadata = {};
        }
        constructor.metadata[propertyKey] = new ModelReferenceArrayProperty(propertyKey, options);
    }
}

export class ModelReferenceArrayProperty extends DefinitionProperty {
    constructor(id: string, options: ModelArrayPropertyOptions) {
        super(id, options);
    }

    // This can probably be converted to a general array handler.
    // It takes an optional idProperty. If not specified, the values are themselves IDs.
    // It ensures that each ID is unique and that the topmost stratum wins for a given ID.
    // There can even be properties to control relative ordering of items in different strata.
    getValue(model: any): ReadonlyArray<ModelReference> {
        const result = [];
        const idMap = {};
        const removedIds = {};

        // Create a single array with all the unique model IDs.
        const strata = model.strataTopToBottom;
        for (let i = 0; i < strata.length; ++i) {
            const stratum = strata[i];
            const modelIdArray: ModelReference[] = stratum[this.id];

            if (modelIdArray) {
                modelIdArray.forEach(modelId => {
                    if (ModelReference.isRemoved(modelId)) {
                        // This ID is removed in this stratum.
                        removedIds[modelId.removed] = true;
                    } else if (removedIds[modelId]) {
                        // This ID was removed by a stratum above this one, so ignore it.
                        return;
                    } else if (!idMap[modelId]) {
                        // This is the first time we've seen this ID, so add it
                        idMap[modelId] = true;
                        result.push(modelId);
                    }
                });
            }
        }

        // TODO: only freeze in debug builds?
        // TODO: can we instead react to modifications of the array?
        return Object.freeze(result);
    }
}
