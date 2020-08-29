import React from "react";
import {Button, Card, Col, DatePicker, Input, Row} from 'antd';
import * as ReportBackend from "./backend/ReportBackend";
import * as Setting from "./Setting";
import moment from "moment";

class ReportEditPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: props,
      reportName: props.match.params.reportName,
      report: null,
      tasks: [],
      resources: [],
    };
  }

  componentWillMount() {
    this.getReport();
  }

  getReport() {
    ReportBackend.getReport("admin", this.state.reportName)
      .then((report) => {
        this.setState({
          report: report,
        });
      });
  }

  parseReportField(key, value) {
    if (["score"].includes(key)) {
      value = Setting.myParseInt(value);
    }
    return value;
  }

  updateReportField(key, value) {
    value = this.parseReportField(key, value);

    let report = this.state.report;
    report[key] = value;
    this.setState({
      report: report,
    });
  }

  renderReport() {
    return (
      <Card size="small" title={
        <div>
          Edit Report&nbsp;&nbsp;&nbsp;&nbsp;
          <Button type="primary" onClick={this.submitReportEdit.bind(this)}>Save</Button>
        </div>
      } style={{marginLeft: '5px'}} type="inner">
        <Row style={{marginTop: '10px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            Name:
          </Col>
          <Col span={22} >
            <Input value={this.state.report.name} onChange={e => {
              this.updateReportField('name', e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            Program:
          </Col>
          <Col span={22} >
            <Input value={this.state.report.program} onChange={e => {
              this.updateReportField('program', e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            Round:
          </Col>
          <Col span={22} >
            <Input value={this.state.report.round} onChange={e => {
              this.updateReportField('round', e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            Text:
          </Col>
          <Col span={22} >
            <Input value={this.state.report.text} onChange={e => {
              this.updateReportField('text', e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            Score:
          </Col>
          <Col span={22} >
            <Input value={this.state.report.score} onChange={e => {
              this.updateReportField('score', e.target.value);
            }} />
          </Col>
        </Row>
      </Card>
    )
  }

  submitReportEdit() {
    let report = Setting.deepCopy(this.state.report);
    ReportBackend.updateReport(this.state.report.owner, this.state.reportName, report)
      .then((res) => {
        if (res) {
          Setting.showMessage("success", `Successfully saved`);
          this.setState({
            reportName: this.state.report.name,
          });
          this.props.history.push(`/reports/${this.state.report.name}`);
        } else {
          Setting.showMessage("error", `failed to save: server side failure`);
          this.updateReportField('name', this.state.reportName);
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
              this.state.report !== null ? this.renderReport() : null
            }
          </Col>
          <Col span={1}>
          </Col>
        </Row>
        <Row style={{margin: 10}}>
          <Col span={2}>
          </Col>
          <Col span={18}>
            <Button type="primary" size="large" onClick={this.submitReportEdit.bind(this)}>Save</Button>
          </Col>
        </Row>
      </div>
    );
  }
}

export default ReportEditPage;
