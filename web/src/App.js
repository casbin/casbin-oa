// Copyright 2020 The casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React, {Component} from 'react';
import './App.less';
import * as Setting from "./Setting";
import {DownOutlined, LogoutOutlined, SettingOutlined} from '@ant-design/icons';
import {Avatar, BackTop, Dropdown, Layout, Menu} from 'antd';
import {Switch, Route, withRouter} from 'react-router-dom';
import CustomGithubCorner from "./CustomGithubCorner";
import ProgramListPage from "./ProgramListPage";
import ProgramEditPage from "./ProgramEditPage";
import StudentListPage from "./StudentListPage";
import StudentEditPage from "./StudentEditPage";
import RoundListPage from "./RoundListPage";
import RoundEditPage from "./RoundEditPage";
import ReportListPage from "./ReportListPage";
import ReportEditPage from "./ReportEditPage";
import RankingPage from "./RankingPage";
import IssueListPage from "./IssueListPage"
import IssueEditPage from "./IssueEditPage"
import MachineListPage from "./MachineListPage";
import MachineEditPage from "./MachineEditPage";
import * as Conf from "./Conf";
import * as AccountBackend from "./backend/AccountBackend";
import AuthCallback from "./AuthCallback";

const { Header, Footer } = Layout;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: props,
      selectedMenuKey: 0,
      account: undefined,
    };

    Setting.initServerUrl();
    Setting.initCasdoorSdk(Conf.AuthConfig);
  }

  componentWillMount() {
    this.updateMenuKey();
    this.getAccount();
  }

  updateMenuKey() {
    // eslint-disable-next-line no-restricted-globals
    const uri = location.pathname;
    if (uri === '/') {
      this.setState({ selectedMenuKey: '/' });
    } else if (uri.includes('/students')) {
      this.setState({ selectedMenuKey: '/students' });
    } else if (uri.includes('/programs')) {
      this.setState({ selectedMenuKey: '/programs' });
    } else if (uri.includes('/rounds')) {
      this.setState({ selectedMenuKey: '/rounds' });
    } else if (uri.includes('/reports')) {
      this.setState({ selectedMenuKey: '/reports' });
    } else if (uri.includes('/issues')){
      this.setState({ selectedMenuKey: '/issues'})
    } else if (uri.includes('/machines')){
      this.setState({ selectedMenuKey: '/machines'})
    } else {
      this.setState({ selectedMenuKey: -1 });
    }
  }

  getAccount() {
    AccountBackend.getAccount()
      .then((res) => {
        this.setState({
          account: res.data,
        });
      });
  }

  signout() {
    this.setState({
      expired: false,
      submitted: false,
    });

    AccountBackend.signout()
      .then((res) => {
        if (res.status === 'ok') {
          this.setState({
            account: null
          });

          Setting.showMessage("success", `Successfully signed out, redirected to homepage`);
          Setting.goToLink("/");
        } else {
          Setting.showMessage("error", `Failed to sign out: ${res.msg}`);
        }
      });
  }

  handleRightDropdownClick(e) {
    if (e.key === '/account') {
      Setting.openLink(Setting.getMyProfileUrl(this.state.account));
    } else if (e.key === '/logout') {
      this.signout();
    }
  }

  renderAvatar() {
    if (this.state.account.avatar === "") {
      return (
        <Avatar style={{ backgroundColor: Setting.getAvatarColor(this.state.account.name), verticalAlign: 'middle' }} size="large">
          {Setting.getShortName(this.state.account.name)}
        </Avatar>
      )
    } else {
      return (
        <Avatar src={this.state.account.avatar} style={{verticalAlign: 'middle' }} size="large">
          {Setting.getShortName(this.state.account.name)}
        </Avatar>
      )
    }
  }

  renderRightDropdown() {
    const menu = (
      <Menu onClick={this.handleRightDropdownClick.bind(this)}>
        <Menu.Item key="/account">
          <SettingOutlined />
          My Account
        </Menu.Item>
        <Menu.Item key="/logout">
          <LogoutOutlined />
          Sign Out
        </Menu.Item>
      </Menu>
    );

    return (
      <Dropdown key="/rightDropDown" overlay={menu} className="rightDropDown">
        <a className="ant-dropdown-link" style={{float: 'right', cursor: 'pointer'}}>
          &nbsp;
          &nbsp;
          {
            this.renderAvatar()
          }
          &nbsp;
          &nbsp;
          {Setting.isMobile() ? null : Setting.getShortName(this.state.account.displayName)} &nbsp; <DownOutlined />
          &nbsp;
          &nbsp;
          &nbsp;
        </a>
      </Dropdown>
    )
  }

  renderAccount() {
    let res = [];

    if (this.state.account === undefined) {
      return null;
    } else if (this.state.account === null) {
      res.push(
        <Menu.Item key="/login" style={{float: 'right'}}>
          <a href={Setting.getSigninUrl()}>
            Sign In
          </a>
        </Menu.Item>
      );
    } else {
      res.push(this.renderRightDropdown());
    }

    return res;
  }

  renderMenu() {
    let res = [];

    // if (this.state.account === null || this.state.account === undefined) {
    //   return [];
    // }

    res.push(
      <Menu.Item key="/">
        <a href="/">
          Home
        </a>
      </Menu.Item>
    );
    res.push(
      <Menu.Item key="/students">
        <a href="/students">
          Students
        </a>
      </Menu.Item>
    );
    res.push(
      <Menu.Item key="/programs">
        <a href="/programs">
          Programs
        </a>
      </Menu.Item>
    );
    res.push(
      <Menu.Item key="/rounds">
        <a href="/rounds">
          Rounds
        </a>
      </Menu.Item>
    );
    res.push(
      <Menu.Item key="/reports">
        <a href="/reports">
          Reports
        </a>
      </Menu.Item>
    );
    res.push(
        <Menu.Item key="/issues">
          <a href="/issues">
            Issues
          </a>
        </Menu.Item>
    );
    res.push(
        <Menu.Item key="/machines">
          <a href="/machines">
            Machines
          </a>
        </Menu.Item>
    );

    return res;
  }

  renderContent() {
    return (
      <div>
        <Header style={{ padding: '0', marginBottom: '3px'}}>
          {
            Setting.isMobile() ? null : <a className="logo" href={"/"} />
          }
          <Menu
            // theme="dark"
            mode={"horizontal"}
            defaultSelectedKeys={[`${this.state.selectedMenuKey}`]}
            style={{ lineHeight: '64px' }}
          >
            {
              this.renderMenu()
            }
            {
              this.renderAccount()
            }
          </Menu>
        </Header>
        <Switch>
          <Route exact path="/callback" component={AuthCallback}/>
          <Route exact path="/" render={(props) => <RankingPage account={this.state.account} {...props} />}/>
          <Route exact path="/programs/:programName/ranking" render={(props) => <RankingPage account={this.state.account} {...props} />}/>
          <Route exact path="/students" render={(props) => <StudentListPage account={this.state.account} {...props} />}/>
          <Route exact path="/students/:studentName/:programName" render={(props) => <StudentEditPage account={this.state.account} {...props} />}/>
          <Route exact path="/programs" render={(props) => <ProgramListPage account={this.state.account} {...props} />}/>
          <Route exact path="/programs/:programName" render={(props) => <ProgramEditPage account={this.state.account} {...props} />}/>
          <Route exact path="/rounds" render={(props) => <RoundListPage account={this.state.account} {...props} />}/>
          <Route exact path="/rounds/:roundName" render={(props) => <RoundEditPage account={this.state.account} {...props} />}/>
          <Route exact path="/reports" render={(props) => <ReportListPage account={this.state.account} {...props} />}/>
          <Route exact path="/reports/:reportName" render={(props) => <ReportEditPage account={this.state.account} {...props} />}/>
          <Route exact path="/issues" render={ (props) => <IssueListPage account={this.state.account} {...props} />} />
          <Route exct path="/issues/:issueName" render={ (props) => <IssueEditPage account={this.state.account} {...props} /> } />
          <Route exact path="/machines" render={(props) => <MachineListPage account={this.state.account} {...props} />}/>
          <Route exact path="/machines/:machineName" render={(props) => <MachineEditPage account={this.state.account} {...props} />}/>
        </Switch>
      </div>
    )
  }

  renderFooter() {
    // How to keep your footer where it belongs ?
    // https://www.freecodecamp.org/neyarnws/how-to-keep-your-footer-where-it-belongs-59c6aa05c59c/

    return (
      <Footer id="footer" style={
        {
          borderTop: '1px solid #e8e8e8',
          backgroundColor: 'white',
          textAlign: 'center',
        }
      }>
        Made with <span style={{color: 'rgb(255, 255, 255)'}}>❤️</span> by <a style={{fontWeight: "bold", color: "black"}} target="_blank" href="https://casbin.org">Casbin</a>
      </Footer>
    )
  }

  renderComments() {
    if (this.state.account === undefined) {
      return null;
    }

    const nodeId = "casbin-oa";
    const title = encodeURIComponent(document.title);
    const urlPath = encodeURIComponent(window.location.pathname);

    let accessToken;
    if (this.state.account === null) {
      // Casbin-OA is signed out, also sign out Casnode.
      accessToken = "signout";
    } else {
      accessToken = this.state.account.accessToken;
    }

    return (
      <iframe
        style={{
          width: "100%",
          height: 500,
        }}
        src={`${Conf.CasnodeEndpoint}/embedded-replies?nodeId=${nodeId}&title=${title}&urlPath=${urlPath}&accessToken=${accessToken}`}
      />
    )
  }

  render() {
    return (
      <div id="parent-area">
        <BackTop />
        <CustomGithubCorner />
        <div id="content-wrap">
          {
            this.renderContent()
          }
        </div>
        {
          this.renderComments()
        }
        {
          this.renderFooter()
        }
      </div>
    );
  }
}

export default withRouter(App);
