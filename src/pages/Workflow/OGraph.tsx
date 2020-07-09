import React from "react";
import ReactDOM from "react-dom";
import {FontSizeOutlined, ReloadOutlined} from "@ant-design/icons";
import {Alert, Button, Col, Input, Layout, Row, Checkbox, Form} from "antd";
import * as joint from "jointjs";
import QueueAnim from "rc-queue-anim";
import {FormInstance} from "antd/lib/form";
import {RouteComponentProps, withRouter} from "react-router";
import WorkflowDeployForm from "./WorkflowDeployForm";
import WorkflowSaveForm from "./WorkflowSaveForm";

import {getDemo, getFourRoundPorts} from "./graphHelper";
import {
    OGraphProps,
    OGraphState,
    PassingEventInfo,
    ExtendedJqueryEvent,
    ObjectCounter,
    PropertiesOfElement,
    sendAlertType,
} from "./interface";

import "./OGraph.css";
import "jointjs/dist/joint.css";
import ToolsMenu from "./ToolsMenu";
import {determineIfIsPropertiesArray, getExtraPropertiesFromModelId, getIndexByModelId} from "./propertiesHelper";

const {Content, Sider} = Layout;


class Graph extends React.Component<RouteComponentProps & OGraphProps, OGraphState> {
    private graph: joint.dia.Graph;

    private paper: joint.dia.Paper | null;

    private keyObjectCounter: ObjectCounter;

    private propertiesOfElementArray: Array<PropertiesOfElement>;

    JSONFormRef = React.createRef<FormInstance>();

    JSONSimplified = true;

    constructor(props: RouteComponentProps & OGraphProps) {
        super(props);
        // 'opt' for reconstruction of the graph
        this.graph = new joint.dia.Graph({}, {cellNamespace: joint.shapes});
        this.paper = null;
        this.keyObjectCounter = {
            startPointNumber: 0,
            endPointNumber: 0,
            stepPointNumber: 0,
        };
        this.propertiesOfElementArray = [];
        this.state = {
            collapsedRight: false,
            JSONText: "",
            clickedElement: null,
            alertArrays: [],
        };
    }

    sendAlert: sendAlertType = (content, title = "警告", type = "warning") => {
        this.setState({
            alertArrays: [...this.state.alertArrays, <Alert
                key={`alert${  (new Date()).valueOf()}`}
                message={title}
                description={content}
                type={type}
                showIcon
                closable
            />],
        });
    };

    onCollapseRight = (collapsed: boolean) => {
        this.setState({collapsedRight: collapsed});
    };

    scaleContentToFit = () => {
        if (this.paper) {
            this.paper.scaleContentToFit({padding: 50});
        }
    };

    resetContent = () => {
        this.graph.resetCells([]);
        this.setState({
            JSONText: "",
            clickedElement: null,
            alertArrays: [],
        });
        this.keyObjectCounter = {
            startPointNumber: 0,
            endPointNumber: 0,
            stepPointNumber: 0,
        };
        this.propertiesOfElementArray = [];
    };

    // Manual Connect Element Function
    connectElement = (sourceElement: joint.dia.Element | null, targetElement: joint.dia.Element | null) => {
        if (sourceElement && targetElement) {
            const linkElements = this.graph.getConnectedLinks(sourceElement);
            const firstIndex = linkElements.findIndex((value) => {
                return value.getTargetElement()?.id === targetElement?.id;
            });
            if (firstIndex >= 0) {
                linkElements.splice(0, firstIndex + 1);
            }
            const isConnected = linkElements.some((value, index) => {
                return value.getTargetElement()?.id === targetElement?.id;
            });
            if (isConnected) {
                this.sendAlert("不可在元素间重复添加边！");
            } else {
                new joint.shapes.standard.Link({
                    source: {id: sourceElement.id},
                    target: {id: targetElement.id},
                    z: -1,
                }).addTo(this.graph);
            }
        }
    };

