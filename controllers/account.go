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

package controllers

import (
	"encoding/json"

	"github.com/casbin/casbin-oa/object"
	"github.com/casbin/casbin-oa/util"
)

type RegisterForm struct {
	Username  string `json:"username"`
	Password  string `json:"password"`
	Name      string `json:"name"`
	School    string `json:"school"`
	Email     string `json:"email"`
	Cellphone string `json:"cellphone"`

	ContestId string `json:"contestId"`
}

type Response struct {
	Status string      `json:"status"`
	Msg    string      `json:"msg"`
	Data   interface{} `json:"data"`
	Data2  interface{} `json:"data2"`
}

// @Title Register
// @Description register a new user
// @Param   username     formData    string  true        "The username to register"
// @Param   password     formData    string  true        "The password"
// @Success 200 {object} controllers.api_controller.Response The Response object
// @router /register [post]
func (c *ApiController) Register() {
	var resp Response

	if c.GetSessionUser() != "" {
		resp = Response{Status: "error", Msg: "Please logout first before register", Data: c.GetSessionUser()}
		c.Data["json"] = resp
		c.ServeJSON()
		return
	}

	var form RegisterForm
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &form)
	if err != nil {
		panic(err)
	}
	user, password, name, school, email, cellphone := form.Username, form.Password, form.Name, form.School, form.Email, form.Cellphone

	msg := object.CheckUserRegister(user, password)
	if msg != "" {
		resp = Response{Status: "error", Msg: msg, Data: ""}
	} else {
		object.AddUser(user, password, name, school, email, cellphone)

		//c.SetSessionUser(user)

		util.LogInfo(c.Ctx, "API: [%s] is registered as new user", user)
		resp = Response{Status: "ok", Msg: "Registered successfully", Data: user}
	}

	c.Data["json"] = resp
	c.ServeJSON()
}

// @Title Login
// @Description login as a user
// @Param   username     formData    string  true        "The username to login"
// @Param   password     formData    string  true        "The password"
// @Success 200 {object} controllers.api_controller.Response The Response object
// @router /login [post]
func (c *ApiController) Login() {
	var resp Response

	if c.GetSessionUser() != "" {
		resp = Response{Status: "error", Msg: "Please logout first before login", Data: c.GetSessionUser()}
		c.Data["json"] = resp
		c.ServeJSON()
		return
	}

	var form RegisterForm
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &form)
	if err != nil {
		panic(err)
	}

	var msg string
	var user string
	var password string
	user, password = form.Username, form.Password
	msg = object.CheckUserLogin(user, password)

	if msg != "" {
		resp = Response{Status: "error", Msg: msg, Data: ""}
	} else {
		c.SetSessionUser(user)

		util.LogInfo(c.Ctx, "API: [%s] logged in", user)
		resp = Response{Status: "ok", Msg: "Logged in successfully", Data: user}
	}

	c.Data["json"] = resp
	c.ServeJSON()
}

// @Title Logout
// @Description logout the current user
// @Success 200 {object} controllers.api_controller.Response The Response object
// @router /logout [post]
func (c *ApiController) Logout() {
	var resp Response

	user := c.GetSessionUser()
	util.LogInfo(c.Ctx, "API: [%s] logged out", user)

	c.SetSessionUser("")

	resp = Response{Status: "ok", Msg: "Logged out successfully", Data: user}

	c.Data["json"] = resp
	c.ServeJSON()
}

func (c *ApiController) GetUser() {
	var userObj interface{}
	username := c.Input().Get("username")
	userObj = object.GetUser(username)

	c.Data["json"] = userObj
	c.ServeJSON()
}

func (c *ApiController) GetAccount() {
	var resp Response

	if c.GetSessionUser() == "" {
		resp = Response{Status: "error", Msg: "Please login first", Data: c.GetSessionUser()}
		c.Data["json"] = resp
		c.ServeJSON()
		return
	}

	var userObj interface{}
	username := c.GetSessionUser()
	userObj = object.GetUser(username)
	resp = Response{Status: "ok", Msg: "", Data: util.StructToJson(userObj)}

	c.Data["json"] = resp
	c.ServeJSON()
}

func (c *ApiController) GetSessionId() {
	c.Data["json"] = c.StartSession().SessionID()
	c.ServeJSON()
}
