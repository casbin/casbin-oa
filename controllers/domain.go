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

func (c *ApiController) GetDomains() {
	owner := c.Input().Get("owner")

	c.Data["json"] = object.GetDomains(owner)
	c.ServeJSON()
}

func (c *ApiController) GetDomain() {
	id := c.Input().Get("id")

	c.Data["json"] = object.GetDomain(id)
	c.ServeJSON()
}

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

func (c *ApiController) AddDomain() {
	var domain object.Domain
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &domain)
	if err != nil {
		panic(err)
	}

	c.Data["json"] = object.AddDomain(&domain)
	c.ServeJSON()
}

func (c *ApiController) DeleteDomain() {
	var domain object.Domain
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &domain)
	if err != nil {
		panic(err)
	}

	c.Data["json"] = object.DeleteDomain(&domain)
	c.ServeJSON()
}
