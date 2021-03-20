// Copyright 2021 The casbin Authors. All Rights Reserved.
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

import React from "react";
import {Spin} from "antd";
import {withRouter} from "react-router-dom";
import * as AccountBackend from "../backend/AccountBackend";
import * as Util from "./Util";

class AuthCallback extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: props,
    };
  }

  componentWillMount() {
    this.login();
  }

  login() {
    const params = new URLSearchParams(this.props.location.search);
    AccountBackend.login(params.get("code"), params.get("state"))
      .then((res) => {
        if (res.status === "ok") {
          window.location.href = '/';
        } else {
          Util.showMessage("error", res?.msg);
        }
      });
  }

  render() {
    return (
      <div style={{textAlign: "center"}}>
        <Spin size="large" tip="Signing in..." style={{paddingTop: "10%"}} />
      </div>
    )
  }
}

export default withRouter(AuthCallback);
