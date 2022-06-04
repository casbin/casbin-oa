// Copyright 2022 The casbin Authors. All Rights Reserved.
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
import {Button, Card, Col, Input, Row} from 'antd';
import * as DomainBackend from "./backend/DomainBackend";
import * as Setting from "./Setting";
import TextArea from "antd/es/input/TextArea";
import copy from "copy-to-clipboard";
import FileSaver from "file-saver";

class DomainEditPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: props,
      domainName: props.match.params.domainName,
      domain: null,
    };

    this.timer = null;
  }

  componentWillMount() {
    this.getDomain(true);
  }

  getDomain() {
    DomainBackend.getDomain("admin", this.state.domainName)
      .then((domain) => {
        this.setState({
          domain: domain,
        });
      });
  }

  parseDomainField(key, value) {
    // if ([].includes(key)) {
    //   value = Setting.myParseInt(value);
    // }
    return value;
  }

  updateDomainField(key, value) {
    value = this.parseDomainField(key, value);

    let domain = this.state.domain;
    domain[key] = value;
    this.setState({
      domain: domain,
    });
  }

  renderDomain() {
    return (
      <Card size="small" title={
        <div>
          Edit Domain&nbsp;&nbsp;&nbsp;&nbsp;
          <Button type="primary" disabled={!Setting.isAdminUser(this.props.account)} onClick={this.submitDomainEdit.bind(this)}>Save</Button>
        </div>
      } style={{marginLeft: '5px'}} type="inner">
        <Row style={{marginTop: '10px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            Name:
          </Col>
          <Col span={22} >
            <Input value={this.state.domain.name} onChange={e => {
              this.updateDomainField('name', e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            Username:
          </Col>
          <Col span={22} >
            <Input value={this.state.domain.username} onChange={e => {
              this.updateDomainField('username', e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            Access key:
          </Col>
          <Col span={22} >
            <Input value={this.state.domain.accessKey} onChange={e => {
              this.updateDomainField('accessKey', e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            Access secret:
          </Col>
          <Col span={22} >
            <Input value={this.state.domain.accessSecret} onChange={e => {
              this.updateDomainField('accessSecret', e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            Cert:
          </Col>
          <Col span={9} >
            <Button style={{marginRight: '10px', marginBottom: '10px'}} onClick={() => {
              copy(this.state.domain.cert);
              Setting.showMessage("success", "Cert copied to clipboard successfully");
            }}
            >
              {"Copy cert"}
            </Button>
            <Button type="primary" onClick={() => {
              const blob = new Blob([this.state.domain.cert], {type: "text/plain;charset=utf-8"});
              FileSaver.saveAs(blob, `${this.state.domain.name}.pem`);
            }}
            >
              Download cert
            </Button>
            <TextArea autoSize={{minRows: 30, maxRows: 30}} value={this.state.domain.cert} onChange={e => {
              this.updateDomainField('cert', e.target.value);
            }} />
          </Col>
          <Col span={1} />
          <Col style={{marginTop: '5px'}} span={2}>
            Private key:
          </Col>
          <Col span={9} >
            <Button style={{marginRight: '10px', marginBottom: '10px'}} onClick={() => {
              copy(this.state.domain.privateKey);
              Setting.showMessage("success", "Private key copied to clipboard successfully");
            }}
            >
              Copy private key
            </Button>
            <Button type="primary" onClick={() => {
              const blob = new Blob([this.state.domain.privateKey], {type: "text/plain;charset=utf-8"});
              FileSaver.saveAs(blob, `${this.state.domain.name}.key`);
            }}
            >
              Download private key
            </Button>
            <TextArea autoSize={{minRows: 30, maxRows: 30}} value={this.state.domain.privateKey} onChange={e => {
              this.updateDomainField('privateKey', e.target.value);
            }} />
          </Col>
        </Row>
      </Card>
    )
  }

  submitDomainEdit() {
    let domain = Setting.deepCopy(this.state.domain);
    DomainBackend.updateDomain(this.state.domain.owner, this.state.domainName, domain)
      .then((res) => {
        if (res) {
          Setting.showMessage("success", `Successfully saved`);
          this.setState({
            domainName: this.state.domain.name,
          });
          this.props.history.push(`/domains/${this.state.domain.name}`);
          this.getDomain(true);
        } else {
          Setting.showMessage("error", `failed to save: server side failure`);
          this.updateDomainField('name', this.state.domainName);
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
              this.state.domain !== null ? this.renderDomain() : null
            }
          </Col>
          <Col span={1}>
          </Col>
        </Row>
        <Row style={{margin: 10}}>
          <Col span={2}>
          </Col>
          <Col span={18}>
            <Button type="primary" size="large" disabled={!Setting.isAdminUser(this.props.account)} onClick={this.submitDomainEdit.bind(this)}>Save</Button>
          </Col>
        </Row>
      </div>
    );
  }
}

export default DomainEditPage;
