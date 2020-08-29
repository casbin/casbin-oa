import React from "react";
import {Button, Card, Col, DatePicker, Input, Row} from 'antd';
import {LinkOutlined} from "@ant-design/icons";
import * as ProgramBackend from "./backend/ProgramBackend";
import * as Setting from "./Setting";
import moment from "moment";

class ProgramEditPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: props,
      programName: props.match.params.programName,
      program: null,
      tasks: [],
      resources: [],
    };
  }

  componentWillMount() {
    this.getProgram();
  }

  getProgram() {
    ProgramBackend.getProgram("admin", this.state.programName)
      .then((program) => {
        this.setState({
          program: program,
        });
      });
  }

  parseProgramField(key, value) {
    // if ([].includes(key)) {
    //   value = Setting.myParseInt(value);
    // }
    return value;
  }

  updateProgramField(key, value) {
    value = this.parseProgramField(key, value);

    let program = this.state.program;
    program[key] = value;
    this.setState({
      program: program,
    });
  }

  renderProgram() {
    return (
      <Card size="small" title={
        <div>
          Edit Program&nbsp;&nbsp;&nbsp;&nbsp;
          <Button type="primary" onClick={this.submitProgramEdit.bind(this)}>Save</Button>
        </div>
      } style={{marginLeft: '5px'}} type="inner">
        <Row style={{marginTop: '10px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            Name:
          </Col>
          <Col span={22} >
            <Input value={this.state.program.name} onChange={e => {
              this.updateProgramField('name', e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            Title:
          </Col>
          <Col span={22} >
            <Input value={this.state.program.title} onChange={e => {
              this.updateProgramField('title', e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            Link:
          </Col>
          <Col span={22} >
            <Input prefix={<LinkOutlined/>} value={this.state.program.url} onChange={e => {
              this.updateProgramField('url', e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            Start Date:
          </Col>
          <Col span={22} >
            <DatePicker defaultValue={moment(this.state.program.startDate, "YYYY-MM-DD")} onChange={(time, timeString) => {
              this.updateProgramField('startDate', timeString);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            End Date:
          </Col>
          <Col span={22} >
            <DatePicker defaultValue={moment(this.state.program.endDate, "YYYY-MM-DD")} onChange={(time, timeString) => {
              this.updateProgramField('endDate', timeString);
            }} />
          </Col>
        </Row>
      </Card>
    )
  }

  submitProgramEdit() {
    let program = Setting.deepCopy(this.state.program);
    ProgramBackend.updateProgram(this.state.program.owner, this.state.programName, program)
      .then((res) => {
        if (res) {
          Setting.showMessage("success", `Successfully saved`);
          this.setState({
            programName: this.state.program.name,
          });
          this.props.history.push(`/programs/${this.state.program.name}`);
        } else {
          Setting.showMessage("error", `failed to save: server side failure`);
          this.updateProgramField('name', this.state.programName);
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
              this.state.program !== null ? this.renderProgram() : null
            }
          </Col>
          <Col span={1}>
          </Col>
        </Row>
        <Row style={{margin: 10}}>
          <Col span={2}>
          </Col>
          <Col span={18}>
            <Button type="primary" size="large" onClick={this.submitProgramEdit.bind(this)}>Save</Button>
          </Col>
        </Row>
      </div>
    );
  }
}

export default ProgramEditPage;
