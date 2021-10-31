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

func (c *ApiController) GetMachines() {
	owner := c.Input().Get("owner")

	c.Data["json"] = object.GetMachines(owner)
	c.ServeJSON()
}

func (c *ApiController) GetMachine() {
	id := c.Input().Get("id")

	machine := object.GetMachine(id)
	object.SyncAndSaveProcessIds(machine)
	c.Data["json"] = machine
	c.ServeJSON()
}

func (c *ApiController) UpdateMachine() {
	id := c.Input().Get("id")

	var machine object.Machine
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &machine)
	if err != nil {
		panic(err)
	}

	c.Data["json"] = object.UpdateMachine(id, &machine)
	c.ServeJSON()
}

func (c *ApiController) AddMachine() {
	var machine object.Machine
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &machine)
	if err != nil {
		panic(err)
	}

	c.Data["json"] = object.AddMachine(&machine)
	c.ServeJSON()
}

func (c *ApiController) DeleteMachine() {
	var machine object.Machine
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &machine)
	if err != nil {
		panic(err)
	}

	c.Data["json"] = object.DeleteMachine(&machine)
	c.ServeJSON()
}
