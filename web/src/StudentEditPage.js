import React from "react";
import {Button, Card, Col, Input, Row, Select, Table, Tooltip, Checkbox, message} from 'antd';
import {DeleteOutlined} from '@ant-design/icons';
import * as StudentBackend from "./backend/StudentBackend";
import * as ReportBackend from "./backend/ReportBackend";
import * as Setting from "./Setting";
import * as Conf from "./Conf";
import Search from "antd/es/input/Search";

const {Option} = Select
class StudentEditPage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      classes: props,
      studentName: props.match.params.studentName,
      programName: props.match.params.programName,
      student: null,
      tasks: [],
      resources: [],
      selectValue: [],
      orgAndRepositories: [],
      orgRepositoriesMap: new Map()
    };
  }

  componentWillMount() {
    this.getStudent();
  }

  initRepositoriesMap(){
    let orgAndRepositories = this.state.orgAndRepositories;
    orgAndRepositories.map(item => {
      this.updateRepositoriesMap(item.organization)
    })
  }

  async updateRepositoriesMap(orgName){
    let orgRepositoriesMap = this.state.orgRepositoriesMap;
    if (orgRepositoriesMap.get(orgName) === undefined) {
      ReportBackend.getRepositoriesByOrg(orgName).then(res => {
        orgRepositoriesMap.set(res.organization, res.repositories)
        this.setState({
          orgRepositoriesMap: orgRepositoriesMap
        })
      })
    }

  }


  handleChange(value, record, index){
    let temp = [...this.state.orgAndRepositories];
    temp[index].organization = value;
    temp[index].loading = true;
    this.setState({
      orgAndRepositories : temp
    })

    let orgRepositoriesMap = this.state.orgRepositoriesMap;
    if (orgRepositoriesMap.get(value) === undefined) {
      ReportBackend.getRepositoriesByOrg(value).then(res => {
        orgRepositoriesMap.set(res.organization, res.repositories)
        message.success('Get Successfully')
        this.setState({
          orgRepositoriesMap: orgRepositoriesMap,
        })
      }).catch(err => {
        message.error("Get Failed")
      }).finally(() => {
        temp[index].loading = false;
        this.setState({
          orgAndRepositories : temp
        })
      })
    }else {
      message.success('Get Successfully')
      temp[index].loading = false;
      this.setState({
        orgAndRepositories : temp
      })
    }
  }

  updateRepositories(index, newRepositories){
    let orgAndRepositories = [...this.state.orgAndRepositories];
    orgAndRepositories[index].repositories = newRepositories;
    this.setState({
      orgAndRepositories: orgAndRepositories
    })
  }

  getAll(value, record, index){
    const organization = record.organization;
    let temp = [...this.state.orgAndRepositories];
    if (value) {
      this.updateRepositories(index, this.state.orgRepositoriesMap.get(organization));
    }else {
      this.updateRepositories(index,[])
    }
  }

  changeRepository(value, index){
    this.updateRepositories(index, value)
  }

  getStudent() {
    StudentBackend.getStudent("admin", this.state.studentName, this.state.programName)
      .then((student) => {
        this.setState({
          student: student,
          orgAndRepositories: student.org_repositories || []
        });
        this.initRepositoriesMap()
      });
  }

  parseStudentField(key, value) {
    // if ([].includes(key)) {
    //   value = Setting.myParseInt(value);
    // }
    return value;
  }

  updateStudentField(key, value) {
    value = this.parseStudentField(key, value);

    let student = this.state.student;
    student[key] = value;
    this.setState({
      student: student,
    });
  }

  addOrgRepository(){
    let newOrgAndRepositories = {organization:"",repositories:[]};
    let orgAndRepositories = Setting.addRow(this.state.orgAndRepositories,newOrgAndRepositories);
    this.setState({
      orgAndRepositories: orgAndRepositories
    })

  }

  deleteOrgRepository(index){
    let orgAndRepositories = Setting.deleteRow(this.state.orgAndRepositories,index);
    this.setState({
      orgAndRepositories: orgAndRepositories
    })
  }

  renderStudent() {
    const columns = [
      {
        title: "Organization",
        dataIndex: "organization",
        key: "organization",
        width: "30%",
        render: (text, record, index) => {
          return (
              <Search
                  loading={this.state.orgAndRepositories[index].loading}
                  defaultValue={text}
                  placeholder="input search text"
                  enterButton="Search"
                  size="large"
                  onSearch={(value) => this.handleChange(value, record, index)}
              />
          )
        },
      },
      {
        title: "Repositories",
        dataIndex: "repositories",
        key: "repositories",
        width: "60%",
        render: (text, record, index) => {
          let organization =  record.organization;
          let options = [];
          let repositories = this.state.orgRepositoriesMap.get(organization);
          if (repositories !== undefined){
            repositories.map((item, index) => {
              options.push(<Option value={item} key={item}>{item}</Option>)
            })

          }
          return (
              <Select
                virtual={false}
                onChange={(value) => this.changeRepository(value, index)}
                value={text}
                allowClear={true}
                mode="multiple"
                placeholder="Please select"
                size={"default"}
                style={{width: '100%'}}
              >
                {options}
              </Select>
          )

        }
      },
      {
        title: 'Action',
        key: 'action',
        width: '10%',
        render: (text, record, index) => {
          return (
              <div style={{display: "flex", justifyContent: 'center', alignContent: 'center', width: '100%'}}>
                <Tooltip placement="bottomLeft" title={"Select All"}>
                  <Checkbox onChange={(e)=> this.getAll(e.target.checked,record,index)} style={{marginRight: '10px',marginTop: '5px'}}></Checkbox>
                </Tooltip>
                <Tooltip placement="topLeft" title={"Delete"}>
                  <Button icon={<DeleteOutlined />} size={"middle"} onClick={() => this.deleteOrgRepository(index)} />
                </Tooltip>
              </div>
          );
        }
      }
    ]
    return (
      <Card size="small" title={
        <div>
          Edit Student&nbsp;&nbsp;&nbsp;&nbsp;
          <Button type="primary" disabled={!Setting.isAdminUser(this.props.account)} onClick={this.submitStudentEdit.bind(this)}>Save</Button>
        </div>
      } style={{marginLeft: '5px'}} type="inner">
        <Row style={{marginTop: '10px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            Name:
          </Col>
          <Col span={22} >
            <Input value={this.state.student.name} onChange={e => {
              this.updateStudentField('name', e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            Program:
          </Col>
          <Col span={22} >
            <Input value={this.state.student.program} onChange={e => {
              this.updateStudentField('program', e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            Mentor:
          </Col>
          <Col span={22} >
            <Input value={this.state.student.mentor} onChange={e => {
              this.updateStudentField('mentor', e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: '20px'}} >
          <Col style={{marginTop: '5px'}} span={2}>
            Repositories:
          </Col>
          <Col span={15} >
            <Table columns={columns} dataSource={this.state.orgAndRepositories}
                   size ="middle"
                   borderd
                   pagination={false}
                   title={() => (
                       <div>
                         {this.props.title}&nbsp;&nbsp;&nbsp;&nbsp;
                         <Button style={{marginRight: "5px"}} type="primary" size="small" onClick={() => this.addOrgRepository() }>添加</Button>
                       </div>
                   )}
            />
          </Col>
        </Row>
      </Card>
    )
  }

  submitStudentEdit() {
    this.state.student.org_repositories = this.state.orgAndRepositories;
    let student = Setting.deepCopy(this.state.student);
    StudentBackend.updateStudent(this.state.student.owner, this.state.studentName, this.state.programName, student)
      .then((res) => {
        if (res) {
          Setting.showMessage("success", `Successfully saved`);
          this.setState({
            studentName: this.state.student.name,
          });
          this.props.history.push(`/students`);
        } else {
          Setting.showMessage("error", `failed to save: server side failure`);
          this.updateStudentField('name', this.state.studentName);
        }
      })
      .catch(error => {
        Setting.showMessage("error", `failed to save: ${error}`);
      });
  }

  render() {
    return (
      <div>
        <Row style={{width: "100%"}}>
          <Col span={1}>
          </Col>
          <Col span={22}>
            {
              this.state.student !== null ? this.renderStudent() : null
            }
          </Col>
          <Col span={1}>
          </Col>
        </Row>
        <Row style={{margin: 10}}>
          <Col span={2}>
          </Col>
          <Col span={18}>
            <Button type="primary" size="large" disabled={!Setting.isAdminUser(this.props.account)} onClick={this.submitStudentEdit.bind(this)}>Save</Button>
          </Col>
        </Row>
      </div>
    );
  }
}

export default StudentEditPage;
