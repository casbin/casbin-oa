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
)

func (c *ApiController) GetPrograms() {
	owner := c.Input().Get("owner")

	c.Data["json"] = object.GetPrograms(owner)
	c.ServeJSON()
}

func (c *ApiController) GetProgram() {
	id := c.Input().Get("id")

	c.Data["json"] = object.GetProgram(id)
	c.ServeJSON()
}

func (c *ApiController) UpdateProgram() {
	id := c.Input().Get("id")

	var program object.Program
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &program)
	if err != nil {
		panic(err)
	}

	c.Data["json"] = object.UpdateProgram(id, &program)
	c.ServeJSON()
}

func (c *ApiController) AddProgram() {
	var program object.Program
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &program)
	if err != nil {
		panic(err)
	}

	c.Data["json"] = object.AddProgram(&program)
	c.ServeJSON()
}

func (c *ApiController) DeleteProgram() {
	var program object.Program
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &program)
	if err != nil {
		panic(err)
	}

	c.Data["json"] = object.DeleteProgram(&program)
	c.ServeJSON()
}
