import React from "react";
import {Button, Card, Col, DatePicker, Select, Input, Row} from 'antd';
import * as RoundBackend from "./backend/RoundBackend";
import * as ProgramBackend from "./backend/ProgramBackend"
import * as Setting from "./Setting";
import moment from "moment";

const { Option } = Select;

class RoundEditPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: props,
      roundName: props.match.params.roundName,
      round: null,
      tasks: [],
      resources: [],
      programs: [],
    };
  }

  componentWillMount() {
    this.getRound();
    this.getPrograms();
  }

  getPrograms() {
    ProgramBackend.getPrograms("admin")
        .then(res => {
          this.setState({
            programs: res,
          });
        });
  }

  getRound() {
    RoundBackend.getRound("admin", this.state.roundName)
      .then((round) => {
        this.setState({
          round: round,
        });
      });
  }

  parseRoundField(key, value) {
    // if ([].includes(key)) {
    //   value = Setting.myParseInt(value);
    // }
    return value;
  }

  updateRoundField(key, value) {
    value = this.parseRoundField(key, value);

    let round = this.state.round;
    round[key] = value;
    this.setState({
      round: round,
    });
  }

  renderRound() {
    return (
      <Card size="small" title={
        <div>
          Edit Round&nbsp;&nbsp;&nbsp;&nbsp;
          <Button type="primary" disabled={!Setting.isAdminUser(this.props.account)} onClick={this.submitRoundEdit.bind(this)}>Save</Button>
        </div>
      } style={{marginLeft: '5px'}} type="inner">
        <Row style={{marginTop: '10px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            Name:
          </Col>
          <Col span={22} >
            <Input value={this.state.round.name} onChange={e => {
              this.updateRoundField('name', e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            Title:
          </Col>
          <Col span={22} >
            <Input value={this.state.round.title} onChange={e => {
              this.updateRoundField('title', e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            Program:
          </Col>
          <Col span={22} >
            <Select virtual={false} style={{width: '100%'}} value={this.state.round.program} onChange={(value => {this.updateRoundField('program', value);})}>
              {
                this.state.programs.map((program, index) => <Option key={index} value={program.name}>{program.name}</Option>)
              }
            </Select>
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            Start Date:
          </Col>
          <Col span={22} >
            <DatePicker defaultValue={moment(this.state.round.startDate, "YYYY-MM-DD")} onChange={(time, timeString) => {
              this.updateRoundField('startDate', timeString);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            End Date:
          </Col>
          <Col span={22} >
            <DatePicker defaultValue={moment(this.state.round.endDate, "YYYY-MM-DD")} onChange={(time, timeString) => {
              this.updateRoundField('endDate', timeString);
            }} />
          </Col>
        </Row>
      </Card>
    )
  }

  submitRoundEdit() {
    let round = Setting.deepCopy(this.state.round);
    RoundBackend.updateRound(this.state.round.owner, this.state.roundName, round)
      .then((res) => {
        if (res) {
          Setting.showMessage("success", `Successfully saved`);
          this.setState({
            roundName: this.state.round.name,
          });
          this.props.history.push(`/rounds`);
        } else {
          Setting.showMessage("error", `failed to save: server side failure`);
          this.updateRoundField('name', this.state.roundName);
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
              this.state.round !== null ? this.renderRound() : null
            }
          </Col>
          <Col span={1}>
          </Col>
        </Row>
        <Row style={{margin: 10}}>
          <Col span={2}>
          </Col>
          <Col span={18}>
            <Button type="primary" size="large" disabled={!Setting.isAdminUser(this.props.account)} onClick={this.submitRoundEdit.bind(this)}>Save</Button>
          </Col>
        </Row>
      </div>
    );
  }
}

export default RoundEditPage;
