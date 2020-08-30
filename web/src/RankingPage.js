import React from "react";
import {Button, Col, Modal, Rate, Row, Switch, Table, Tag, Tooltip} from 'antd';
import {CheckCircleOutlined, SyncOutlined, CloseCircleOutlined, ExclamationCircleOutlined, MinusCircleOutlined} from '@ant-design/icons';
import * as StudentBackend from "./backend/StudentBackend";
import * as ProgramBackend from "./backend/ProgramBackend";
import * as ReportBackend from "./backend/ReportBackend";
import * as RoundBackend from "./backend/RoundBackend";
import moment from "moment";
import * as Setting from "./Setting";
import {CSVLink} from "react-csv";
import ReactMarkdown from "react-markdown";
import {Controlled as CodeMirror} from 'react-codemirror2'
import "codemirror/lib/codemirror.css"
require("codemirror/mode/markdown/markdown");

class RankingPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: props,
      programName: props.match.params.programName !== undefined ? props.match.params.programName : "summer2020",
      students: null,
      reports: null,
      program: null,
      columns: this.getColumns(),
      reportVisible: false,
      reportEditable: false,
      report: null,
    };
  }

  getColumns() {
    return [
      {
        title: 'Name',
        dataIndex: 'realName',
        key: 'realName',
        width: '60px',
        render: (text, record, index) => {
          return (
            <a href={`/user/${record.name}`}>{text}</a>
          )
        }
      },
      {
        title: 'GitHub',
        dataIndex: 'github',
        key: 'github',
        width: '80px',
        ellipsis: true,
        render: (text, record, index) => {
          return (
            <a target="_blank" href={`https://github.com/${text}`}>{text}</a>
          )
        }
      },
      {
        title: 'Mentor',
        dataIndex: 'mentor',
        key: 'mentor',
        width: '70px',
        render: (text, record, index) => {
          return (
            <a target="_blank" href={`https://github.com/${text}`}>{text}</a>
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
  }

  isCurrentRound(round) {
    const now = moment();
    return moment(round.startDate) <= now && now < moment(round.endDate);
  }

  openReport(report) {
    this.setState({
      reportVisible: true,
      report: report,
    });
  }

  isReportEmptyAndFromOthers(report) {
    return report.text === "" && (report.student !== this.props.account?.username && !Setting.isAdminUser(this.props.account));
  }

  isSelfReport(report) {
    return report.student === this.props.account?.username || Setting.isAdminUser(this.props.account);
  }

  isMentoredReport(report) {
    return report.mentor === this.props.account?.username || Setting.isAdminUser(this.props.account);
  }

  getTag(report) {
    if (report.text === "") {
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
      owner: "admin", // this.props.account.username,
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

  componentWillMount() {
    Promise.all([this.getFilteredStudents(this.state.programName), this.getFilteredReports(this.state.programName), this.getFilteredRounds(this.state.programName), this.getProgram(this.state.programName)]).then((values) => {
      let students = values[0];
      let reports = values[1];
      let rounds = values[2];
      let program = values[3];

      let roundColumns = [];
      rounds.forEach((round) => {
        roundColumns.push(
          {
            title: (
              <Tooltip title={
                <div>
                  {`${round.title} (${round.startDate} to ${round.endDate})`}
                </div>
              }>
                <a href={`/rounds/${round.name}`}>{round.name}</a>
              </Tooltip>
            ),
            dataIndex: round.name,
            key: round.name,
            width: '70px',
            // sorter: (a, b) => a.key.localeCompare(b.key),
            className: this.isCurrentRound(round) ? "alert-row" : null,
            render: (report, student, index) => {
              if (this.isReportEmptyAndFromOthers(report)) {
                return this.getTag(report);
              } else {
                return (
                  <a onClick={() => this.openReport.bind(this)(report)}>
                    {
                      this.getTag(report)
                    }
                  </a>
                )
              }

            }
          },
        );
      });

      let studentMap = new Map();
      students.forEach(student => {
        student.score = 0;
        studentMap.set(student.name, student);
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

  renderTable(students) {
    return (
      <div>
        <Table columns={this.state.columns} dataSource={students} rowKey="name" size="middle" bordered pagination={{pageSize: 100}}
               title={() => (
                 <div>
                   {`"${this.state.program?.title}"`} Ranking&nbsp;&nbsp;&nbsp;&nbsp;
                   {
                     this.renderDownloadCsvButton()
                   }
                 </div>
               )}
               loading={students === null}
               rowClassName={(record, index) => {
                 if (record.name === this.props.account?.username || record.mentor === this.props.account?.username) {
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
          window.location.reload();
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
        onOk={this.handleReportOk.bind(this)}
        onCancel={this.handleReportCancel.bind(this)}
        okText="Save"
        okButtonProps={{disabled: !this.isMentoredReport(this.state.report) && !this.isSelfReport(this.state.report)}}
        width={1000}
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
          {
            this.renderReportModal()
          }
        </Row>
      </div>
    );
  }
}

export default RankingPage;
