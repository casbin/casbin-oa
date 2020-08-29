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

func (c *ApiController) GetRounds() {
	owner := c.Input().Get("owner")

	c.Data["json"] = object.GetRounds(owner)
	c.ServeJSON()
}

func (c *ApiController) GetFilteredRounds() {
	owner := c.Input().Get("owner")
	program := c.Input().Get("program")

	c.Data["json"] = object.GetFilteredRounds(owner, program)
	c.ServeJSON()
}

func (c *ApiController) GetRound() {
	id := c.Input().Get("id")

	c.Data["json"] = object.GetRound(id)
	c.ServeJSON()
}

func (c *ApiController) UpdateRound() {
	id := c.Input().Get("id")

	var round object.Round
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &round)
	if err != nil {
		panic(err)
	}

	c.Data["json"] = object.UpdateRound(id, &round)
	c.ServeJSON()
}

func (c *ApiController) AddRound() {
	var round object.Round
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &round)
	if err != nil {
		panic(err)
	}

	c.Data["json"] = object.AddRound(&round)
	c.ServeJSON()
}

func (c *ApiController) DeleteRound() {
	var round object.Round
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &round)
	if err != nil {
		panic(err)
	}

	c.Data["json"] = object.DeleteRound(&round)
	c.ServeJSON()
}