    // Get Json string from graph model.
    getGraphJSONString = () => {
        if (!this.JSONSimplified) {
            const resultJSON = {graph: this.graph.toJSON(), extra: this.propertiesOfElementArray};
            this.JSONFormRef.current?.setFieldsValue({
                "result-json": JSON.stringify(resultJSON),
            });
            return;
        }
        const graphElements: Array<joint.dia.Element> = this.graph.getElements();
        const graphLinks: Array<joint.dia.Link> = this.graph.getLinks();
        const optimizedJSON: any = {
            nodes: [],
            links: [],
        };
        try {
            for (let i = 0, len = graphElements.length; i < len; i++) {
                const {type} = graphElements[i].attributes;
                if (type === "standard.Circle" || type === "standard.Rectangle") {
                    optimizedJSON.nodes.push({
                        id: graphElements[i].cid,
                        nodeName: graphElements[i].attributes.attrs.label.text,
                        extra: getExtraPropertiesFromModelId(this.propertiesOfElementArray, graphElements[i].id.toString(), true),
                    });
                }
            }

            for (let i = 0, len = graphLinks.length; i < len; i++) {
                const {type} = graphLinks[i].attributes;
                if (type === "standard.Link") {
                    const fromIndex = getIndexByModelId(graphElements, graphLinks[i].attributes.source.id, "id");
                    const toIndex = getIndexByModelId(graphElements, graphLinks[i].attributes.target.id, "id");
                    optimizedJSON.links.push({
                        from: graphElements[fromIndex].cid,
                        to: graphElements[toIndex].cid,
                        condition: graphLinks[i].attributes.labels ? graphLinks[i].attributes.labels[0]?.attrs.text.text : "",
                    });
                }
            }
            this.JSONFormRef.current?.setFieldsValue({
                "result-json": JSON.stringify(optimizedJSON),
            });
        } catch (e) {
            this.sendAlert(`转换出错！请联系管理员。${e}`);
        }
    }
    ;

    getGraphFromJSONString = (values: Record<string, any>) => {
        if (values["result-json"]) {
            try {
                const analysisObj = JSON.parse(values["result-json"]);
                const graphObj = analysisObj.graph;
                const extraObj = analysisObj.extra;
                if (graphObj && graphObj.hasOwnProperty("cells")) {
                    if (graphObj.cells.length === 0) {
                        this.sendAlert("JSON为空！");
                        return;
                    }
                    this.graph.fromJSON(graphObj);
                } else {
                    this.sendAlert("JSON非法！简化JSON不可解析！");
                    return;
                }
                if (extraObj && extraObj.length) {
                    if (determineIfIsPropertiesArray(extraObj)) {
                        this.propertiesOfElementArray = extraObj;
                    } else {
                        this.sendAlert("附加信息非法！将忽略附加信息！");
                    }
                }
            } catch (e) {
                this.sendAlert(`转换出错！请联系管理员。${e}`);
            }
        } else {
            this.sendAlert("请输入JSON！");
        }

    };

