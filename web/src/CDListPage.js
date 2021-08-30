import React from 'react'
import {Button, Col, Popconfirm, Row, Table} from "antd";
import * as Setting from "./Setting";
import * as CDBackend from "./backend/CDBackend"

class CDListPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: props,
      CDs: null,
    };
  }

  componentWillMount() {
    this.getCDs();
  }

  getCDs() {
    CDBackend.getCDs().then(CDs => {
      this.setState({
        CDs: CDs
      })
    })
  }


  addNewCD() {
    const newCD = this.newCD()
    CDBackend.addCD(newCD).then(res => {
      Setting.showMessage("success", "CD added successfully");
      this.setState({
        CDs: Setting.prependRow(this.state.CDs, newCD),
      })
    }).catch(error => {
      Setting.showMessage("error", `CD failed to add: ${error}`)
    })
  }

  newCD() {
    return {
      name: `CD_${this.state.CDs.length}`,
      org: `casbin`,
      repo: 'casnode',
      path: 'F:\\\\github_repos\\\\casnode',
      latest_deploy: '',
      deploy_state: '',
    }
  }

  deleteCD(index) {
    CDBackend.deleteCD(this.state.CDs[index])
      .then((res) => {
          Setting.showMessage("success", `CD deleted successfully`);
          this.setState({
            CDs: Setting.deleteRow(this.state.CDs, index),
          });
        }
      )
      .catch(error => {
        Setting.showMessage("error", `CD failed to delete: ${error}`);
      });
  }

  renderTable(CDs) {
    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        width: '150px',
        sorter: (a, b) => a.name.localeCompare(b.name),
        render: (text, record, index) => {
          return (
            <a href={`/cds/${text}`}>{text}</a>
          )
        }
      },
      {
        title: 'Organization',
        dataIndex: 'org',
        key: 'org',
        width: '120px',
        sorter: (a, b) => a.org.localeCompare(b.org),
        render: (text, record, index) => {
          return (
            <a href={`https://github.com/${text}`} target={"_blank"}>{text}</a>
          )
        }
      },
      {
        title: 'Repository',
        dataIndex: 'repo',
        key: 'repo',
        width: '200px',
        sorter: (a, b) => a.repo.localeCompare(b.repo),
        render: (text, record, index) => {
          if (text !== "All") {
            return (
              <a href={`https://github.com/${record.org}/${text}`} target={"_blank"}>{text}</a>
            )
          } else {
            return "All"
          }
        }
      },
      {
        title: 'Path',
        dataIndex: 'path',
        key: 'path',
        sorter: (a, b) => a.path.localeCompare(b.path),
      },
      {
        title: 'Latest Deploy',
        dataIndex: 'latest_deploy',
        key: 'latest_deploy',
        width: '200px',
        sorter: (a, b) => a.latest_deploy.localeCompare(b.latest_deploy),
      },
      {
        title: 'Deploy State',
        dataIndex: 'deploy_state',
        key: 'deploy_state',
        width: '200px',
        sorter: (a, b) => a.deploy_state.localeCompare(b.deploy_state),
        render: (text, record, index) => {
          if (text !== 'Success'){
            return <p style={{color: "red"}}>{text}</p>
          }else {
            return <p style={{color: "green"}}>{text}</p>
          }
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
              <Button style={{marginTop: '10px', marginBottom: '10px', marginRight: '10px'}} type="primary"
                      onClick={() => Setting.goToLink(`/cds/${record.name}`)}>Edit</Button>
              <Popconfirm
                title={`Sure to delete CD: ${record.name} ?`}
                onConfirm={() => this.deleteCD(index)}
                disabled={!Setting.isAdminUser(this.props.account)}
              >
                <Button style={{marginBottom: '10px'}} type="danger"
                        disabled={!Setting.isAdminUser(this.props.account)}>Delete</Button>
              </Popconfirm>
            </div>
          )
        }
      },
    ];

    return (
      <div>
        <Table columns={columns} dataSource={CDs} rowKey="name" size="middle" bordered pagination={{pageSize: 100}}
               title={() => (
                 <div>
                   CDs&nbsp;&nbsp;&nbsp;&nbsp;
                   <Button type="primary" size="small" disabled={!Setting.isAdminUser(this.props.account)}
                           onClick={() => this.addNewCD()}>Add</Button>
                 </div>
               )}
               loading={CDs === null}
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
              this.renderTable(this.state.CDs)
            }
          </Col>
          <Col span={1}>
          </Col>
        </Row>
      </div>
    );
  }
}

export default CDListPage
