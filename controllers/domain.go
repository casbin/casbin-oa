// Copyright 2022 The casbin Authors. All Rights Reserved.
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
这个函数用于获取域名列表。
从请求参数中获取所有者（owner）信息。
函数调用 object.GetDomains() 获取指定所有者的域名列表。
将结果设置到响应数据中，并通过 ServeJSON() 方法返回 JSON 格式的响应。
*/
func (c *ApiController) GetDomains() {
	owner := c.Input().Get("owner")

	c.Data["json"] = object.GetDomains(owner)
	c.ServeJSON()
}
/*
这个函数用于获取单个域名信息。
从请求参数中获取域名的 ID（id）
函数调用 object.GetDomain() 获取指定 ID 的域名信息。
将结果设置到响应数据中，并通过 ServeJSON() 方法返回 JSON 格式的响应。
*/
func (c *ApiController) GetDomain() {
	id := c.Input().Get("id")

	c.Data["json"] = object.GetDomain(id)
	c.ServeJSON()
}
/*
这个函数用于更新域名信息。
从请求参数中获取域名的 ID（id）。
函数调用 json.Unmarshal() 解码请求体中的 JSON 数据，并将结果保存到 domain 变量中。
函数调用 object.UpdateDomain() 更新指定 ID 的域名信息，并返回受影响的行数。
将受影响的行数设置到响应数据中，并通过 ServeJSON() 方法返回 JSON 格式的响应。
*/
func (c *ApiController) UpdateDomain() {
	id := c.Input().Get("id")

	var domain object.Domain
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &domain)
	if err != nil {
		panic(err)
	}

	affected := object.UpdateDomain(id, &domain)

	c.Data["json"] = affected
	c.ServeJSON()
}
/*
这个函数用于添加新的域名信息。
函数调用 json.Unmarshal() 解码请求体中的 JSON 数据，并将结果保存到 domain 变量中。
函数调用 object.AddDomain() 添加新的域名信息，并返回添加后的域名对象。
将添加后的域名对象设置到响应数据中，并通过 ServeJSON() 方法返回 JSON 格式的响应。
*/
func (c *ApiController) AddDomain() {
	var domain object.Domain
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &domain)
	if err != nil {
		panic(err)
	}

	c.Data["json"] = object.AddDomain(&domain)
	c.ServeJSON()
}
/*
这个函数用于删除域名信息。
函数调用 json.Unmarshal() 解码请求体中的 JSON 数据，并将结果保存到 domain 变量中。
函数调用 object.DeleteDomain() 删除指定的域名信息，并返回删除结果。
将删除结果设置到响应数据中，并通过 ServeJSON() 方法返回 JSON 格式的响应
*/
func (c *ApiController) DeleteDomain() {
	var domain object.Domain
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &domain)
	if err != nil {
		panic(err)
	}

	c.Data["json"] = object.DeleteDomain(&domain)
	c.ServeJSON()
}

/*
这个函数用于续订域名。
函数调用 json.Unmarshal() 解码请求体中的 JSON 数据，并将结果保存到 domain 变量中。
函数调用 object.RenewDomain() 续订指定的域名，并返回续订结果。
将续订结果设置到响应数据中，并通过 ServeJSON() 方法
*/
func (c *ApiController) RenewDomain() {
	var domain object.Domain
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &domain)
	if err != nil {
		panic(err)
	}

	c.Data["json"] = object.RenewDomain(&domain)
	c.ServeJSON()
}
