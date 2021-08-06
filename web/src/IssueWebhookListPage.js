import React from 'react'
import {Button, Col, Popconfirm, Row, Table} from "antd";
import * as Setting from "./Setting";
import * as IssueWebhookBackend from "./backend/IssueWebhookBackend"

class IssueWebhookListPage extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            classes: props,
            issueWebhooks: null,
        };
    }

    componentWillMount() {
        this.getIssueWebhooks();
    }

    getIssueWebhooks() {
        IssueWebhookBackend.getIssueWebhooks().then(issueWebhooks => {
            this.setState({
                issueWebhooks: issueWebhooks,
            });
        });
    }


    addNewIssueWebhook() {
        const newIssueWebhook = this.newIssueWebhook()
        IssueWebhookBackend.addIssueWebhook(newIssueWebhook).then(res => {
            Setting.showMessage("success", "IssueWebhook added successfully");
            this.setState({
                issueWebhooks: Setting.prependRow(this.state.issueWebhooks, newIssueWebhook),
            })
        }).catch(error => {
            Setting.showMessage("error", `IssueWebhook failed to add: ${error}`)
        })
    }

    newIssueWebhook() {
        return {
            name: `issueWebhook_${this.state.issueWebhooks.length}`,
            org: `casbin`,
            repo: '',
            assignee: 'hsluoyz',
            project_name: '',
            project_id: -1,
            at_people: [],
            url: '',
        }
    }

    getProjectNameById() {

    }

    deleteIssueWebhook(index) {
        IssueWebhookBackend.deleteIssueWebhook(this.state.issueWebhooks[index])
            .then((res) => {
                    Setting.showMessage("success", `IssueWebhook deleted successfully`);
                    this.setState({
                        programs: Setting.deleteRow(this.state.programs, index),
                    });
                }
            )
            .catch(error => {
                Setting.showMessage("error", `IssueWebhook failed to delete: ${error}`);
            });
    }

    renderTable(issueWebhooks) {
        const columns = [
            {
                title: 'Name',
                dataIndex: 'name',
                key: 'name',
                width: '150px',
                sorter: (a, b) => a.name.localeCompare(b.name),
                render: (text, record, index) => {
                    return (
                        <a href={``}>{text}</a>
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
                    if (text !== ""){
                        return (
                            <a href={`https://github.com/${record.org}/${text}`} target={"_blank"}>{text}</a>
                        )
                    }else {
                        return ""
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
                    for(let i =0 ; i< text.length-1; i++){
                        at_people += `${text[i]} , `
                    }
                    let lastPeople = text.length >0 ? text[text.length-1] : ""
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
                title: 'Action',
                dataIndex: '',
                key: 'op',
                width: '250px',
                render: (text, record, index) => {
                    return (
                        <div>
                            <Button style={{marginTop: '10px', marginBottom: '10px', marginRight: '10px'}} onClick={() => Setting.goToLink(`/issueWebhooks/${record.name}`)}>Edit</Button>
                            <Popconfirm
                                title={`Sure to delete issue webhook: ${record.name} ?`}
                                onConfirm={() => this.deleteIssueWebhook(index)}
                                disabled={!Setting.isAdminUser(this.props.account)}
                            >
                                <Button style={{marginBottom: '10px'}} type="danger" disabled={!Setting.isAdminUser(this.props.account)}>Delete</Button>
                            </Popconfirm>
                        </div>
                    )
                }
            },
        ];

        return (
            <div>
                <Table columns={columns} dataSource={issueWebhooks} rowKey="name" size="middle" bordered pagination={{pageSize: 100}}
                       title={() => (
                           <div>
                               Programs&nbsp;&nbsp;&nbsp;&nbsp;
                               <Button type="primary" size="small" disabled={!Setting.isAdminUser(this.props.account)} onClick={() => this.addNewIssueWebhook()} >Add</Button>
                           </div>
                       )}
                       loading={issueWebhooks=== null}
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
                            this.renderTable(this.state.issueWebhooks)
                        }
                    </Col>
                    <Col span={1}>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default IssueWebhookListPage