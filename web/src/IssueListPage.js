import React from 'react'
import {Button, Col, Popconfirm, Row, Table} from "antd";
import * as Setting from "./Setting";
import * as issueBackend from "./backend/issueBackend"

class IssueListPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: props,
      issues: null,
    };
  }

  componentWillMount() {
    this.getIssues();
  }

  getIssues() {
    issueBackend.getIssues().then(issues => {
      this.setState({
        issues: issues,
      });
    });
  }


  addNewIssue() {
    const newIssue = this.newIssue()
    issueBackend.addIssue(newIssue).then(res => {
      Setting.showMessage("success", "issue added successfully");
      this.setState({
        issues: Setting.prependRow(this.state.issues, newIssue),
      })
    }).catch(error => {
      Setting.showMessage("error", `issue failed to add: ${error}`)
    })
  }

  newIssue() {
    return {
      name: `issue_${this.state.issues.length}`,
      org: `casbin`,
      repo: 'All',
      assignee: 'hsluoyz',
      project_name: '',
      project_id: -1,
      at_people: [],
      reviewers: [],
    }
  }

  deleteIssue(index) {
    issueBackend.deleteIssue(this.state.issues[index])
      .then((res) => {
          Setting.showMessage("success", `issue deleted successfully`);
          this.setState({
            issues: Setting.deleteRow(this.state.issues, index),
          });
        }
      )
      .catch(error => {
        Setting.showMessage("error", `issue failed to delete: ${error}`);
      });
  }

  renderTable(issues) {
    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        width: '150px',
        sorter: (a, b) => a.name.localeCompare(b.name),
        render: (text, record, index) => {
          return (
            <a href={`/issues/${text}`}>{text}</a>
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
        title: 'Assignee',
        dataIndex: 'assignee',
        key: 'assignee',
        width: '120px',
        sorter: (a, b) => a.assignee.localeCompare(b.assignee),
      },
      {
        title: 'At People',
        dataIndex: 'at_people',
        key: 'at_people',
        sorter: (a, b) => a.at_people.localeCompare(b.at_people),

        render: (text, record, index) => {
          let at_people = ""
          for (let i = 0; i < text.length - 1; i++) {
            at_people += `${text[i]} , `
          }
          let lastPeople = text.length > 0 ? text[text.length - 1] : ""
          at_people += lastPeople
          return at_people;
        }
      },
      {
        title: 'Project',
        dataIndex: 'project_name',
        key: 'project_name',
        width: '250px',
        sorter: (a, b) => a.project_name.localeCompare(b.project_name),
      },
      {
        title: 'Reviewers',
        dataIndex: 'reviewers',
        key: 'reviewers',
        width: '250px',
        sorter: (a, b) => a.reviewers.localeCompare(b.reviewers),
        render: (text, record, index) => {
          let reviwers = ""
          for (let i = 0; i < text.length - 1; i++) {
            reviwers += `${text[i]} , `
          }
          let lastPeople = text.length > 0 ? text[text.length - 1] : ""
          reviwers += lastPeople
          return reviwers;
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
                      onClick={() => Setting.goToLink(`/issues/${record.name}`)}>Edit</Button>
              <Popconfirm
                title={`Sure to delete issue webhook: ${record.name} ?`}
                onConfirm={() => this.deleteIssue(index)}
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
        <Table columns={columns} dataSource={issues} rowKey="name" size="middle" bordered pagination={{pageSize: 100}}
               title={() => (
                 <div>
                   Issues&nbsp;&nbsp;&nbsp;&nbsp;
                   <Button type="primary" size="small" disabled={!Setting.isAdminUser(this.props.account)}
                           onClick={() => this.addNewIssue()}>Add</Button>
                 </div>
               )}
               loading={issues === null}
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
              this.renderTable(this.state.issues)
            }
          </Col>
          <Col span={1}>
          </Col>
        </Row>
      </div>
    );
  }
}

export default IssueListPage