    componentDidMount() {
        // Initialize Paper
        this.paper = new joint.dia.Paper({
            el: ReactDOM.findDOMNode(this.refs.placeholder),
            width: "800px",
            height: "500px",
            gridSize: 10,
            drawGrid: true,
            model: this.graph,
            clickThreshold: 5,
            sorting: joint.dia.Paper.sorting.APPROX,
            connectionStrategy: joint.connectionStrategies.pinAbsolute,
            defaultConnectionPoint: {name: "boundary", args: {selector: "border"}},
            defaultLink: new joint.shapes.standard.Link({z: -1}),
            cellViewNamespace: joint.shapes,
        });


        const elements = getDemo();
        this.graph.resetCells(elements);
        this.keyObjectCounter.endPointNumber++;
        this.keyObjectCounter.startPointNumber++;
        this.keyObjectCounter.stepPointNumber = 3;

        const linkEnds = [
            {source: 0, target: 1}, {source: 1, target: 2}, {source: 2, target: 3}, {source: 3, target: 4},
        ];

        // add all links to the graph
        linkEnds.forEach((ends) => {
            new joint.shapes.standard.Link({
                source: {id: elements[ends.source].id},
                target: {id: elements[ends.target].id},
                z: -1, // make sure all links are displayed under the elements
            }).addTo(this.graph);
        });

        const _this = this;

        this.paper.on({
            "link:mouseenter": (linkView: joint.dia.LinkView) => {
                linkView.addTools(new joint.dia.ToolsView({
                    tools: [
                        // new joint.linkTools.Vertices({snapRadius: 0}),
                        new joint.linkTools.SourceArrowhead(),
                        new joint.linkTools.TargetArrowhead(),
                        new joint.linkTools.Remove({
                            distance: 20,
                        }),
                    ],
                }));
            },
            "link:connect": (linkView: joint.dia.LinkView, evt: JQuery.Event, elementViewConnected: joint.dia.ElementView) => {
                _this.connectElement(
                    linkView.model.getSourceElement(), linkView.model.getTargetElement(),
                );
            },
            "link:pointerdblclick": (linkView: joint.dia.LinkView, evt: JQuery.Event) => {
                const link = linkView.model;
                let labelText = "";
                if (link.labels().length !== 0) {
                    const label = link.label(0).attrs;
                    if (label && label.text?.text) {
                        labelText = label.text.text;
                    }
                }
                const text = prompt("修改条件", labelText);

                if (text !== null) {
                    link.removeLabel();
                    link.appendLabel({
                        attrs: {text: {text}},
                        position: {
                            offset: 15,
                            distance: 0.5,
                        },
                    });
                }
            },
            "element:pointerclick": function (elementView: joint.dia.ElementView) {
                if (_this.state.clickedElement) {
                    _this.state.clickedElement.unhighlight();
                }
                elementView.highlight();
                // const element = elementView.model;
                // console.log(element.toJSON());
                _this.setState({
                    clickedElement: elementView,
                });
            },
            "element:pointerdblclick": function (elementView: joint.dia.ElementView) {
                const element = elementView.model;
                const text = prompt("修改标题", element.attr("label").text);
                if (text !== null) {
                    element.attr({
                        label: {text},
                        root: {title: text},
                    });
                }
            },
            "element:mouseenter": function (elementView: joint.dia.ElementView) {
                elementView.model.addPorts(getFourRoundPorts("4-rounds"));
                const offset = elementView.model instanceof joint.shapes.standard.Circle
                    ? {x: 85.5, y: 14.5}
                    : {x: 100, y: 0};
                elementView.addTools(new joint.dia.ToolsView({
                    tools: [
                        new joint.elementTools.Remove({
                            useModelGeometry: true,
                            y: `${(offset.y)}%`,
                            x: `${(offset.x)}%`,
                        }),
                    ],
                }));
            },
            "element:mouseleave": function (elementView: joint.dia.ElementView) {
                elementView.model.removePorts();
            },
            "cell:mouseleave": function (cellView: { removeTools: () => void }) {
                cellView.removeTools();
            },
            "cell:mousewheel": (cellView: joint.dia.CellView, evt: JQuery.Event, x: number, y: number, delta: number) => {
                if (_this.paper) {
                    evt.preventDefault();
                    const scale = _this.paper.scale();
                    if (delta > 0) {
                        _this.paper.scale(scale.sx * 1.05, scale.sy * 1.05);
                    } else {
                        _this.paper.scale(scale.sx * 0.95, scale.sy * 0.95);
                    }
                }
            },
            "blank:pointerclick": (evt: JQuery.Event, x: number, y: number) => {
                if (_this.state.clickedElement) {
                    _this.state.clickedElement.unhighlight();
                }
                _this.setState({
                    clickedElement: null,
                });
            },
            "blank:pointerdown": function (evt: ExtendedJqueryEvent, x: number, y: number) {
                const data: PassingEventInfo = evt.data = {
                    x: 0,
                    y: 0,
                    cell: new joint.shapes.standard.Rectangle(),
                };
                let cell;
                if (evt.shiftKey) {
                    cell = new joint.shapes.standard.Link({
                        source: {x, y},
                        target: {x, y},
                        z: -1, // make sure all links are displayed under the elements
                    });
                } else {
                    // const type = ["rectangle", "ellipse"][joint.g.random(0, 1)];
                    cell = new joint.shapes.standard.Rectangle();
                    cell.position(x, y);
                    data.x = x;
                    data.y = y;
                }
                data.cell = cell;
            },
            "blank:pointermove": function (evt: ExtendedJqueryEvent, x: number, y: number) {
                const {data} = evt;
                const {cell} = data;
                if (cell.isLink() && !(cell instanceof joint.dia.Element)) {
                    cell.target({x, y});
                } else {
                    // cell.addTo(_this.graph);
                    const bbox = new joint.g.Rect(data.x, data.y, x - data.x, y - data.y);
                    bbox.normalize();
                    cell.set({
                        position: {x: bbox.x, y: bbox.y},
                        size: {width: Math.max(bbox.width, 100), height: Math.max(bbox.height, 40)},
                    });
                }
            },
            "blank:pointerup": function (evt: ExtendedJqueryEvent) {
                const {cell} = evt.data;
                if (cell.isLink()) return;
                cell.attr({
                    body: {
                        stroke: "#000000",
                        fill: "#FFFFFF",
                    },
                });
            },
            "blank:mousewheel": (evt: JQuery.Event, x: number, y: number, delta: number) => {
                if (_this.paper) {
                    evt.preventDefault();
                    const scale = _this.paper.scale();
                    if (delta > 0) {
                        _this.paper.scale(scale.sx * 1.05, scale.sy * 1.05);
                    } else {
                        _this.paper.scale(scale.sx * 0.95, scale.sy * 0.95);
                    }
                }
            },
        });

    }

