import React from "react";
import {Button, Col, Row, Table, Tag} from 'antd';
import {CheckCircleOutlined, SyncOutlined, CloseCircleOutlined, ExclamationCircleOutlined, MinusCircleOutlined} from '@ant-design/icons';
import * as StudentBackend from "./backend/StudentBackend";
import * as ProgramBackend from "./backend/ProgramBackend";
import * as ReportBackend from "./backend/ReportBackend";
import * as RoundBackend from "./backend/RoundBackend";
import moment from "moment";
import * as Setting from "./Setting";
import {CSVLink} from "react-csv";

class RankingPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: props,
      programName: props.match.params.programName,
      students: null,
      reports: null,
      program: null,
      columns: this.getColumns(),
    };
  }

  getColumns() {
    return [
      {
        title: 'Name',
        dataIndex: 'realName',
        key: 'realName',
        width: '70px',
        sorter: (a, b) => a.realName.localeCompare(b.realName),
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
        width: '120px',
        sorter: (a, b) => a.github.localeCompare(b.github),
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
        width: '80px',
        sorter: (a, b) => a.mentor.localeCompare(b.mentor),
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
        width: '60px',
        sorter: (a, b) => a.score - b.score,
      },
    ];
  }

  isCurrentRound(round) {
    const now = moment();
    return moment(round.startDate) <= now && now < moment(round.endDate);
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
            title: <a href={`/rounds/${round.name}`}>{round.name}</a>,
            dataIndex: round.name,
            key: round.name,
            width: '70px',
            // sorter: (a, b) => a.key.localeCompare(b.key),
            className: this.isCurrentRound(round) ? "alert-row" : null,
            render: (text, record, index) => {
              if (text === undefined) {
                return (
                  <Tag icon={<CloseCircleOutlined />} color="error">N/A</Tag>
                )
              }

              if (text.score <= 3) {
                return (
                  <Tag icon={<MinusCircleOutlined />} color="error">{text.score}</Tag>
                )
              } else if (text.score <= 6) {
                return (
                  <Tag icon={<ExclamationCircleOutlined />} color="warning">{text.score}</Tag>
                )
              } else if (text.score <= 8) {
                return (
                  <Tag icon={<SyncOutlined spin />} color="processing">{text.score}</Tag>
                )
              } else {
                return (
                  <Tag icon={<CheckCircleOutlined />} color="success">{text.score}</Tag>
                )
              }
            }
          },
        );
      });

      let studentMap = new Map();
      students.forEach(student => {
        studentMap.set(student.name, student);
      });
      let roundMap = new Map();
      rounds.forEach(round => {
        roundMap.set(round.name, round);
      });

      reports.forEach((report) => {
        const roundName = report.round;
        const studentName = report.student;

        let student = studentMap.get(studentName);
        student[roundName] = report;
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

export default RankingPage;
