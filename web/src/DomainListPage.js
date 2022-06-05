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
import {Link} from "react-router-dom";
import {Button, Col, Popconfirm, Row, Table} from 'antd';
import moment from "moment";
import * as Setting from "./Setting";
import * as DomainBackend from "./backend/DomainBackend";

class DomainListPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: props,
      domains: null,
      isRenewLoading: false,
    };
  }

  componentWillMount() {
    this.getDomains();
  }

  getDomains() {
    DomainBackend.getDomains("admin")
      .then((res) => {
        this.setState({
          domains: res,
        });
      });
  }

  newDomain() {
    return {
      owner: "admin", // this.props.account.name,
      name: `domain_${this.state.domains.length}`,
      createdTime: moment().format(),
      username: "casbin",
      accessKey: "",
      accessSecret: "",
      expireTime: "",
      cert: "",
      privateKey: "",
    }
  }

  addDomain() {
    const newDomain = this.newDomain();
    DomainBackend.addDomain(newDomain)
      .then((res) => {
        Setting.showMessage("success", `Domain added successfully`);
        this.setState({
          domains: Setting.prependRow(this.state.domains, newDomain),
        });
      })
      .catch(error => {
        Setting.showMessage("error", `Domain failed to add: ${error}`);
      });
  }

  deleteDomain(i) {
    DomainBackend.deleteDomain(this.state.domains[i])
      .then((res) => {
        Setting.showMessage("success", `Domain deleted successfully`);
        this.setState({
          domains: Setting.deleteRow(this.state.domains, i),
        });
      })
      .catch(error => {
        Setting.showMessage("error", `Domain failed to delete: ${error}`);
      });
  }

  updateTableField(index, key, value) {
    let domains = this.state.domains;
    domains[index][key] = value;
    this.setState({
      domains: domains,
    });
  }

  renewDomain(i) {
    this.updateTableField(i, "isRenewLoading", true);
    DomainBackend.renewDomain(this.state.domains[i])
      .then((res) => {
        this.updateTableField(i, "isRenewLoading", undefined);

        Setting.showMessage("success", `Domain renewed successfully`);
        this.getDomains();
      })
      .catch(error => {
        this.updateTableField(i, "isRenewLoading", undefined);

        Setting.showMessage("error", `Domain failed to renew: ${error}`);
      });
  }

  renderTable(domains) {
    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        width: '120px',
        sorter: (a, b) => a.name.localeCompare(b.name),
        render: (text, record, index) => {
          return (
            <Link to={`/domains/${text}`}>{text}</Link>
          )
        }
      },
      {
        title: 'Created time',
        dataIndex: 'createdTime',
        key: 'createdTime',
        width: '160px',
        sorter: (a, b) => a.createdTime.localeCompare(b.createdTime),
        render: (text, record, index) => {
          return Setting.getFormattedDate(text);
        }
      },
      {
        title: 'Username',
        dataIndex: 'username',
        key: 'username',
        width: '120px',
        sorter: (a, b) => a.username.localeCompare(b.username),
      },
      {
        title: 'Access key',
        dataIndex: 'accessKey',
        key: 'accessKey',
        width: '200px',
        sorter: (a, b) => a.accessKey.localeCompare(b.accessKey),
      },
      {
        title: 'Access secret',
        dataIndex: 'accessSecret',
        key: 'accessSecret',
        // width: '200px',
        sorter: (a, b) => a.accessSecret.localeCompare(b.accessSecret),
      },
      {
        title: 'Expire time',
        dataIndex: 'expireTime',
        key: 'expireTime',
        width: '160px',
        sorter: (a, b) => a.expireTime.localeCompare(b.expireTime),
        render: (text, record, index) => {
          return Setting.getFormattedDate(text);
        }
      },
      {
        title: 'Cert',
        dataIndex: 'cert',
        key: 'cert',
        width: '250px',
        sorter: (a, b) => a.cert.localeCompare(b.cert),
        render: (text, record, index) => {
          return Setting.getShortText(text, 60);
        }
      },
      {
        title: 'Private key',
        dataIndex: 'privateKey',
        key: 'privateKey',
        width: '250px',
        sorter: (a, b) => a.privateKey.localeCompare(b.privateKey),
        render: (text, record, index) => {
          return Setting.getShortText(text, 60);
        }
      },
      {
        title: 'Action',
        dataIndex: '',
        key: 'op',
        width: '260px',
        render: (text, record, index) => {
          return (
            <div>
              <Button loading={record.isRenewLoading === true} style={{marginTop: '10px', marginBottom: '10px', marginRight: '10px'}} onClick={() => this.renewDomain(index)}>Renew</Button>
              <Button style={{marginTop: '10px', marginBottom: '10px', marginRight: '10px'}} type="primary" onClick={() => this.props.history.push(`/domains/${record.name}`)}>Edit</Button>
              <Popconfirm
                title={`Sure to delete domain: ${record.name} ?`}
                onConfirm={() => this.deleteDomain(index)}
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
        <Table columns={columns} dataSource={domains} rowKey="name" size="middle" bordered pagination={{pageSize: 100}}
               title={() => (
                 <div>
                   Domains&nbsp;&nbsp;&nbsp;&nbsp;
                   <Button type="primary" size="small" disabled={!Setting.isAdminUser(this.props.account)} onClick={this.addDomain.bind(this)}>Add</Button>
                 </div>
               )}
               loading={domains === null}
        />
      </div>
    );
  }

  render() {
    return (
      <div>
        <Row style={{width: "100%"}}>
          <Col span={24}>
            {
              this.renderTable(this.state.domains)
            }
          </Col>
        </Row>
      </div>
    );
  }
}

export default DomainListPage;
