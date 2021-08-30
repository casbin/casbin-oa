import React from 'react'
import {Button, Card, AutoComplete, Col, Input, Row, Select, Tooltip} from "antd";
import * as Setting from "./Setting";
import {CloseCircleTwoTone, CheckCircleTwoTone, LoadingOutlined} from '@ant-design/icons'
import * as ReportBackend from "./backend/ReportBackend"
import * as Conf from "./Conf"
import * as StudentBackend from "./backend/StudentBackend";
import * as CDBackend from "./backend/CDBackend"

const {Option} = Select

class CDEditPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: props,
      cdName: props.match.params.cdName,
      organizations: [],
      repositories: [],
      cd: null,
    };
  }

  componentWillMount() {
    this.getOrganizations();
    this.getCD();
  }

  getOrganizations() {
    this.setState({
      organizations: Conf.defaultOrgs
    })
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


  getCD() {
    CDBackend.getCD(this.state.cdName).then(cd => {
      this.setState({
        cd: cd
      })
      this.getRepositories(this.state.cd.org);
      this.searchRepositories(this.state.cd.org);
    })
  }

  getRepositories(org) {
    ReportBackend.getRepositoriesByOrg(org).then(res => {
      if (res) {
        this.setState({
          repositories: res.repositories
        })
      }
    })
  }

  searchRepositories(org) {
    if (org === "") {
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
      if (res) {
        this.setState({
          repositories: res.repositories,
          getOrg: true,
        })
      }
    }).catch(err => {

      Setting.showMessage("error", "Search Org Unsuccessfully")
    })

  }

  getAssignees() {
    this.setState({
      assignees: Conf.Assignees,
    })
  }


  orgChange(value) {
    this.updateCDField("org", value);
    this.updateCDField("repo", "");
    this.setState({
      repositories: [],
    })
  }

  selectOrg(value) {
    this.updateCDField("org", value);
    this.updateCDField("repo", "");
    this.setState({
      repositories: [],
    })
    this.searchRepositories(value);
  }

  updateCDField(key, value) {
    let cd = this.state.cd;
    cd[key] = value;
    this.setState({
      cd: cd,
    });
  }

  submitCDEdit() {
    let cd = Setting.deepCopy(this.state.cd);
    CDBackend.updateCD(this.state.cdName, cd)
      .then((res) => {
        if (res) {
          Setting.showMessage("success", `Successfully saved`);
          this.setState({
            cdName: this.state.cd.name,
          });
          this.props.history.push(`/cds/${this.state.cd.name}`);
        } else {
          Setting.showMessage("error", `failed to save: server side failure`);
        }
      })
      .catch(error => {
        Setting.showMessage("error", `failed to save: ${error}`);
      });
  }

  renderCD() {
    let orgOptions = [];
    this.state.organizations.map((item) => {
      orgOptions.push({value: item});
    })

    let repoOptions = [];
    this.state.repositories.map((item, index) => {
      repoOptions.push(<Option value={item} key={index}>{item}</Option>)
    })


    return (
      <Card size="small" title={
        <div>
          Edit CD&nbsp;&nbsp;&nbsp;&nbsp;
          <Button type="primary" disabled={!Setting.isAdminUser(this.props.account)}
                  onClick={() => this.submitCDEdit()}>Save</Button>
        </div>
      } style={{marginLeft: '5px'}} type="inner">

        <Row style={{marginTop: '10px'}}>
          <Col style={{marginTop: '5px'}} span={2}>
            Name:
          </Col>
          <Col span={22}>
            <Input value={this.state.cd.name} onChange={e => {
              this.updateCDField('name', e.target.value);
            }}/>
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}}>
          <Col style={{marginTop: '5px'}} span={2}>
            Org:
          </Col>
          <Col span={10}>
            <AutoComplete
              defaultValue={this.state.cd.org}
              style={{width: '80%', marginRight: '10px'}}
              placeholder="Organization"
              options={orgOptions}
              onBlur={() => this.searchRepositories(this.state.cd.org)}
              onChange={value => {
                this.orgChange(value)
              }}
            />
            {
              this.state.getOrg ?
                (<CheckCircleTwoTone twoToneColor="#52c41a"/>) :
                (<CloseCircleTwoTone twoToneColor="#ff0000"/>)
            }
          </Col>
          <Col span={1}>
            Repo:
          </Col>
          <Col span={10} style={{marginLeft: '10px'}}>
            <Select
              virtual={false}
              value={this.state.cd.repo}
              defaultValue={this.state.cd.repo}
              style={{width: '80%'}}
              autoClearSearchValue={true}
              showSearch
              onChange={(value => this.updateCDField("repo", value))}
            >
              {repoOptions}
            </Select>
          </Col>
        </Row>

        <Row style={{marginTop: '10px'}}>
          <Col style={{marginTop: '5px'}} span={2}>
            Path:
          </Col>
          <Col span={22}>
            <Input value={this.state.cd.path} onChange={e => {
              this.updateCDField('path', e.target.value);
            }}/>
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
              this.state.cd !== null ? this.renderCD() : null
            }
          </Col>
          <Col span={1}>
          </Col>
        </Row>
        <Row style={{margin: 10}}>
          <Col span={2}>
          </Col>
          <Col span={18}>
            <Button
                type="primary" size="large"
                disabled={!Setting.isAdminUser(this.props.account)}
                onClick={this.submitCDEdit.bind(this)}
            >
              Save
            </Button>
          </Col>
        </Row>
      </div>
    )
  }
}

export default CDEditPage
