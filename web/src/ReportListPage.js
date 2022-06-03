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
import {Button, Col, Popconfirm, Row, Table} from 'antd';
import moment from "moment";
import * as Setting from "./Setting";
import * as ReportBackend from "./backend/ReportBackend";

class ReportListPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: props,
      reports: null,
    };
  }

  componentWillMount() {
    this.getReports();
  }

  getReports() {
    ReportBackend.getReports("admin")
      .then((res) => {
        this.setState({
          reports: res,
        });
      });
  }

  newReport() {
    return {
      owner: "admin", // this.props.account.name,
      name: `report_${this.state.reports.length}`,
      createdTime: moment().format(),
      program: "summer2020",
      round: "week-0",
      student: "alice",
      mentor: "bob",
      text: "report content",
      score: 0,
    }
  }

  addReport() {
    const newReport = this.newReport();
    ReportBackend.addReport(newReport)
      .then((res) => {
          Setting.showMessage("success", `Report added successfully`);
          this.setState({
            reports: Setting.prependRow(this.state.reports, newReport),
          });
        }
      )
      .catch(error => {
        Setting.showMessage("error", `Report failed to add: ${error}`);
      });
  }

  deleteReport(i) {
    ReportBackend.deleteReport(this.state.reports[i])
      .then((res) => {
          Setting.showMessage("success", `Report deleted successfully`);
          this.setState({
            reports: Setting.deleteRow(this.state.reports, i),
          });
        }
      )
      .catch(error => {
        Setting.showMessage("error", `Report failed to delete: ${error}`);
      });
  }

  renderTable(reports) {
    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        width: '120px',
        sorter: (a, b) => a.name.localeCompare(b.name),
        render: (text, record, index) => {
          return (
            <a href={`/reports/${text}`}>{text}</a>
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
        title: 'Program',
        dataIndex: 'program',
        key: 'program',
        width: '120px',
        sorter: (a, b) => a.program.localeCompare(b.program),
        render: (text, record, index) => {
          return (
            <a href={`/programs/${text}`}>{text}</a>
          )
        }
      },
      {
        title: 'Round',
        dataIndex: 'round',
        key: 'round',
        width: '120px',
        sorter: (a, b) => a.round.localeCompare(b.round),
        render: (text, record, index) => {
          return (
            <a href={`/rounds/${text}`}>{text}</a>
          )
        }
      },
      {
        title: 'Student',
        dataIndex: 'student',
        key: 'student',
        width: '120px',
        sorter: (a, b) => a.student.localeCompare(b.student),
        render: (text, record, index) => {
          return (
            <a target="_blank" rel="noreferrer" href={Setting.getUserProfileUrl(text, this.props.account)}>{text}</a>
          )
        }
      },
      {
        title: 'Text',
        dataIndex: 'text',
        key: 'text',
        sorter: (a, b) => a.text.localeCompare(b.text),
      },
      {
        title: 'Score',
        dataIndex: 'score',
        key: 'score',
        width: '60px',
        sorter: (a, b) => a.score - b.score,
      },
      {
        title: 'Action',
        dataIndex: '',
        key: 'op',
        width: '160px',
        render: (text, record, index) => {
          return (
            <div>
              <Button style={{marginTop: '10px', marginBottom: '10px', marginRight: '10px'}} type="primary" onClick={() => Setting.goToLink(`/reports/${record.name}`)}>Edit</Button>
              <Popconfirm
                title={`Sure to delete report: ${record.name} ?`}
                onConfirm={() => this.deleteReport(index)}
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
        <Table columns={columns} dataSource={reports} rowKey="name" size="middle" bordered pagination={{pageSize: 100}}
               title={() => (
                 <div>
                   Reports&nbsp;&nbsp;&nbsp;&nbsp;
                   <Button type="primary" size="small" disabled={!Setting.isAdminUser(this.props.account)} onClick={this.addReport.bind(this)}>Add</Button>
                 </div>
               )}
               loading={reports === null}
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
              this.renderTable(this.state.reports)
            }
          </Col>
          <Col span={1}>
          </Col>
        </Row>
      </div>
    );
  }
}

export default ReportListPage;
