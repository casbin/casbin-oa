// Copyright 2020 The casbin Authors. All Rights Reserved.
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
import {Button, Col, Popconfirm, Row, Switch, Table} from 'antd';
import moment from "moment";
import * as Setting from "./Setting";
import * as ProgramBackend from "./backend/ProgramBackend";

class ProgramListPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: props,
      programs: null,
    };
  }

  componentWillMount() {
    this.getPrograms();
  }

  getPrograms() {
    ProgramBackend.getPrograms("admin")
      .then((res) => {
        this.setState({
          programs: res,
        });
      });
  }

  newProgram() {
    return {
      owner: "admin", // this.props.account.name,
      name: `program_${this.state.programs.length}`,
      createdTime: moment().format(),
      title: `New Program - ${this.state.programs.length}`,
      url: "https://example.com",
      startDate: "2020-01-23",
      endDate: "2020-01-23",
      canApply: false,
      provider2: "",
      type: "Week",
    }
  }

  addProgram() {
    const newProgram = this.newProgram();
    ProgramBackend.addProgram(newProgram)
      .then((res) => {
          Setting.showMessage("success", `Program added successfully`);
          this.setState({
            programs: Setting.prependRow(this.state.programs, newProgram),
          });
        }
      )
      .catch(error => {
        Setting.showMessage("error", `Program failed to add: ${error}`);
      });
  }

  deleteProgram(i) {
    ProgramBackend.deleteProgram(this.state.programs[i])
      .then((res) => {
          Setting.showMessage("success", `Program deleted successfully`);
          this.setState({
            programs: Setting.deleteRow(this.state.programs, i),
          });
        }
      )
      .catch(error => {
        Setting.showMessage("error", `Program failed to delete: ${error}`);
      });
  }

  renderTable(programs) {
    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        width: '120px',
        sorter: (a, b) => a.name.localeCompare(b.name),
        render: (text, record, index) => {
          return (
            <Link to={`/programs/${text}`}>{text}</Link>
          )
        }
      },
      {
        title: 'Title',
        dataIndex: 'title',
        key: 'title',
        // width: '80px',
        sorter: (a, b) => a.title.localeCompare(b.title),
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
        title: 'Url',
        dataIndex: 'url',
        key: 'url',
        width: '150px',
        sorter: (a, b) => a.url.localeCompare(b.url),
        render: (text, record, index) => {
          return (
            <a target="_blank" rel="noreferrer" href={text}>
              {
                text
              }
            </a>
          )
        }
      },
      {
        title: 'Start date',
        dataIndex: 'startDate',
        key: 'startDate',
        width: '120px',
        sorter: (a, b) => a.startDate.localeCompare(b.startDate),
      },
      {
        title: 'End date',
        dataIndex: 'endDate',
        key: 'endDate',
        width: '120px',
        sorter: (a, b) => a.endDate.localeCompare(b.endDate),
      },
      {
        title: 'Provider 2',
        dataIndex: 'provider2',
        key: 'provider2',
        width: '120px',
        sorter: (a, b) => a.provider2.localeCompare(b.provider2),
      },
      {
        title: 'Can apply',
        dataIndex: 'canApply',
        key: 'canApply',
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
        width: '250px',
        render: (text, record, index) => {
          return (
            <div>
              <Button style={{marginTop: '10px', marginBottom: '10px', marginRight: '10px'}} type="primary" onClick={() => this.props.history.push(`/programs/${record.name}/ranking`)}>Ranking</Button>
              <Button style={{marginTop: '10px', marginBottom: '10px', marginRight: '10px'}} onClick={() => this.props.history.push(`/programs/${record.name}`)}>Edit</Button>
              <Popconfirm
                title={`Sure to delete program: ${record.name} ?`}
                onConfirm={() => this.deleteProgram(index)}
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
        <Table columns={columns} dataSource={programs} rowKey="name" size="middle" bordered pagination={{pageSize: 100}}
               title={() => (
                 <div>
                   Programs&nbsp;&nbsp;&nbsp;&nbsp;
                   <Button type="primary" size="small" disabled={!Setting.isAdminUser(this.props.account)} onClick={this.addProgram.bind(this)}>Add</Button>
                 </div>
               )}
               loading={programs === null}
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
              this.renderTable(this.state.programs)
            }
          </Col>
          <Col span={1}>
          </Col>
        </Row>
      </div>
    );
  }
}

export default ProgramListPage;
