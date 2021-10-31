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
import {Button, Col, Popconfirm, Row, Switch, Table} from 'antd';
import moment from "moment";
import * as Setting from "./Setting";
import * as MachineBackend from "./backend/MachineBackend";

class MachineListPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: props,
      machines: null,
    };
  }

  componentWillMount() {
    this.getMachines();
  }

  getMachines() {
    MachineBackend.getMachines("admin")
      .then((res) => {
        this.setState({
          machines: res,
        });
      });
  }

  newMachine() {
    return {
      owner: "admin", // this.props.account.name,
      name: `machine_${this.state.machines.length}`,
      createdTime: moment().format(),
      description: `New Machine - ${this.state.machines.length}`,
      Ip: "127.0.0.1",
      username: "administrator",
      password: "123",
      autoQuery: false,
      services: [],
    }
  }

  addMachine() {
    const newMachine = this.newMachine();
    MachineBackend.addMachine(newMachine)
      .then((res) => {
          Setting.showMessage("success", `Machine added successfully`);
          this.setState({
            machines: Setting.prependRow(this.state.machines, newMachine),
          });
        }
      )
      .catch(error => {
        Setting.showMessage("error", `Machine failed to add: ${error}`);
      });
  }

  deleteMachine(i) {
    MachineBackend.deleteMachine(this.state.machines[i])
      .then((res) => {
          Setting.showMessage("success", `Machine deleted successfully`);
          this.setState({
            machines: Setting.deleteRow(this.state.machines, i),
          });
        }
      )
      .catch(error => {
        Setting.showMessage("error", `Machine failed to delete: ${error}`);
      });
  }

  renderTable(machines) {
    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        width: '120px',
        sorter: (a, b) => a.name.localeCompare(b.name),
        render: (text, record, index) => {
          return (
            <a href={`/machines/${text}`}>{text}</a>
          )
        }
      },
      {
        title: 'Created Time',
        dataIndex: 'createdTime',
        key: 'createdTime',
        width: '160px',
        sorter: (a, b) => a.createdTime.localeCompare(b.createdTime),
        render: (text, record, index) => {
          return Setting.getFormattedDate(text);
        }
      },
      {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        width: '80px',
        sorter: (a, b) => a.description.localeCompare(b.description),
      },
      {
        title: 'IP',
        dataIndex: 'ip',
        key: 'ip',
        // width: '80px',
        sorter: (a, b) => a.ip.localeCompare(b.ip),
      },
      {
        title: 'Username',
        dataIndex: 'username',
        key: 'username',
        width: '130px',
        sorter: (a, b) => a.username.localeCompare(b.username),
      },
      {
        title: 'Auto Query',
        dataIndex: 'autoQuery',
        key: 'autoQuery',
        width: '100px',
        render: (text, record, index) => {
          return (
            <Switch disabled checked={text} />
          )
        }
      },
      {
        title: 'Action',
        dataIndex: '',
        key: 'op',
        width: '160px',
        render: (text, record, index) => {
          return (
            <div>
              <Button style={{marginTop: '10px', marginBottom: '10px', marginRight: '10px'}} type="primary" onClick={() => Setting.goToLink(`/machines/${record.name}`)}>Edit</Button>
              <Popconfirm
                title={`Sure to delete machine: ${record.name} ?`}
                onConfirm={() => this.deleteMachine(index)}
                disabled={!Setting.isAdminUser(this.props.account)}
              >
                <Button style={{marginBottom: '10px'}} type="danger" disabled={!Setting.isAdminUser(this.props.account)}>Delete</Button>
              </Popconfirm>
            </div>
          )
        }
      },
    ];

    return (
      <div>
        <Table columns={columns} dataSource={machines} rowKey="name" size="middle" bordered pagination={{pageSize: 100}}
               title={() => (
                 <div>
                   Machines&nbsp;&nbsp;&nbsp;&nbsp;
                   <Button type="primary" size="small" disabled={!Setting.isAdminUser(this.props.account)} onClick={this.addMachine.bind(this)}>Add</Button>
                 </div>
               )}
               loading={machines === null}
        />
      </div>
    );
  }

  render() {
    return (
      <div>
        <Row style={{width: "100%"}}>
          <Col span={1}>
          </Col>
          <Col span={22}>
            {
              this.renderTable(this.state.machines)
            }
          </Col>
          <Col span={1}>
          </Col>
        </Row>
      </div>
    );
  }
}

export default MachineListPage;
