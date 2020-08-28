import React from "react";
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
      owner: "admin", // this.props.account.username,
      name: `student_${this.state.students.length}`,
      createdTime: moment().format(),
      realName: "James Bond",
      school: "Harvard University",
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
        }
      )
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
        }
      )
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
            <a href={`/students/${text}`}>{text}</a>
          )
        }
      },
      {
        title: 'Real Name',
        dataIndex: 'realName',
        key: 'realName',
        width: '150px',
        sorter: (a, b) => a.realName.localeCompare(b.realName),
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
        title: 'School',
        dataIndex: 'school',
        key: 'school',
        // width: '150px',
        sorter: (a, b) => a.school.localeCompare(b.school),
      },
      {
        title: 'Action',
        dataIndex: '',
        key: 'op',
        width: '160px',
        render: (text, record, index) => {
          return (
            <div>
              <Button style={{marginTop: '10px', marginBottom: '10px', marginRight: '10px'}} type="primary" onClick={() => Setting.goToLink(`/students/${record.name}`)}>Edit</Button>
              <Popconfirm
                title={`Sure to delete student: ${record.name} ?`}
                onConfirm={() => this.deleteStudent(index)}
              >
                <Button style={{marginBottom: '10px'}} type="danger">Delete</Button>
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
                   <Button type="primary" size="small" onClick={this.addStudent.bind(this)}>Add</Button>
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
