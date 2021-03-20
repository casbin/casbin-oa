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
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/casbin/casbin-oa/util"
	"golang.org/x/oauth2"
)

var CasdoorEndpoint = "http://localhost:8000"
var ClientId = "xxx"
var ClientSecret = "xxx"

type Response struct {
	Status string      `json:"status"`
	Msg    string      `json:"msg"`
	Data   interface{} `json:"data"`
}

type User struct {
	Owner       string `xorm:"varchar(100) notnull pk" json:"owner"`
	Name        string `xorm:"varchar(100) notnull pk" json:"name"`
	CreatedTime string `xorm:"varchar(100)" json:"createdTime"`

	Id            string `xorm:"varchar(100)" json:"id"`
	Password      string `xorm:"varchar(100)" json:"password"`
	PasswordType  string `xorm:"varchar(100)" json:"passwordType"`
	DisplayName   string `xorm:"varchar(100)" json:"displayName"`
	Avatar        string `xorm:"varchar(255)" json:"avatar"`
	Email         string `xorm:"varchar(100)" json:"email"`
	Phone         string `xorm:"varchar(100)" json:"phone"`
	Affiliation   string `xorm:"varchar(100)" json:"affiliation"`
	Tag           string `xorm:"varchar(100)" json:"tag"`
	IsAdmin       bool   `json:"isAdmin"`
	IsGlobalAdmin bool   `json:"isGlobalAdmin"`

	Github string `xorm:"varchar(100)" json:"github"`
	Google string `xorm:"varchar(100)" json:"google"`
}

func getCasdoorOAuthToken(clientId string, clientSecret string, code string, state string) (*oauth2.Token, error) {
	config := oauth2.Config{
		ClientID:     clientId,
		ClientSecret: clientSecret,
		Endpoint: oauth2.Endpoint{
			AuthURL:  fmt.Sprintf("%s/api/login/oauth/authorize", CasdoorEndpoint),
			TokenURL: fmt.Sprintf("%s/api/login/oauth/access_token", CasdoorEndpoint),
		},
		//RedirectURL: redirectUri,
		Scopes:      nil,
	}

	token, err := config.Exchange(context.Background(), code)
	return token, err
}

func (c *ApiController) Login() {
	code := c.Input().Get("code")
	state := c.Input().Get("state")

	token, err := getCasdoorOAuthToken(ClientId, ClientSecret, code, redirectUri)
	if err != nil {
		panic(err)
	}

	c.Data["json"] = token
	c.ServeJSON()
}

func (c *ApiController) GetAccount() {
	var resp Response

	if c.GetSessionUser() == "" {
		resp = Response{Status: "error", Msg: "please sign in first", Data: c.GetSessionUser()}
		c.Data["json"] = resp
		c.ServeJSON()
		return
	}

	username := c.GetSessionUser()
	userObj := username
	resp = Response{Status: "ok", Msg: "", Data: util.StructToJson(userObj)}

	c.Data["json"] = resp
	c.ServeJSON()
}

func getUsers(owner string) []*User {
	url := fmt.Sprintf("%s/api/get-users?owner=%s", CasdoorEndpoint, owner)
	resp, err := http.Get(url)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	bytes, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		panic(err)
	}

	var users []*User
	err = json.Unmarshal(bytes, &users)
	if err != nil {
		panic(err)
	}
	return users
}

func (c *ApiController) GetUsers() {
	owner := c.Input().Get("owner")

	c.Data["json"] = getUsers(owner)
	c.ServeJSON()
}
