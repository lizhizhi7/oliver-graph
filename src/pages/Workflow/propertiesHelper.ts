import {PropertiesOfElement} from "./interface";

/**
 * Get extra properties of the cell by Model ID
 * @param propertiesOfElementArray
 * @param modelId Cell Model ID
 */
const getExtraPropertiesFromModelId = (propertiesOfElementArray: Array<PropertiesOfElement>, modelId: string, simplified = false) => {
    const index = getIndexByModelId(propertiesOfElementArray, modelId);
    if (index >= 0) {
        return simplified ?
            {
                department: propertiesOfElementArray[index].department,
                person: propertiesOfElementArray[index].person
            } : propertiesOfElementArray[index];
    } else {
        return {};
    }
};

const determineIfIsPropertiesArray = (toBeDetermined: Array<any>): toBeDetermined is Array<PropertiesOfElement> => {
    return !!((toBeDetermined as Array<PropertiesOfElement>).length
        && (toBeDetermined as Array<PropertiesOfElement>)[0].person
        && (toBeDetermined as Array<PropertiesOfElement>)[0].department
        && (toBeDetermined as Array<PropertiesOfElement>)[0].modelId
    );
};

/**
 * Get the index of the element by comparing Model ID
 * @param initElementArray init Elements array
 * @param modelId model ID
 * @param rename Array Primary Key
 */
const getIndexByModelId = (initElementArray: Array<any>, modelId: string, keyRename="modelId") => {
    return initElementArray.findIndex((value => {
        return value[`${keyRename}`] === modelId;
    }));
};

export {getExtraPropertiesFromModelId, determineIfIsPropertiesArray, getIndexByModelId}
