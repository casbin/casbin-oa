import React from "react";
import {Button, Col, Popconfirm, Row, Table} from 'antd';
import moment from "moment";
import * as Setting from "./Setting";
import * as RoundBackend from "./backend/RoundBackend";

class RoundListPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: props,
      rounds: null,
    };
  }

  componentWillMount() {
    this.getRounds();
  }

  getRounds() {
    RoundBackend.getRounds("admin")
      .then((res) => {
        this.setState({
          rounds: res,
        });
      });
  }

  newRound() {
    return {
      owner: "admin", // this.props.account.username,
      name: `round_${this.state.rounds.length}`,
      createdTime: moment().format(),
      title: `New Round - ${this.state.rounds.length}`,
      startDate: "2020-01-23",
      endDate: "2020-01-23",
    }
  }

  addRound() {
    const newRound = this.newRound();
    RoundBackend.addRound(newRound)
      .then((res) => {
          Setting.showMessage("success", `Round added successfully`);
          this.setState({
            rounds: Setting.prependRow(this.state.rounds, newRound),
          });
        }
      )
      .catch(error => {
        Setting.showMessage("error", `Round failed to add: ${error}`);
      });
  }

  deleteRound(i) {
    RoundBackend.deleteRound(this.state.rounds[i])
      .then((res) => {
          Setting.showMessage("success", `Round deleted successfully`);
          this.setState({
            rounds: Setting.deleteRow(this.state.rounds, i),
          });
        }
      )
      .catch(error => {
        Setting.showMessage("error", `Round failed to delete: ${error}`);
      });
  }

  renderTable(rounds) {
    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        width: '120px',
        sorter: (a, b) => a.name.localeCompare(b.name),
        render: (text, record, index) => {
          return (
            <a href={`/rounds/${text}`}>{text}</a>
          )
        }
      },
      {
        title: 'Title',
        dataIndex: 'title',
        key: 'title',
        // width: '80px',
        sorter: (a, b) => a.title.localeCompare(b.title),
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
        title: 'Start Date',
        dataIndex: 'startDate',
        key: 'startDate',
        width: '120px',
        sorter: (a, b) => a.startDate.localeCompare(b.startDate),
      },
      {
        title: 'End Date',
        dataIndex: 'endDate',
        key: 'endDate',
        width: '120px',
        sorter: (a, b) => a.endDate.localeCompare(b.endDate),
      },
      {
        title: 'Action',
        dataIndex: '',
        key: 'op',
        width: '160px',
        render: (text, record, index) => {
          return (
            <div>
              <Button style={{marginTop: '10px', marginBottom: '10px', marginRight: '10px'}} type="primary" onClick={() => Setting.goToLink(`/rounds/${record.name}`)}>Edit</Button>
              <Popconfirm
                title={`Sure to delete round: ${record.name} ?`}
                onConfirm={() => this.deleteRound(index)}
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
        <Table columns={columns} dataSource={rounds} rowKey="name" size="middle" bordered pagination={{pageSize: 100}}
               title={() => (
                 <div>
                   Rounds&nbsp;&nbsp;&nbsp;&nbsp;
                   <Button type="primary" size="small" onClick={this.addRound.bind(this)}>Add</Button>
                 </div>
               )}
               loading={rounds === null}
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
              this.renderTable(this.state.rounds)
            }
          </Col>
          <Col span={1}>
          </Col>
        </Row>
      </div>
    );
  }
}

export default RoundListPage;
