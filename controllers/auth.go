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

package controllers

import (
	"github.com/casbin/casbin-oa/auth"
	"github.com/casbin/casbin-oa/util"
)

var CasdoorEndpoint = "http://localhost:8000"
var ClientId = "0ba528121ea87b3eb54d"
var ClientSecret = "xxx"

type Response struct {
	Status string      `json:"status"`
	Msg    string      `json:"msg"`
	Data   interface{} `json:"data"`
}

func init() {
	auth.InitConfig(CasdoorEndpoint)
}

func (c *ApiController) Login() {
	code := c.Input().Get("code")
	state := c.Input().Get("state")

	token, err := auth.GetOAuthToken(ClientId, ClientSecret, code, state)
	if err != nil {
		panic(err)
	}

	claims, err := auth.ParseJwtToken(token.AccessToken)
	if err != nil {
		panic(err)
	}

	c.SetSessionUser(claims)

	resp := &Response{Status: "ok", Msg: "", Data: claims}
	c.Data["json"] = resp
	c.ServeJSON()
}

func (c *ApiController) Logout() {
	var resp Response

	c.SetSessionUser(nil)

	resp = Response{Status: "ok", Msg: ""}
	c.Data["json"] = resp
	c.ServeJSON()
}

func (c *ApiController) GetAccount() {
	var resp Response

	if c.GetSessionUser() == nil {
		resp = Response{Status: "error", Msg: "please sign in first", Data: c.GetSessionUser()}
		c.Data["json"] = resp
		c.ServeJSON()
		return
	}

	claims := c.GetSessionUser()
	userObj := claims
	resp = Response{Status: "ok", Msg: "", Data: userObj}

	c.Data["json"] = resp
	c.ServeJSON()
}

func (c *ApiController) GetUsers() {
	owner := c.Input().Get("owner")

	c.Data["json"] = auth.GetUsers(owner)
	c.ServeJSON()
}
