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
这个方法用于获取所有机器。
从请求参数中获取机器所有者，使用 c.Input().Get("owner") 获取名为 "owner" 的参数值，将其保存到 owner 变量中。
调用 object.GetMachines(owner) 获取指定所有者的机器，并将结果保存到 c.Data["json"] 中。
通过 ServeJSON() 方法将 JSON 格式的结果作为响应返回。
*/
func (c *ApiController) GetMachines() {
	owner := c.Input().Get("owner")

	c.Data["json"] = object.GetMachines(owner)
	c.ServeJSON()
}
/*
这个方法用于根据机器 ID 获取机器信息。
从请求参数中获取机器 ID，使用 c.Input().Get("id") 获取名为 "id" 的参数值，将其保存到 id 变量中。
调用 object.GetProcessIdSyncedMachine(id) 根据机器 ID 获取机器信息，并将结果保存到 c.Data["json"] 中。
通过 ServeJSON() 方法将 JSON 格式的结果作为响应返回。
*/
func (c *ApiController) GetMachine() {
	id := c.Input().Get("id")

	c.Data["json"] = object.GetProcessIdSyncedMachine(id)
	c.ServeJSON()
}
//更新机器信息
func (c *ApiController) UpdateMachine() {
	id := c.Input().Get("id")

	var machine object.Machine
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &machine)
	if err != nil {
		panic(err)
	}

	affected := object.UpdateMachine(id, &machine)
	go machine.DoActions()

	c.Data["json"] = affected
	c.ServeJSON()
}
//添加机器
func (c *ApiController) AddMachine() {
	var machine object.Machine
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &machine)
	if err != nil {
		panic(err)
	}

	c.Data["json"] = object.AddMachine(&machine)
	c.ServeJSON()
}
//删除机器
func (c *ApiController) DeleteMachine() {
	var machine object.Machine
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &machine)
	if err != nil {
		panic(err)
	}

	c.Data["json"] = object.DeleteMachine(&machine)
	c.ServeJSON()
}
