import React from "react";
import {Menu} from "antd";
import {
    AppstoreOutlined,
    EditOutlined,
    ApartmentOutlined,
} from "@ant-design/icons";

const {SubMenu} = Menu;

export default class ModulesMenu extends React.Component {
    render() {
        return (
            <div style={{width: "100%"}}>
                <Menu
                    defaultSelectedKeys={["1"]}
                    defaultOpenKeys={["sub1"]}
                    mode="inline"
                    theme="dark"
                >
                    <Menu.Item key="1">
                        <EditOutlined/>
                        <span>流程设计</span>
                    </Menu.Item>
                    <Menu.Item key="2">
                        <ApartmentOutlined/>
                        <span>已定义流程</span>
                    </Menu.Item>
                    <SubMenu
                        key="sub1"
                        title={
                            <span><AppstoreOutlined/><span>我的流程</span></span>
                        }
                    >
                        <Menu.Item key="9">进行中</Menu.Item>
                        <Menu.Item key="10">已结束</Menu.Item>
                    </SubMenu>
                </Menu>
            </div>
        );
    }
}
