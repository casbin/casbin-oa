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
import {Button, Col, Modal, Rate, Row, Switch, Table, Tag, Tooltip} from 'antd';
import {CheckCircleOutlined, SyncOutlined, CloseCircleOutlined, ExclamationCircleOutlined, MinusCircleOutlined} from '@ant-design/icons';
import * as AccountBackend from "./backend/AccountBackend";
import * as StudentBackend from "./backend/StudentBackend";
import * as ProgramBackend from "./backend/ProgramBackend";
import * as ReportBackend from "./backend/ReportBackend";
import * as RoundBackend from "./backend/RoundBackend";
import * as Conf from "./Conf";
import moment from "moment";
import * as Setting from "./Setting";
import {CSVLink} from "react-csv";
import ReactMarkdown from "react-markdown/with-html";

import {Controlled as CodeMirror} from 'react-codemirror2'
import "codemirror/lib/codemirror.css"
require("codemirror/mode/markdown/markdown");

class RankingPage extends React.Component {
  constructor(props) {
    super(props);

    this.additionalProvider = "QQ";

    const programName = props.match.params.programName !== undefined ? props.match.params.programName : Conf.DefaultProgramName;
    this.state = {
      classes: props,
      programName: programName,
      students: null,
      reports: null,
      program: null,
      columns: this.getColumns(programName),
      reportVisible: false,
      reportEditable: false,
      report: null,
    };
  }

  isCandidateProgram(programName) {
    if (programName === undefined) {
      programName = this.state.programName;
    }
    return programName.includes("-candidates");
  }

