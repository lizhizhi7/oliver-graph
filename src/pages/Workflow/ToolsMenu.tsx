import React from "react";
import {Button, Col, Collapse, Form, Input, Row, Tooltip, message} from "antd";
import {FormInstance} from "antd/lib/form";
import {PropertiesOfElement, ToolsMenuProps} from "./interface";
import {getEndPoint, getStartPoint, getStepRectangle} from "./graphHelper";
import {getIndexByModelId} from "./propertiesHelper";

const {Panel} = Collapse;

export default class ToolsMenu extends React.Component<ToolsMenuProps> {
    formRef = React.createRef<FormInstance>();

    componentDidUpdate(): void {
        this.reFill();
    }

    addStartPoint2Graph = () => {
        if (this.props.keyObjectCounter.startPointNumber - 1 < 0) {
            getStartPoint(false).addTo(this.props.graph);
            this.props.keyObjectCounter.startPointNumber++;
        } else {
            this.props.sendAlert("图中最多只可添加一个起始点！");
        }
    };

    addEndPoint2Graph = () => {
        if (this.props.keyObjectCounter.endPointNumber - 1 < 0) {
            getEndPoint(false).addTo(this.props.graph);
            this.props.keyObjectCounter.endPointNumber++;
        } else {
            this.props.sendAlert("图中最多只可添加一个起始点！");
        }
    };

    addStepPoint2Graph = () => {
        this.props.keyObjectCounter.stepPointNumber++;
        getStepRectangle(false).addTo(this.props.graph);
    };


    setElementProperties = (properties: PropertiesOfElement) => {
        const elementIndex = getIndexByModelId(this.props.propertiesOfElementArray, properties.modelId);
        if (elementIndex >= 0) {
            this.props.propertiesOfElementArray[elementIndex].department = properties.department;
            this.props.propertiesOfElementArray[elementIndex].person = properties.person;
        } else {
            this.props.propertiesOfElementArray.push(properties);
        }
        message.success("设置成功！");
    };

    onReset = () => {
        this.formRef.current?.resetFields();
    };

    reFill = () => {
        if (this.props.clickedElement) {
            const elementIndex = getIndexByModelId(this.props.propertiesOfElementArray, this.props.clickedElement.model.id.toString());
            if (elementIndex >= 0) {
                this.formRef.current?.setFieldsValue({
                    department: this.props.propertiesOfElementArray[elementIndex].department,
                    person: this.props.propertiesOfElementArray[elementIndex].person,
                });
            } else {
                this.formRef.current?.setFieldsValue({
                    department: "",
                    person: "",
                });
            }
        }
    };

    onFinish = (values: Record<string, any>) => {
        if (this.props.clickedElement && values.department && values.person) {
            const propertiesOfElement: PropertiesOfElement = {
                modelId: this.props.clickedElement.model.id.toString(),
                viewId: this.props.clickedElement.id,
                department: values.department,
                person: values.person,
            };
            this.setElementProperties(propertiesOfElement);
        } else {
            this.props.sendAlert("当前未选中元素！非法操作");
        }
    };

    render() {
        return (
            <>
                <div className="tooltips-title">工具栏</div>
                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <Tooltip title="创建开始点">
                            <Button onClick={this.addStartPoint2Graph} className="start-point" type="primary"
                                    shape="circle"/>
                        </Tooltip>
                    </Col>
                    <Col span={12}>
                        <Tooltip title="创建结束点">
                            <Button onClick={this.addEndPoint2Graph} className="end-point" type="primary"
                                    shape="circle"/>
                        </Tooltip>
                    </Col>
                </Row>
                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <Tooltip title="创建步骤">
                            <Button onClick={this.addStepPoint2Graph} type="primary"/>
                        </Tooltip>
                    </Col>
                    <Col span={12}/>
                </Row>
                <Row style={{marginTop: "60px", textAlign: "left"}} gutter={[16, 16]}>
                    {this.props.clickedElement ? (
                        <Col span={24}>
                            <Collapse bordered={false} defaultActiveKey={["2"]}>
                                <Panel header="属性概览" key="1">
                                    位置：{`x: ${  Math.fround(this.props.clickedElement?.getBBox().x)  } y: ${  Math.fround(this.props.clickedElement?.getBBox().y)}`}<br/>
                                    大小：{`宽: ${  Math.fround(this.props.clickedElement?.getBBox().width)  } 高: ${  Math.fround(this.props.clickedElement?.getBBox().height)}`}<br/>
                                </Panel>
                                <Panel header="属性修改" key="2">
                                    <Form ref={this.formRef}
                                          layout="vertical"
                                          onFinish={this.onFinish}
                                    >
                                        <Form.Item
                                            name="department"
                                            label="指定机构"
                                            rules={[{required: true, message: "指定机构名称不能为空！"}]}
                                        >
                                            <Input placeholder="请输入指定机构名称"/>
                                        </Form.Item>
                                        <Form.Item
                                            name="person"
                                            label="指定人员"
                                            rules={[{required: true, message: "人员名不能为空"}]}
                                        >
                                            <Input
                                                style={{width: "100%"}}
                                                placeholder="请输入指定人员名"
                                            />
                                        </Form.Item>
                                        <Form.Item style={{textAlign: "center"}}>
                                            <Button style={{marginRight: "10px"}} type="primary" htmlType="submit">
                                                保存
                                            </Button>
                                            <Button htmlType="button" onClick={this.onReset}>
                                                清空
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                </Panel>
                            </Collapse>
                        </Col>) : null}
                </Row></>);
    }

}
