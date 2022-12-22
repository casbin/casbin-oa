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
import {Button, Card, Col, Input, Row, Switch} from 'antd';
import * as MachineBackend from "./backend/MachineBackend";
import * as Setting from "./Setting";
import ServiceTable from "./ServiceTable";

class MachineEditPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: props,
      machineName: props.match.params.machineName,
      machine: null,
    };

    this.timer = null;
  }

  componentWillMount() {
    this.getMachine(true);
    this.startTimer();
  }

  componentWillUnmount() {
    this.stopTimer();
  }

  getMachine(updateFromRemote = false) {
    MachineBackend.getMachine("admin", this.state.machineName)
      .then((machine) => {
        if (!updateFromRemote && this.state.machine !== null) {
          machine.autoQuery = this.state.machine.autoQuery;

          for (let i = 0; i < this.state.machine.services.length; i ++) {
            if (i >= machine.services.length) {
              machine.services.push(this.state.machine.services[i]);
              continue;
            }

            machine.services[i].no = this.state.machine.services[i].no;
            machine.services[i].name = this.state.machine.services[i].name;
            machine.services[i].path = this.state.machine.services[i].path;
            machine.services[i].port = this.state.machine.services[i].port;
            machine.services[i].expectedStatus = this.state.machine.services[i].expectedStatus;
          }

          if (machine.services.length > this.state.machine.services.length) {
            machine.services = machine.services.slice(0, this.state.machine.services.length);
          }
        }

        this.setState({
          machine: machine,
        });
      });
  }

  startTimer() {
    if (this.timer === null) {
      this.timer = window.setInterval(this.doTimer.bind(this), 3000);
    }
  }

  stopTimer() {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  doTimer() {
    if (this.state.machine?.autoQuery) {
      this.getMachine(false);
    }
  }

  parseMachineField(key, value) {
    if (["port"].includes(key)) {
      value = Setting.myParseInt(value);
    }
    return value;
  }

  updateMachineField(key, value) {
    value = this.parseMachineField(key, value);

    let machine = this.state.machine;
    machine[key] = value;
    this.setState({
      machine: machine,
    });
  }

  renderMachine() {
    return (
      <Card size="small" title={
        <div>
          Edit Machine&nbsp;&nbsp;&nbsp;&nbsp;
          <Button type="primary" disabled={!Setting.isAdminUser(this.props.account)} onClick={this.submitMachineEdit.bind(this)}>Save</Button>
        </div>
      } style={{marginLeft: '5px'}} type="inner">
        <Row style={{marginTop: '10px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            Name:
          </Col>
          <Col span={22} >
            <Input value={this.state.machine.name} onChange={e => {
              this.updateMachineField('name', e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            Description:
          </Col>
          <Col span={22} >
            <Input value={this.state.machine.description} onChange={e => {
              this.updateMachineField('description', e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            IP:
          </Col>
          <Col span={22} >
            <Input value={this.state.machine.ip} onChange={e => {
              this.updateMachineField('ip', e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            Port:
          </Col>
          <Col span={22} >
            <Input value={this.state.machine.port} onChange={e => {
              this.updateMachineField('port', e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            Username:
          </Col>
          <Col span={22} >
            <Input value={this.state.machine.username} onChange={e => {
              this.updateMachineField('username', e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            Password:
          </Col>
          <Col span={22} >
            <Input value={this.state.machine.password} onChange={e => {
              this.updateMachineField('password', e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            Language:
          </Col>
          <Col span={22} >
            <Input value={this.state.machine.language} onChange={e => {
              this.updateMachineField('language', e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            Auto query:
          </Col>
          <Col span={1} >
            <Switch checked={this.state.machine.autoQuery} onChange={checked => {
              this.updateMachineField('autoQuery', checked);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            Services:
          </Col>
          <Col span={22} >
            <ServiceTable
              title={"Services"}
              table={this.state.machine.services}
              onUpdateTable={(value) => { this.updateMachineField('services', value)}}
            />
          </Col>
        </Row>
      </Card>
    )
  }

  submitMachineEdit() {
    let machine = Setting.deepCopy(this.state.machine);
    MachineBackend.updateMachine(this.state.machine.owner, this.state.machineName, machine)
      .then((res) => {
        if (res) {
          Setting.showMessage("success", `Successfully saved`);
          this.setState({
            machineName: this.state.machine.name,
          });
          this.props.history.push(`/machines/${this.state.machine.name}`);
          this.getMachine(true);
        } else {
          Setting.showMessage("error", `failed to save: server side failure`);
          this.updateMachineField('name', this.state.machineName);
        }
      })
      .catch(error => {
        Setting.showMessage("error", `failed to save: ${error}`);
      });
  }

  render() {
    return (
      <div>
        <Row style={{width: "100%"}}>
          <Col span={1}>
          </Col>
          <Col span={22}>
            {
              this.state.machine !== null ? this.renderMachine() : null
            }
          </Col>
          <Col span={1}>
          </Col>
        </Row>
        <Row style={{margin: 10}}>
          <Col span={2}>
          </Col>
          <Col span={18}>
            <Button type="primary" size="large" disabled={!Setting.isAdminUser(this.props.account)} onClick={this.submitMachineEdit.bind(this)}>Save</Button>
          </Col>
        </Row>
      </div>
    );
  }
}

export default MachineEditPage;
