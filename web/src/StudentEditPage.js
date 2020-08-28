import React from "react";
import {Button, Card, Col, Input, Row} from 'antd';
import {LinkOutlined} from "@ant-design/icons";
import * as StudentBackend from "./backend/StudentBackend";
import * as Setting from "./Setting";

class StudentEditPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: props,
      studentName: props.match.params.studentName,
      student: null,
      tasks: [],
      resources: [],
    };
  }

  componentWillMount() {
    this.getStudent();
  }

  getStudent() {
    StudentBackend.getStudent("admin", this.state.studentName)
      .then((student) => {
        this.setState({
          student: student,
        });
      });
  }

  parseStudentField(key, value) {
    // if ([].includes(key)) {
    //   value = Setting.myParseInt(value);
    // }
    return value;
  }

  updateStudentField(key, value) {
    value = this.parseStudentField(key, value);

    let student = this.state.student;
    student[key] = value;
    this.setState({
      student: student,
    });
  }

  renderStudent() {
    return (
      <Card size="small" title={
        <div>
          Edit Student&nbsp;&nbsp;&nbsp;&nbsp;
          <Button type="primary" onClick={this.submitStudentEdit.bind(this)}>Save</Button>
        </div>
      } style={{marginLeft: '5px'}} type="inner">
        <Row style={{marginTop: '10px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            Name:
          </Col>
          <Col span={22} >
            <Input value={this.state.student.name} onChange={e => {
              this.updateStudentField('name', e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '10px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            Real Name:
          </Col>
          <Col span={22} >
            <Input value={this.state.student.realName} onChange={e => {
              this.updateStudentField('realName', e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '10px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            School:
          </Col>
          <Col span={22} >
            <Input value={this.state.student.school} onChange={e => {
              this.updateStudentField('school', e.target.value);
            }} />
          </Col>
        </Row>
      </Card>
    )
  }

  submitStudentEdit() {
    let student = Setting.deepCopy(this.state.student);
    StudentBackend.updateStudent(this.state.student.owner, this.state.studentName, student)
      .then((res) => {
        if (res) {
          Setting.showMessage("success", `Successfully saved`);
          this.setState({
            studentName: this.state.student.name,
          });
          this.props.history.push(`/students/${this.state.student.name}`);
        } else {
          Setting.showMessage("error", `failed to save: server side failure`);
          this.updateStudentField('name', this.state.studentName);
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
              this.state.student !== null ? this.renderStudent() : null
            }
          </Col>
          <Col span={1}>
          </Col>
        </Row>
        <Row style={{margin: 10}}>
          <Col span={2}>
          </Col>
          <Col span={18}>
            <Button type="primary" size="large" onClick={this.submitStudentEdit.bind(this)}>Save</Button>
          </Col>
        </Row>
      </div>
    );
  }
}

export default StudentEditPage;
