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
	"encoding/json"

	"github.com/casbin/casbin-oa/object"
)

/*
这个方法用于获取所有问题。
调用 object.GetIssues() 获取所有问题，并将结果保存到 c.Data["json"] 中。
通过 ServeJSON() 方法将 JSON 格式的结果作为响应返回。
*/
func (c *ApiController) GetIssue() {
	c.Data["json"] = object.GetIssues()
	c.ServeJSON()
}

func (c *ApiController) GetIssueByName() {
	name := c.Input().Get("name")

	c.Data["json"] = object.GetIssueByName(name)
	c.ServeJSON()
}

func (c *ApiController) UpdateIssue() {
	name := c.Input().Get("name")
	var issue object.Issue
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &issue)
	if err != nil {
		panic(err)
	}

	c.Data["json"] = object.UpdateIssue(name, &issue)
	c.ServeJSON()
}

func (c *ApiController) AddIssue() {
	var issue object.Issue
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &issue)
	if err != nil {
		panic(err)
	}

	c.Data["json"] = object.AddIssue(&issue)
	c.ServeJSON()
}

func (c *ApiController) DeleteIssue() {
	var issue object.Issue
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &issue)
	if err != nil {
		panic(err)
	}

	c.Data["json"] = object.DeleteIssue(&issue)
	c.ServeJSON()
}
