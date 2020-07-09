import React from "react";
import {Layout} from "antd";
import {RouteComponentProps, withRouter} from "react-router";
import Graph from "./OGraph";
import ModulesMenu from "./ModulesMenu";
import "./Workflow.css";

const {Content, Sider} = Layout;

interface WorkflowState {
    collapsedLeft: boolean;
}

type TParams = { workFlowID?: string | undefined };

interface exampleInterface {
    workFlowID?: boolean
}


class Workflow extends React.Component<RouteComponentProps<TParams> & exampleInterface, WorkflowState> {

    constructor(props: any) {
        super(props);
        this.state = {
            collapsedLeft: false,
        };
    }

    onCollapseLeft = (collapsed: boolean) => {
        this.setState({collapsedLeft: collapsed});
    };

    render() {
        return (
            <Layout>
                <Sider className="internal-side-bar-left"
                       collapsible
                       collapsed={this.state.collapsedLeft}
                       onCollapse={this.onCollapseLeft}
                       breakpoint="xl"
                       collapsedWidth="0"
                       width={200}>
                    <ModulesMenu/>
                </Sider>
                <Content style={{margin: "0px"}}>
                    <Graph/>
                </Content>
            </Layout>
        );
    }
}

export default withRouter(Workflow);
