import React from 'react'
import {Button, Card, AutoComplete, Col, Input, Row, Select, Tooltip} from "antd";
import * as Setting from "./Setting";
import * as IssueWebhookBackend from "./backend/IssueWebhookBackend";
import {CloseCircleTwoTone, CheckCircleTwoTone } from '@ant-design/icons'
import * as ReportBackend from "./backend/ReportBackend"
import * as Conf from "./Conf"
import * as AccountBackend from "./backend/AccountBackend";
import * as StudentBackend from "./backend/StudentBackend";

const {Option} = Select

class IssueWebhookEditPage extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            classes: props,
            issueWebhookName: props.match.params.issueWebhookName,
            assigneeAvatar: "",
            issueWebhook: null,
            organizations: [],
            repositories: [],
            students: [],
            projectColumns: [],
            loading: false,
        };
    }

    componentWillMount() {
        this.getOrganizations();
        this.getIssueWebhook();
        this.getAssignees();
        this.getAtPeople();
        this.getProjectColumns();
    }

    getOrganizations() {
        this.setState({
            organizations: Conf.defaultOrgs
        })
    }

    getAtPeople(){
        Promise.all([this.getUsers(),this.getFilteredStudents(Conf.DefaultProgramName)]).then(values => {
            let users = values[0];
            let students = values[1];

            let userMap = new Map();
            users.forEach(user => {
                userMap.set(user.name, user);
            });
            let studentMap = new Map();
            students.forEach((student, i) => {
                if (userMap.has(student.name)) {
                    students[i] = {...userMap.get(student.name), ...student};
                }
                studentMap.set(student.name, students[i]);
            });

            this.setState({
                students: students,
            })

        })
    }

    getUserByUsername(){
        let username = this.state.issueWebhook.assignee;
        if (username === ""){
            this.setState({
                assigneeAvatar: ""
            })
            return;
        }
        IssueWebhookBackend.getAvatarByUsername(username).then(res => {
            if (res !== null && res !== undefined){
                this.setState({
                    assigneeAvatar : res.avatar_url
                })
            }else {
                this.setState({
                    assigneeAvatar: ""
                })
            }
        });
    }

    getProjectColumns(){
        IssueWebhookBackend.getProjectColumns().then(res => {
            this.setState({
                projectColumns: res,
            })
        });
    }

    getFilteredStudents(programName) {
        return StudentBackend.getFilteredStudents("admin", programName)
            .then((res) => {
                return res;
            });
    }

    getUsers() {
        return AccountBackend.getUsers(Conf.AuthConfig.organizationName)
            .then((res) => {
                return res;
            });
    }

    getIssueWebhook() {
        IssueWebhookBackend.getIssueWebhook(this.state.issueWebhookName).then(issueWebhook => {
            this.setState({
                issueWebhook: issueWebhook
            })
            this.getRepositories(this.state.issueWebhook.org);
            this.getUserByUsername(this.state.issueWebhook.assignee);
        })
    }

    getRepositories(org) {
        ReportBackend.getRepositoriesByOrg(org).then(res => {
            if (res){
                this.setState({
                    repositories: res.repositories
                })
            }
        })
    }

    searchRepositories(org) {
        if (org === ""){
            Setting.showMessage("warn", "No Organization");
            return;
        }
        this.setState({
            loading: true,
        })
        ReportBackend.getRepositoriesByOrg(org).then(res => {
            if (res){
                this.setState({
                    repositories: res.repositories,
                })
                Setting.showMessage("success", "Search Successfully")
            }
        }).catch(err => {
            Setting.showMessage("error", "Search Unsuccessfully")
        }).finally(() => {
            this.setState({
                loading: false
            })
        })

    }

    getAssignees(){
        this.setState({
            assignees: Conf.Assignees,
        })
    }

    selectOrg(value){
        this.updateIssueWebhookField("org", value);
        this.updateIssueWebhookField("repo", "");
        this.setState({
            repositories: [],
        })
    }

    updateIssueWebhookField(key, value) {
        let issueWebhook = this.state.issueWebhook;
        issueWebhook[key] = value;
        this.setState({
            issueWebhook: issueWebhook,
        });
    }

    projectChange(value, option){
        this.updateIssueWebhookField("project_name", option.children);
        this.updateIssueWebhookField("project_id", value);
    }

    submitIssueWebhookEdit() {
        let issueWebhook = Setting.deepCopy(this.state.issueWebhook);
        IssueWebhookBackend.updateIssueWebhook(this.state.issueWebhookName, issueWebhook)
            .then((res) => {
                if (res) {
                    Setting.showMessage("success", `Successfully saved`);
                    this.setState({
                        issueWebhookName: this.state.issueWebhookName.name,
                    });
                    this.props.history.push(`/issueWebhooks/${this.state.issueWebhook.name}`);
                } else {
                    Setting.showMessage("error", `failed to save: server side failure`);
                }
            })
            .catch(error => {
                Setting.showMessage("error", `failed to save: ${error}`);
            });
    }

    renderIssueWebhook() {

        let orgOptions = [];
        this.state.organizations.map((item) => {
            orgOptions.push({value: item});
        })

        let repoOptions = [];
        this.state.repositories.map((item ,index) => {
            repoOptions.push(<Option value={item} key={index}>{item}</Option>)
        })

        let assignees = [];
        this.state.assignees.map((item) =>{
            assignees.push({value: item})
        })

        let atPeople = [];
        this.state.students.map((item) => {
            let githubUsername = item.properties.oauth_GitHub_username !== "" ? item.properties.oauth_GitHub_username : item.github;

            if (githubUsername !== ""){
                atPeople.push(<Option value={githubUsername} key={githubUsername}>{item.displayName}({githubUsername})</Option> )
            }
        })

        let projectColumns = [];
        this.state.projectColumns.map(item => {
            projectColumns.push(<Option value={item.id} key={item.id}>{item.name}</Option> )
        })

        return (
            <Card size="small" title={
                <div>
                    Edit Program&nbsp;&nbsp;&nbsp;&nbsp;
                    <Button type="primary" disabled={!Setting.isAdminUser(this.props.account)} onClick={() => this.submitIssueWebhookEdit()}>Save</Button>
                </div>
            } style={{marginLeft: '5px'}} type="inner">

                <Row style={{marginTop: '10px'}} >
                    <Col style={{marginTop: '5px'}} span={2}>
                        Name:
                    </Col>
                    <Col span={22} >
                        <Input value={this.state.issueWebhook.name} onChange={e => {
                            this.updateIssueWebhookField('name', e.target.value);
                        }} />
                    </Col>
                </Row>
                <Row style={{marginTop: '10px'}} >
                    <Col style={{marginTop: '5px'}} span={2}>
                        Org:
                    </Col>
                    <Col span={12} >
                        <AutoComplete
                            defaultValue={this.state.issueWebhook.org}
                            size={"large"}
                            style={{ width: '80%' }}
                            placeholder="Organization"
                            options={orgOptions}
                            onChange={(value => {this.selectOrg(value)})}
                        />
                        <Button type={"primary"} size={"large"} loading={this.state.loading} onClick={() => {this.searchRepositories(this.state.issueWebhook.org)}}>Search</Button>
                    </Col>
                    <Col style={{marginTop: '5px'}} span={1}>
                        <p style={{marginLeft: 10}}>
                            Repo:
                        </p>
                    </Col>
                    <Col span={8} style={{marginLeft: '10px'}}>
                        <Select
                            value={this.state.issueWebhook.repo}
                            defaultValue={this.state.issueWebhook.repo}
                            style={{ width: 300 }}
                            allowClear
                            autoClearSearchValue={true} size={"large"}
                            showSearch
                            onChange={(value => this.updateIssueWebhookField("repo", value))}
                        >
                            {repoOptions}
                        </Select>
                    </Col>

                </Row>
                <Row style={{marginTop: '20px'}} >
                    <Col style={{marginTop: '5px'}} span={2}>
                        Assignee:
                    </Col>
                    <Col span={10} >
                        <AutoComplete

                            onBlur={() => this.getUserByUsername()}
                            defaultValue={this.state.issueWebhook.assignee}
                            style={{ width: '100%' }}
                            placeholder="Assignee"
                            options={assignees}
                            onChange={value => {this.updateIssueWebhookField('assignee', value)}}
                        />
                    </Col>
                    <Col span={1} style={{marginLeft: '10px'}}>
                        <img style={{marginRight: '5px'}} width={30} height={30} src={this.state.assigneeAvatar}/>
                        {
                            this.state.assigneeAvatar === "" ?
                                (<CloseCircleTwoTone twoToneColor="#ff0000"/>) :
                                (<CheckCircleTwoTone twoToneColor="#52c41a"/>)
                        }


                    </Col>

                </Row>
                <Row style={{marginTop: '20px'}} >
                    <Col style={{marginTop: '5px'}} span={2}>
                        At People:
                    </Col>
                    <Col span={22} >
                        <Select
                            defaultValue={this.state.issueWebhook.at_people}
                            mode="tags"
                            style={{ width: '100%' }}
                            placeholder="Tags Mode"
                            tokenSeparators={[',']}
                            optionLabelProp="value"
                            onChange={value => {this.updateIssueWebhookField('at_people', value)}}
                        >
                            {atPeople}
                        </Select>,
                    </Col>
                </Row>
                <Row style={{marginTop: '20px'}} >
                    <Col style={{marginTop: '5px'}} span={2}>
                        Project:
                    </Col>
                    <Col span={22} >
                        <Select
                            defaultValue={this.state.issueWebhook.project_name}
                            style={{ width: 300 }}
                            onChange={(value, option) => {this.projectChange(value, option)}}
                        >
                            {projectColumns}
                        </Select>
                    </Col>
                </Row>
            </Card>
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
                            this.state.issueWebhook !== null ? this.renderIssueWebhook() : null
                        }
                    </Col>
                    <Col span={1}>
                    </Col>
                </Row>
                <Row style={{margin: 10}}>
                    <Col span={2}>
                    </Col>
                    <Col span={18}>
                        <Button type="primary" size="large" disabled={!Setting.isAdminUser(this.props.account)} onClick={this.submitIssueWebhookEdit.bind(this)}>Save</Button>
                    </Col>
                </Row>
            </div>
        )
    }
}

export default IssueWebhookEditPage