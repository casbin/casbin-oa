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

func (c *ApiController) GetStudents() {
	owner := c.Input().Get("owner")

	c.Data["json"] = object.GetStudents(owner)
	c.ServeJSON()
}

func (c *ApiController) GetFilteredStudents() {
	owner := c.Input().Get("owner")
	program := c.Input().Get("program")

	c.Data["json"] = object.GetFilteredStudents(owner, program)
	c.ServeJSON()
}

func (c *ApiController) GetStudent() {
	id := c.Input().Get("id")

	c.Data["json"] = object.GetStudent(id)
	c.ServeJSON()
}

func (c *ApiController) UpdateStudent() {
	id := c.Input().Get("id")

	var student object.Student
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &student)
	if err != nil {
		panic(err)
	}

	c.Data["json"] = object.UpdateStudent(id, &student)
	c.ServeJSON()
}

func (c *ApiController) AddStudent() {
	var student object.Student
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &student)
	if err != nil {
		panic(err)
	}

	c.Data["json"] = object.AddStudent(&student)
	c.ServeJSON()
}

func (c *ApiController) DeleteStudent() {
	var student object.Student
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &student)
	if err != nil {
		panic(err)
	}

	c.Data["json"] = object.DeleteStudent(&student)
	c.ServeJSON()
}