  getColumns(programName) {
    let columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        width: '60px',
        render: (text, record, index) => {
          if (record.displayName === undefined) {
            return `User: ${record.name} not found`;
          }

          return (
            <a target="_blank" href={Setting.getUserProfileUrl(text, this.props.account)}>{record.displayName}</a>
          )
        }
      },
      {
        title: 'GitHub',
        dataIndex: 'github',
        key: 'github',
        width: '120px',
        ellipsis: true,
        render: (text, record, index) => {
          let username = record.github;
          let avatarUrl = record.avatar;
          if (record.properties?.oauth_GitHub_username !== undefined) {
            username = record.properties.oauth_GitHub_username;
            avatarUrl = record.properties.oauth_GitHub_avatarUrl;
          }

          if (username === "") {
            return "(empty)";
          }

          return (
            <div>
              <img style={{marginRight: '5px'}} width={30} height={30} src={avatarUrl} alt={username} />
              <a target="_blank" href={`https://github.com/${username}`}>{username}</a>
            </div>
          )
        }
      },
      {
        title: 'Placeholder',
        dataIndex: 'placeholder',
        key: 'placeholder',
        width: '70px',
      },
      {
        title: 'Mentor',
        dataIndex: 'mentor',
        key: 'mentor',
        width: '70px',
        render: (text, record, index) => {
          return (
            <a target="_blank" href={Setting.getUserProfileUrl(text, this.props.account)}>{text}</a>
          )
        }
      },
      {
        title: 'Score',
        dataIndex: 'score',
        key: 'score',
        width: '50px',
      },
    ];

    if (this.isCandidateProgram(programName)) {
      columns[2] = {
        title: this.additionalProvider,
        dataIndex: this.additionalProvider.toLowerCase(),
        key: this.additionalProvider.toLowerCase(),
        width: '150px',
        ellipsis: true,
        render: (text, record, index) => {
          let username = record[this.additionalProvider.toLowerCase()];
          let avatarUrl = record.avatar;

          if (record.properties === undefined) {
            return "";
          }
          if (record.properties[`oauth_${this.additionalProvider}_displayName`] !== undefined) {
            username = record.properties[`oauth_${this.additionalProvider}_displayName`];
            avatarUrl = record.properties[`oauth_${this.additionalProvider}_avatarUrl`];
          }

          if (username === "") {
            return "(empty)";
          }

          return (
            <div>
              <img style={{marginRight: '5px'}} width={30} height={30} src={avatarUrl} alt={username} />
              {username}
            </div>
          )
        }
      };
    }

    return columns;
  }

  isCurrentRound(round) {
    const now = moment();
    return moment(round.startDate) <= now && now <= moment(round.endDate);
  }

  isFutureRound(round) {
    const now = moment();
    return now < moment(round.startDate);
  }

  openReport(round,report,student) {
    this.setState({
      reportVisible: true,
      report: report,
      curStudent: student,
      curRound: round,
    });
  }

  isForAccount(name) {
    return (name === this.props.account?.username || name === this.props.account?.name)
  }

  isSelfOrMentoredRow(record) {
    return this.isForAccount(record.name) || this.isForAccount(record.mentor);
  }

  isReportEmptyAndFromOthers(report) {
    return report.text === "" && !this.isSelfReport(report);
  }

  isSelfReport(report) {
    return this.isForAccount(report.student) || Setting.isAdminUser(this.props.account);
  }

  isMentoredReport(report) {
    return this.isForAccount(report.mentor) || Setting.isAdminUser(this.props.account);
  }

  getTag(report) {
    if (report.text === "" && (report.prs === null || report.prs === undefined)) {
      if (this.isReportEmptyAndFromOthers(report)) {
        return (
          <Tag icon={<CloseCircleOutlined />} color="default">N/A</Tag>
        )
      } else {
        return (
          <Tag style={{cursor: "pointer"}} icon={<CloseCircleOutlined />} color="default">N/A</Tag>
        )
      }
    } else if (report.score <= 0) {
      return (
        <Tag style={{cursor: "pointer"}} icon={<MinusCircleOutlined />} color="error">{report.score}</Tag>
      )
    } else if (report.score <= 2) {
      return (
        <Tag style={{cursor: "pointer"}} icon={<ExclamationCircleOutlined />} color="warning">{report.score}</Tag>
      )
    } else if (report.score <= 4) {
      return (
        <Tag style={{cursor: "pointer"}} icon={<SyncOutlined spin />} color="processing">{report.score}</Tag>
      )
    } else {
      return (
        <Tag style={{cursor: "pointer"}} icon={<CheckCircleOutlined />} color="success">{report.score}</Tag>
      )
    }
  }

  newReport(program, round, student) {
    return {
      owner: "admin", // this.props.account.name,
      name: `report_${program.name}_${round.name}_${student.name}`,
      createdTime: moment().format(),
      program: program.name,
      round: round.name,
      student: student.name,
      mentor: student.mentor,
      text: "",
      score: -1,
    }
  }

  getReportTooltip(report) {
    if (report.text === "") {
      return "Student needs to submit weekly report";
    } else if (report.score === -1) {
      return "Mentor needs to rate this weekly report";
    } else {
      const rateMap = {
        0: "0 - No Response: student is not contactable",
        1: "1 - Terrible: did nothing or empty weekly report",
        2: "2 - Bad: just relied to one or two issues, no much code contribution",
        3: "3 - Normal: just so so",
        4: "4 - Good: had made a good progress",
        5: "5 - Wonderful: you are a genius!",
      }
      return rateMap[report.score];
    }
  }

  componentWillMount() {
    Promise.all([this.getUsers(), this.getFilteredStudents(this.state.programName), this.getFilteredReports(this.state.programName), this.getFilteredRounds(this.state.programName), this.getProgram(this.state.programName)]).then((values) => {
      let users = values[0];
      let students = values[1];
      let reports = values[2];
      let rounds = values[3];
      let program = values[4];

      let roundColumns = [];
      rounds.forEach((round) => {
        roundColumns.push(
          {
            title: (
              <Tooltip title={`${round.title} (${round.startDate} to ${round.endDate})`}>
                <a href={`/rounds/${round.name}`}>{round.title}</a>
              </Tooltip>
            ),
            dataIndex: round.name,
            key: round.name,
            width: '70px',
            // sorter: (a, b) => a.key.localeCompare(b.key),
            className: this.isCurrentRound(round) ? "alert-row" : null,
            render: (report, student, index) => {
              if (this.isFutureRound(round)) {
                return null;
              }

              if (report === undefined) {
                return null;
              }

              if (this.isReportEmptyAndFromOthers(report)) {
                return this.getTag(report);
              } else {
                return (
                  <Tooltip title={this.getReportTooltip(report)}>
                    <a onClick={() => this.openReport.bind(this)(round, report, student)}>
                      {
                        this.getTag(report)
                      }
                    </a>
                  </Tooltip>
                )
              }
            }
          },
        );
      });

      let userMap = new Map();
      users.forEach(user => {
        userMap.set(user.name, user);
      });

      let studentMap = new Map();
      students.forEach((student, i) => {
        students[i].score = 0;
        if (userMap.has(student.name)) {
          students[i] = {...userMap.get(student.name), ...student};
        }
        studentMap.set(student.name, students[i]);
      });
      let roundMap = new Map();
      rounds.forEach(round => {
        roundMap.set(round.name, round);

        students.forEach(student => {
          student[round.name] = this.newReport(program, round, student);
        });
      });

      reports.forEach((report) => {
        const roundName = report.round;
        const studentName = report.student;

        let student = studentMap.get(studentName);
        if (student === undefined) {
          return;
        }

        student[roundName] = report;
        student.score += report.score >= 0 ? report.score : 0;
      });

      students.sort(function(a, b) {
        return b.score - a.score;
      });

      const columns = this.state.columns.concat(roundColumns);
      this.initCsv(students, columns);
      this.setState({
        students: students,
        reports: reports,
        columns: columns,
        program: program,
      });
    });
  }

  getUsers() {
    return AccountBackend.getUsers(Conf.AuthConfig.organizationName)
      .then((res) => {
        return res;
      });
  }

  getFilteredStudents(programName) {
    return StudentBackend.getFilteredStudents("admin", programName)
      .then((res) => {
        return res;
      });
  }

  getFilteredReports(programName) {
    return ReportBackend.getFilteredReports("admin", programName)
      .then((res) => {
        return res;
      });
  }

  getFilteredRounds(programName) {
    return RoundBackend.getFilteredRounds("admin", programName)
      .then((res) => {
        return res;
      });
  }

  getProgram(programName) {
    return ProgramBackend.getProgram("admin", programName)
      .then((res) => {
        return res;
      });
  }

  initCsv(students, columns) {
    let data = [];
    students.forEach((student, i) => {
      let row = {};

      columns.forEach((column, i) => {
        row[column.key] = Setting.toCsv(student[column.key]);
      });

      data.push(row);
    });

    let headers = columns.map(column => {
      return {label: column.title, key: column.key};
    });
    headers = headers.slice(0, 4);

    this.setState({
      csvData: data,
      csvHeaders: headers,
    });
  }

  renderDownloadCsvButton() {
    if (this.state.csvData === null || this.state.students === null) {
      return null;
    }

    return (
      <CSVLink data={this.state.csvData} headers={this.state.csvHeaders} filename={`Ranking-${this.state.programName}.csv`}>
        <Button type="primary" size="small">Download CSV</Button>
      </CSVLink>
    )
  }

  newStudent() {
    return {
      owner: "admin", // this.props.account.name,
      name: this.props.account.username,
      createdTime: moment().format(),
      program: this.state.program.name,
      // mentor: "alice",
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

          window.location.reload();
        }
      )
      .catch(error => {
        Setting.showMessage("error", `Student failed to add: ${error}`);
      });
  }

  getSelfStudent() {
    if (this.state.students === null) {
      return null;
    }

    const students = this.state.students.filter(student => this.isForAccount(student.name));
    if (students.length === 0) {
      return null;
    }

    return students[0];
  }

  renderTable(students) {
    const applied = this.getSelfStudent() !== null;

    if (this.state.program === null) {
      return null;
    }

    return (
      <div>
        <Table columns={this.state.columns} dataSource={students} rowKey="name" size="middle" bordered pagination={{pageSize: 100}}
               title={() => (
                 <div>
                   <a target="_blank" href={this.state.program.url}>
                     {`"${this.state.program.title}"`}
                   </a> Ranking&nbsp;&nbsp;&nbsp;&nbsp;
                   {
                     this.renderDownloadCsvButton()
                   }
                   {
                     !this.state.program.canApply ? null : (
                       <React.Fragment>
                         &nbsp;&nbsp;&nbsp;&nbsp;
                         <Button type="primary" size="small" disabled={this.props.account === undefined || this.props.account === null || applied} onClick={this.addStudent.bind(this)}>
                           {
                             this.props.account === null ? "Apply (Please login first)" : "Apply"
                           }
                         </Button>
                       </React.Fragment>
                     )
                   }
                 </div>
               )}
               loading={students === null}
               rowClassName={(record, index) => {
                 if (this.isSelfOrMentoredRow(record)) {
                   return "self-row";
                 } else {
                   return null;
                 }
               }}
        />
      </div>
    );
  }
  submitReportEdit() {
    let report = Setting.deepCopy(this.state.report);
    ReportBackend.updateReport(this.state.report.owner, this.state.report.name, report)
      .then((res) => {
        if (res) {
          Setting.showMessage("success", `Successfully saved`);
          setTimeout(()=>window.location.reload(), 1000)
        } else {
          Setting.showMessage("error", `failed to save: server side failure`);
        }
      })
      .catch(error => {
        Setting.showMessage("error", `failed to save: ${error}`);
      });
  }

  handleReportOk() {
    this.submitReportEdit();
    this.setState({
      reportVisible: false,
      reportEditable: false,
    });
  }

  handleReportCancel() {
    this.setState({
      reportVisible: false,
      reportEditable: false,
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

    let report = Setting.deepCopy(this.state.report);
    report[key] = value;
    this.setState({
      report: report,
    });
  }

  onSwitchReportEditable(checked, e) {
    this.setState({
      reportEditable: checked,
    });
  }

  renderReportTextEdit() {
    if (this.state.reportEditable) {
      return (
        <CodeMirror
          // editorDidMount={(editor) => Tools.attachEditor(editor)}
          // onPaste={() => Tools.uploadMdFile()}
          value={this.state.report.text}
          // onDrop={() => Tools.uploadMdFile()}
          options={{mode: 'markdown', lineNumbers: true}}
          onBeforeChange={(editor, data, value) => {
            this.updateReportField('text', value);
          }}
          onChange={(editor, data, value) => {
          }}
        />
      )
    } else {
      return (
        <ReactMarkdown
          source={this.state.report.text !== "" ? this.state.report.text : "(empty)"}
          renderers={{image: props => <img {...props} style={{maxWidth: '100%'}} alt="img" />}}
          escapeHtml={false}
        />
      )
    }
  }

  autoUpdate(){
    this.setState({ loading: true });
    ReportBackend.getReport(this.state.report.owner,this.state.report.name).then(res =>{
      if (res != null){
        this.getPrsFromGithub()
      }else {
        ReportBackend.updateReport(this.state.report.owner, this.state.report.name, this.state.report).then(res =>{
          if (res){
            this.getPrsFromGithub()
          }else{
            Setting.showMessage("error", `Unsuccessfully updated`);
          }
        })
      }
    })
  }

  getPrsFromGithub(){

    let githubUsername = this.state.curStudent.github;
    if (this.state.curStudent.properties?.oauth_GitHub_username !== undefined) {
      githubUsername = this.state.curStudent.properties.oauth_GitHub_username;
    }
    if (githubUsername === "") {
      this.setState({ loading: false });
      Setting.showMessage("error", "No Github Account!");
      return;
    }
    ReportBackend.autoUpdateReport(this.state.report.owner,this.state.report.name, this.state.curStudent, githubUsername, this.state.curRound).then(res =>{
      this.setState({loading: false});
      if (res !== ""){
        this.state.report.text = res;
        let report = Setting.deepCopy(this.state.report);
        Setting.showMessage("success","Successfully saved");
        this.setState({
          report: report
        })
      }else{
        Setting.showMessage("warn", "Get Empty");
      }
    }).catch(err=>{
      this.setState({loading: false})
      Setting.showMessage("error", `Unsuccessfully updated`);
    })
  }

  renderReportModal() {
    if (this.state.report === null) {
      return null;
    }

    const desc = [
      '1 - Terrible: did nothing or empty weekly report',
      '2 - Bad: just relied to one or two issues, no much code contribution',
      '3 - Normal: just so so',
      '4 - Good: had made a good progress',
      '5 - Wonderful: you are a genius!'];

    const {loading} = this.state

    return (
      <Modal
        title={
          <div>
            {
              `Weekly Report for ${this.state.report.round} - ${this.state.report.student}`
            }
            <div style={{float: 'right', marginRight: '30px'}}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Enable Edit: &nbsp;
              <Switch disabled={!this.isSelfReport(this.state.report)} checked={this.state.reportEditable} onChange={this.onSwitchReportEditable.bind(this)}/>
            </div>
          </div>
        }
        visible={this.state.reportVisible}
        onOk={()=>this.handleReportOk()}
        onCancel={()=>this.handleReportCancel()}
        okText="Save"
        width={1000}
        footer={[
          <Button key="cancel" onClick={()=>this.handleReportCancel()}>
            Cancel
          </Button>,
          <Button key="update" type="primary" loading={loading} onClick={()=>this.autoUpdate()} disabled={!this.isMentoredReport(this.state.report) && !this.isSelfReport(this.state.report)}>
            Update Events
          </Button>,
          <Button key="submit" type="primary" onClick={()=>this.handleReportOk()} disabled={!this.isMentoredReport(this.state.report) && !this.isSelfReport(this.state.report)}>
            Save
          </Button>,
        ]}
      >
        <div>
          {
            this.renderReportTextEdit()
          }
          <Rate tooltips={desc} disabled={!this.isMentoredReport(this.state.report)} value={this.state.report.score} onChange={value => {
            this.updateReportField('score', value);
          }} />
          &nbsp;&nbsp;&nbsp;&nbsp;
          {
            this.state.report.text === "" ?
              "(You cannot rate it if you are not the mentor)" : null
          }
        </div>
      </Modal>
    )
  }

  renderLinkModal() {
    if (!this.isCandidateProgram()) {
      return null;
    }

    const student = this.getSelfStudent();
    if (student === null || student[this.additionalProvider.toLowerCase()] !== "") {
      return null;
    }

    return (
      <Modal
        title={`Please Link your ${this.additionalProvider}`}
        visible={true}
        onOk={() => {
          Setting.openLink(Setting.getMyProfileUrl(this.props.account));
        }}
        onCancel={() => {
          window.location.reload();
        }}
        okText={`Link ${this.additionalProvider}`}
        cancelText="Refresh"
      >
        <div>
          Click the button to link your {this.additionalProvider}, then refresh the page.
        </div>
      </Modal>
    )
  }

  renderNameModal() {
    if (!this.isCandidateProgram()) {
      return null;
    }

    const student = this.getSelfStudent();
    if (student === null || student[this.additionalProvider.toLowerCase()] === "") {
      return null;
    }

    if (Setting.isChineseStr(student.displayName)) {
      return null;
    }

    return (
      <Modal
        title={"Please Change your display name to your real name"}
        visible={true}
        onOk={() => {
          Setting.openLink(Setting.getMyProfileUrl(this.props.account));
        }}
        onCancel={() => {
          window.location.reload();
        }}
        okText="Update Display Name"
        cancelText="Refresh"
      >
        <div>
          Click the button to change your display name, then refresh the page.
        </div>
      </Modal>
    )
  }

  render() {
    return (
      <div>
        <Row style={{width: "100%"}}>
          <Col span={24}>
            {
              this.renderTable(this.state.students)
            }
          </Col>
          {
            this.renderReportModal()
          }
          {
            this.renderLinkModal()
          }
          {
            this.renderNameModal()
          }
        </Row>
      </div>
    );
  }
}

export default RankingPage;
