// Copyright 2021 The casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React from "react";
import {DownOutlined, DeleteOutlined, UpOutlined} from '@ant-design/icons';
import {Button, Col, Input, Row, Table, Tooltip} from 'antd';
import * as Setting from "./Setting";

class ServiceTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: props,
    };
  }

  updateTable(table) {
    this.props.onUpdateTable(table);
  }

  parseField(key, value) {
    if (["no", "port", "processId"].includes(key)) {
      value = Setting.myParseInt(value);
    }
    return value;
  }

  updateField(table, index, key, value) {
    value = this.parseField(key, value);

    table[index][key] = value;
    this.updateTable(table);
  }

  addRow(table) {
    let row = {no: table.length, name: `New Service - ${table.length}`, path: "C:/github_repos/casbin-oa", port: 10000, processId: -1, expectedStatus: "", status: "", subStatus: "", message: ""};
    if (table === undefined) {
      table = [];
    }
    table = Setting.addRow(table, row);
    this.updateTable(table);
  }

  deleteRow(table, i) {
    table = Setting.deleteRow(table, i);
    this.updateTable(table);
  }

  upRow(table, i) {
    table = Setting.swapRow(table, i - 1, i);
    this.updateTable(table);
  }

  downRow(table, i) {
    table = Setting.swapRow(table, i, i + 1);
    this.updateTable(table);
  }

  renderTable(table) {
    const columns = [
      {
        title: 'No.',
        dataIndex: 'no',
        key: 'no',
        render: (text, record, index) => {
          return (
            <Input value={text} onChange={e => {
              this.updateField(table, index, 'no', e.target.value);
            }} />
          )
        }
      },
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (text, record, index) => {
          return (
            <Input value={text} onChange={e => {
              this.updateField(table, index, 'name', e.target.value);
            }} />
          )
        }
      },
      {
        title: 'Path',
        dataIndex: 'path',
        key: 'path',
        render: (text, record, index) => {
          return (
            <Input value={text} onChange={e => {
              this.updateField(table, index, 'path', e.target.value);
            }} />
          )
        }
      },
      {
        title: 'Port',
        dataIndex: 'port',
        key: 'port',
        render: (text, record, index) => {
          return (
            <Input value={text} onChange={e => {
              this.updateField(table, index, 'port', e.target.value);
            }} />
          )
        }
      },
      {
        title: 'Process ID',
        dataIndex: 'processId',
        key: 'processId',
        render: (text, record, index) => {
          return (
            <Input value={text} onChange={e => {
              this.updateField(table, index, 'processId', e.target.value);
            }} />
          )
        }
      },
      {
        title: 'Expected Status',
        dataIndex: 'expectedStatus',
        key: 'expectedStatus',
        render: (text, record, index) => {
          return (
            <Input value={text} onChange={e => {
              this.updateField(table, index, 'expectedStatus', e.target.value);
            }} />
          )
        }
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (text, record, index) => {
          return (
            <Input value={text} onChange={e => {
              this.updateField(table, index, 'status', e.target.value);
            }} />
          )
        }
      },
      {
        title: 'Sub Status',
        dataIndex: 'subStatus',
        key: 'subStatus',
        render: (text, record, index) => {
          return (
            <Input value={text} onChange={e => {
              this.updateField(table, index, 'subStatus', e.target.value);
            }} />
          )
        }
      },
      {
        title: 'Message',
        dataIndex: 'message',
        key: 'message',
        render: (text, record, index) => {
          return (
            <Input value={text} onChange={e => {
              this.updateField(table, index, 'message', e.target.value);
            }} />
          )
        }
      },
      {
        title: 'action',
        key: 'action',
        width: '100px',
        render: (text, record, index) => {
          return (
            <div>
              <Tooltip placement="bottomLeft" title={"Up"}>
                <Button style={{marginRight: "5px"}} disabled={index === 0} icon={<UpOutlined />} size="small" onClick={() => this.upRow(table, index)} />
              </Tooltip>
              <Tooltip placement="topLeft" title={"Down"}>
                <Button style={{marginRight: "5px"}} disabled={index === table.length - 1} icon={<DownOutlined />} size="small" onClick={() => this.downRow(table, index)} />
              </Tooltip>
              <Tooltip placement="topLeft" title={"Delete"}>
                <Button icon={<DeleteOutlined />} size="small" onClick={() => this.deleteRow(table, index)} />
              </Tooltip>
            </div>
          );
        }
      },
    ];

    return (
      <Table rowKey="index" columns={columns} dataSource={table} size="middle" bordered pagination={false}
             title={() => (
               <div>
                 {this.props.title}&nbsp;&nbsp;&nbsp;&nbsp;
                 <Button style={{marginRight: "5px"}} type="primary" size="small" onClick={() => this.addRow(table)}>{"Add"}</Button>
               </div>
             )}
      />
    );
  }

  render() {
    return (
      <div>
        <Row style={{marginTop: '20px'}} >
          <Col span={24}>
            {
              this.renderTable(this.props.table)
            }
          </Col>
        </Row>
      </div>
    )
  }
}

export default ServiceTable;
