import React from 'react'
import {Button, Card, AutoComplete, Col, Input, Row, Select, Tooltip} from "antd";
import * as Setting from "./Setting";
import * as issueBackend from "./backend/issueBackend";
import {CloseCircleTwoTone, CheckCircleTwoTone, LoadingOutlined} from '@ant-design/icons'
import * as ReportBackend from "./backend/ReportBackend"
import * as Conf from "./Conf"
import * as AccountBackend from "./backend/AccountBackend";
import * as StudentBackend from "./backend/StudentBackend";

const {Option} = Select

class IssueEditPage extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            classes: props,
            issueName: props.match.params.issueName,
            assigneeAvatar: "",
            issue: null,
            organizations: [],
            repositories: [],
            students: [],
            projectColumns: [],
            mentorsGithub: [],
            getOrg: false,
        };
    }

    componentWillMount() {
        this.getOrganizations();
        this.getIssue();
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
        Promise.all([this.getUsers(),this.getStudents()]).then(values => {
            let users = values[0];
            let students = values[1];

            let userMap = new Map();
            users.forEach(user => {
                userMap.set(user.name, user);
            });
            let studentMap = new Map();
            let mentorMap = new Map();
            let mentorsGithub = [];
            students.forEach((student, i) => {
                if (userMap.has(student.name)) {
                    students[i] = {...userMap.get(student.name), ...student};
                }
                let mentor = student.mentor;
                if (mentor !== "" && mentor !== null && mentorMap.get(mentor) === undefined){
                    mentorsGithub.push(student.mentor);
                    mentorMap.set(mentor,true);
                }
                studentMap.set(student.name, students[i]);
            });

            this.setState({
                students: students,
                mentorsGithub: mentorsGithub
            })

        })
    }

    getUserByUsername(){
        let username = this.state.issue.assignee;
        if (username === ""){
            this.setState({
                assigneeAvatar: ""
            })
            return;
        }
        issueBackend.getAvatarByUsername(username).then(res => {
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
        issueBackend.getProjectColumns().then(res => {
            this.setState({
                projectColumns: res,
            })
        });
    }

    getStudents() {
        return StudentBackend.getStudents("admin")
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

    getUsers() {
        return AccountBackend.getUsers(Conf.AuthConfig.organizationName)
            .then((res) => {
                return res;
            });
    }

    getIssue() {
        issueBackend.getIssue(this.state.issueName).then(issue => {
            this.setState({
                issue: issue
            })
            this.getRepositories(this.state.issue.org);
            this.getUserByUsername(this.state.issue.assignee);
            this.searchRepositories(this.state.issue.org);
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
            this.setState({
                getOrg: false,
            })
            Setting.showMessage("warn", "No Organization");
            return;
        }
        this.setState({
            getOrg: false,
        })
        ReportBackend.getRepositoriesByOrg(org).then(res => {
            if (res){
                this.setState({
                    repositories: res.repositories,
                    getOrg: true,
                })
            }
        }).catch(err => {

            Setting.showMessage("error", "Search Org Unsuccessfully")
        })

    }

    getAssignees(){
        this.setState({
            assignees: Conf.Assignees,
        })
    }


    orgChange(value){
        this.updateIssueField("org", value);
        this.updateIssueField("repo", "All");
        this.setState({
            repositories: [],
        })
    }

    selectOrg(value){
        this.updateIssueField("org", value);
        this.updateIssueField("repo", "All");
        this.setState({
            repositories: [],
        })
        this.searchRepositories(value);
    }

    updateIssueField(key, value) {
        let issue = this.state.issue;
        issue[key] = value;
        this.setState({
            issue: issue,
        });
    }

    projectChange(value, option){
        this.updateIssueField("project_name", option.children);
        this.updateIssueField("project_id", value);
    }

    submitIssueEdit() {
        let issue = Setting.deepCopy(this.state.issue);
        issueBackend.updateIssue(this.state.issueName, issue)
            .then((res) => {
                if (res) {
                    Setting.showMessage("success", `Successfully saved`);
                    this.setState({
                        issueName: this.state.issueName.name,
                    });
                    this.props.history.push(`/issues/${this.state.issue.name}`);
                } else {
                    Setting.showMessage("error", `failed to save: server side failure`);
                }
            })
            .catch(error => {
                Setting.showMessage("error", `failed to save: ${error}`);
            });
    }

    renderIssue() {

        let orgOptions = [];
        this.state.organizations.map((item) => {
            orgOptions.push({value: item});
        })

        let repoOptions = [];
        repoOptions.push(<Option value={'All'} key={'ALl'}>All</Option> )
        this.state.repositories.map((item ,index) => {
            repoOptions.push(<Option value={item} key={index}>{item}</Option>)
        })

        let assignees = [];
        this.state.assignees.map((item) =>{
            assignees.push({value: item})
        })

        let atPeople = [];
        this.state.students.map((item) => {
            let githubUsername
            if (item.properties === undefined && item.github === undefined)
                githubUsername = ""
            else
                githubUsername = item.properties.oauth_GitHub_username !== "" ? item.properties.oauth_GitHub_username : item.github;

            if (githubUsername !== ""){
                atPeople.push(<Option value={githubUsername} key={githubUsername}>{item.displayName} ({githubUsername})</Option> )
            }
        })
        this.state.mentorsGithub.map((item) => {
            atPeople.push(<Option value={item} key={item}>(mentor) {item}</Option> )
        })

        let projectColumns = [];
        this.state.projectColumns.map(item => {
            projectColumns.push(<Option value={item.id} key={item.id}>{item.name}</Option> );
        })


        return (
            <Card size="small" title={
                <div>
                    Edit Issue&nbsp;&nbsp;&nbsp;&nbsp;
                    <Button type="primary" disabled={!Setting.isAdminUser(this.props.account)} onClick={() => this.submitIssueEdit()}>Save</Button>
                </div>
            } style={{marginLeft: '5px'}} type="inner">

                <Row style={{marginTop: '10px'}} >
                    <Col style={{marginTop: '5px'}} span={2}>
                        Name:
                    </Col>
                    <Col span={22} >
                        <Input value={this.state.issue.name} onChange={e => {
                            this.updateIssueField('name', e.target.value);
                        }} />
                    </Col>
                </Row>
                <Row style={{marginTop: '10px'}} >
                    <Col style={{marginTop: '5px'}} span={2}>
                        Org:
                    </Col>
                    <Col span={10} >
                        <AutoComplete
                            defaultValue={this.state.issue.org}
                            size={"large"}
                            style={{ width: '80%', marginRight: '10px' }}
                            placeholder="Organization"
                            options={orgOptions}
                            onBlur={() => this.searchRepositories(this.state.issue.org)}
                            onChange={value => {this.orgChange(value)}}
                        />
                        {
                            this.state.getOrg  ?
                                (<CheckCircleTwoTone twoToneColor="#52c41a"/>) :
                                (<CloseCircleTwoTone twoToneColor="#ff0000"/>)
                        }

                        {/*<Button type={"primary"} size={"large"} loading={this.state.loading} onClick={() => {this.searchRepositories(this.state.issue.org)}}>Search</Button>*/}
                    </Col>
                    <Col style={{marginTop: '5px'}} span={1}>
                        <p style={{marginLeft: 10}}>
                            Repo:
                        </p>
                    </Col>
                    <Col span={10} style={{marginLeft: '10px'}}>
                        <Select
                            value={this.state.issue.repo}
                            defaultValue={this.state.issue.repo}
                            style={{ width: '80%' }}
                            autoClearSearchValue={true} size={"large"}
                            showSearch
                            onChange={(value => this.updateIssueField("repo", value))}
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
                            defaultValue={this.state.issue.assignee}
                            style={{ width: '100%' }}
                            placeholder="Assignee"
                            options={assignees}
                            onChange={value => {this.updateIssueField('assignee', value)}}
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
                            defaultValue={this.state.issue.at_people}
                            mode="tags"
                            style={{ width: '100%' }}
                            tokenSeparators={[',']}
                            optionLabelProp="value"
                            onChange={value => {this.updateIssueField('at_people', value)}}
                        >
                            {atPeople}
                        </Select>
                    </Col>
                </Row>
                <Row style={{marginTop: '20px'}} >
                    <Col style={{marginTop: '5px'}} span={2}>
                        Project:
                    </Col>
                    <Col span={22} >
                        <Select
                            defaultValue={this.state.issue.project_name}
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
                            this.state.issue !== null ? this.renderIssue() : null
                        }
                    </Col>
                    <Col span={1}>
                    </Col>
                </Row>
                <Row style={{margin: 10}}>
                    <Col span={2}>
                    </Col>
                    <Col span={18}>
                        <Button type="primary" size="large" disabled={!Setting.isAdminUser(this.props.account)} onClick={this.submitIssueEdit.bind(this)}>Save</Button>
                    </Col>
                </Row>
            </div>
        )
    }
}

export default IssueEditPage