import * as joint from "jointjs";

/**
 * Get Port Group (Four Round)
 * @param groupName Group need to be added
 */
export const getFourRoundPorts = (groupName: string) => {
    return [{
        group: groupName,
        args: {x: 0, y: "50%"},
    }, {
        group: groupName,
        args: {x: "50%", y: 0},
    }, {
        group: groupName,
        args: {x: "100%", y: "50%"},
    }, {
        group: groupName,
        args: {x: "50%", y: "100%"},
    }];
};

/**
 * Get StartPoint SVG Element
 * @param withFourAroundPorts need to add port?
 * @param position init position
 */
export const getStartPoint = (withFourAroundPorts = false, position = {x: 50, y: 50}) => {
    const portItems = withFourAroundPorts ? getFourRoundPorts("4-rounds") : [];

    return new joint.shapes.standard.Circle({
        position,
        size: {width: 60, height: 60},
        attrs: {
            label: {text: "开始", fill: "#ffffff"},
            body: {fill: "#1abc9c", "stroke-opacity": "0%"},
        },
        ports: {
            groups: {
                "4-rounds": {
                    attrs: {
                        circle: {
                            r: 4, magnet: true, stroke: "#c3c4c6", "stroke-width": 1, fill: "#ffffff",
                        },
                    },
                    position: {
                        name: "absolute",
                    },
                },
            },
            items: portItems,
        },
    });
};

/**
 * Get EndPoint SVG Element
 * @param withFourAroundPorts need to add port?
 * @param position init position
 */
export const getEndPoint = (withFourAroundPorts = false, position = {x: 50, y: 50}) => {
    const portItems = withFourAroundPorts ? getFourRoundPorts("4-rounds") : [];

    return new joint.shapes.standard.Circle({
        position,
        size: {width: 60, height: 60},
        attrs: {
            label: {text: "完成", fill: "#ffffff"},
            body: {fill: "#d9363e", "stroke-opacity": "0%"},
        },
        ports: {
            groups: {
                "4-rounds": {
                    attrs: {
                        circle: {
                            r: 4, magnet: true, stroke: "#c3c4c6", "stroke-width": 1, fill: "#ffffff",
                        },
                    },
                    position: {
                        name: "absolute",
                    },
                },
            },
            items: portItems,
        },
    });
};

/**
 * Get Step SVG Element
 * @param withFourAroundPorts need to add port?
 * @param position init position
 * @param title init title
 */
export const getStepRectangle = (withFourAroundPorts = false, position = {x: 50, y: 50}, title?: string) => {
    const portItems = withFourAroundPorts ? getFourRoundPorts("4-rounds") : [];

    return new joint.shapes.standard.Rectangle({
        position,
        size: {width: 130, height: 40},
        attrs: {
            label: {text: title || "步骤"},
        },
        ports: {
            groups: {
                "4-rounds": {
                    attrs: {
                        circle: {
                            r: 4, magnet: true, stroke: "#c3c4c6", "stroke-width": 1, fill: "#ffffff",
                        },
                    },
                    position: {
                        name: "absolute",
                    },
                },
            },
            items: portItems,
        },
    });
};

/**
 * Debug---------------------------------------------------------------
 */
export const getDemo = () =>
    [
        getStartPoint(false, {x: 75, y: 175}),
        getStepRectangle(false, {x: 200, y: 175}, "过程一"),
        getStepRectangle(false, {x: 350, y: 175}, "过程二"),
        getStepRectangle(false, {x: 500, y: 175}, "过程三"),
        getEndPoint(false, {x: 650, y: 175}),
    ];
