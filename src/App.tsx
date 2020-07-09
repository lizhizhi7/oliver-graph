import React from "react";
import "./App.less";
import "antd/dist/antd.css";

import {Switch, Route} from "react-router-dom";
import {Layout} from "antd";
import Workflow from "./pages/Workflow/Workflow";


const {Content, Footer} = Layout;

function App() {
    return (
        <Layout className="layout">
            <Content style={{margin: 0}}>
                <Switch>
                    <Route path="/workflow">
                        <Workflow/>
                    </Route>
                    <Route path="/">
                        <Workflow/>
                    </Route>
                </Switch>
            </Content>
            <Footer style={{textAlign: "center", color: "#FFFFFF", background: "#282C34"}}>
                Made with ❤ by Oliver Li
            </Footer>
        </Layout>
    );
}

export default App;
