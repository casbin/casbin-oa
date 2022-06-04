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
import {Button, Col, Popconfirm, Row, Table} from 'antd';
import moment from "moment";
import * as Setting from "./Setting";
import * as StudentBackend from "./backend/StudentBackend";

class StudentListPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: props,
      students: null,
    };
  }

  componentWillMount() {
    this.getStudents();
  }

  getStudents() {
    StudentBackend.getStudents("admin")
      .then((res) => {
        this.setState({
          students: res,
        });
      });
  }

  newStudent() {
    return {
      owner: "admin", // this.props.account.name,
      name: `student_${this.state.students.length}`,
      createdTime: moment().format(),
      program: "summer2020",
      mentor: "alice",
    }
  }

  addStudent() {
    const newStudent = this.newStudent();
    StudentBackend.addStudent(newStudent)
      .then((res) => {
        Setting.showMessage("success", `Student added successfully`);
        this.setState({
          students: Setting.prependRow(this.state.students, newStudent),
        });
      })
      .catch(error => {
        Setting.showMessage("error", `Student failed to add: ${error}`);
      });
  }

  deleteStudent(i) {
    StudentBackend.deleteStudent(this.state.students[i])
      .then((res) => {
        Setting.showMessage("success", `Student deleted successfully`);
        this.setState({
          students: Setting.deleteRow(this.state.students, i),
        });
      })
      .catch(error => {
        Setting.showMessage("error", `Student failed to delete: ${error}`);
      });
  }

  renderTable(students) {
    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        width: '120px',
        sorter: (a, b) => a.name.localeCompare(b.name),
        render: (text, record, index) => {
          return (
            <a target="_blank" rel="noreferrer" href={Setting.getUserProfileUrl(text, this.props.account)}>{text}</a>
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
            <Link to={`/programs/${text}`}>{text}</Link>
          )
        }
      },
      {
        title: 'Repositories',
        dataIndex: 'org_repositories',
        key: 'createdTime',
        // width: '160px',
        sorter: (a, b) => a.createdTime.localeCompare(b.createdTime),
        render: (text, record, index) => {
          let repositories = ''
          if (text !== null && text !== undefined){
            text.forEach(item => {
              repositories += item.organization+'[' +item.repositories+']\n';
            })
            return repositories
          }
          else
            return ""
        }
      },
      {
        title: 'Mentor',
        dataIndex: 'mentor',
        key: 'mentor',
        width: '120px',
        sorter: (a, b) => a.mentor.localeCompare(b.mentor),
        render: (text, record, index) => {
          return (
            <a target="_blank" rel="noreferrer" href={Setting.getUserProfileUrl(text, this.props.account)}>{text}</a>
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
              <Button style={{marginTop: '10px', marginBottom: '10px', marginRight: '10px'}} type="primary" onClick={() => this.props.history.push(`/students/${record.name}/${record.program}`)}>Edit</Button>
              <Popconfirm
                title={`Sure to delete student: ${record.name} ?`}
                onConfirm={() => this.deleteStudent(index)}
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
        <Table columns={columns} dataSource={students} rowKey="name" size="middle" bordered pagination={{pageSize: 100}}
               title={() => (
                 <div>
                   Students&nbsp;&nbsp;&nbsp;&nbsp;
                   <Button type="primary" size="small" disabled={!Setting.isAdminUser(this.props.account)} onClick={this.addStudent.bind(this)}>Add</Button>
                 </div>
               )}
               loading={students === null}
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
              this.renderTable(this.state.students)
            }
          </Col>
          <Col span={1}>
          </Col>
        </Row>
      </div>
    );
  }
}

export default StudentListPage;