    render() {
        return (
            <Layout>
                <div className="alert-window">
                    <QueueAnim>
                        {this.state.alertArrays}
                    </QueueAnim>
                </div>
                <Content style={{marginTop: "35px"}}>
                    <Row gutter={[16, 8]}>
                        <Col span={24}>
                            <div className="graph-panel" ref="placeholder">
                                SVG Not Supported！Please update your browser!
                            </div>
                        </Col>
                    </Row>
                    <Row className="button-group" gutter={[16, 8]}>
                        <Col span={24}>
                            <WorkflowDeployForm/>
                            <WorkflowSaveForm/>
                            <Button type="primary" onClick={this.scaleContentToFit}>
                                <FontSizeOutlined/> 自动调整
                            </Button>
                            <Button type="primary" onClick={this.resetContent}>
                                <ReloadOutlined/> 清空工作区
                            </Button>
                        </Col>
                    </Row>
                    <Row gutter={[16, 8]}>
                        <Col span={24}>
                            <div className="description">
                                {/* 按住 <span className="keyboard-key">⇧ shift</span> 并在空白区域拖拽创建一个箭头。 */}
                                双击矩形改变标签值，双击线条添加条件，滚动鼠标放大或缩小绘图区。
                            </div>
                        </Col>
                    </Row>
                    <Row gutter={[16, 8]}>
                        <Col span={24}>
                            <Form
                                ref={this.JSONFormRef}
                                layout="vertical"
                                onFinish={this.getGraphFromJSONString}
                            >
                                <Form.Item
                                    name="result-json"
                                    rules={[{required: false}]}
                                    className="result-text-box"
                                >
                                    <Input.TextArea rows={5}
                                    />
                                </Form.Item>

                                <div className="function-buttons-vertical">
                                    <Checkbox className="input-element" defaultChecked onChange={(e) => {
                                        this.JSONSimplified = e.target.checked;
                                    }}>简化JSON</Checkbox>

                                    <Button className="input-element" type="primary"
                                            onClick={this.getGraphJSONString}>生成描述字符</Button>
                                    <Form.Item>
                                        <Button className="input-element" htmlType="submit">解析描述字符</Button>
                                    </Form.Item>
                                </div>

                            </Form>
                        </Col>

                    </Row>
                </Content>
                <Sider className="internal-side-bar-right"
                       collapsible
                       collapsed={this.state.collapsedRight}
                       onCollapse={this.onCollapseRight}
                       breakpoint="lg"
                       collapsedWidth="0"
                       width={250}
                       theme="light">
                    <ToolsMenu graph={this.graph} keyObjectCounter={this.keyObjectCounter}
                               clickedElement={this.state.clickedElement}
                               propertiesOfElementArray={this.propertiesOfElementArray}
                               sendAlert={this.sendAlert}/>
                </Sider>
            </Layout>

        );
    }
}

export default withRouter(Graph)
