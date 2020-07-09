import {dia} from "jointjs";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface OGraphProps {

}

export interface OGraphState {
    collapsedRight: boolean;
    JSONText: string;
    clickedElement: joint.dia.ElementView | null;
    alertArrays: Array<JSX.Element>;
}

export interface PropertiesOfElement {
    modelId: string;
    viewId: string;
    person: string;
    department: string;
}

export type sendAlertType = (content: string, title?: string, type?: "warning" | "success" | "info" | "error") => any;

export interface ToolsMenuProps {
    graph: joint.dia.Graph;
    keyObjectCounter: ObjectCounter;
    clickedElement: joint.dia.ElementView | null;
    propertiesOfElementArray: Array<PropertiesOfElement>;
    sendAlert: sendAlertType;
}


export interface PassingEventInfo {
    x: number;
    y: number;
    cell: dia.Link | dia.Element;
}

export interface ExtendedJqueryEvent extends JQuery.Event {
    data: PassingEventInfo;
}

export interface ObjectCounter {
    startPointNumber: number;
    endPointNumber: number;
    stepPointNumber: number;
}
