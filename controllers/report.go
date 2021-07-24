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
	"time"

	"github.com/casbin/casbin-oa/object"
)

func (c *ApiController) GetReports() {
	owner := c.Input().Get("owner")

	c.Data["json"] = object.GetReports(owner)
	c.ServeJSON()
}

func (c *ApiController) GetFilteredReports() {
	owner := c.Input().Get("owner")
	program := c.Input().Get("program")

	c.Data["json"] = object.GetFilteredReports(owner, program)
	c.ServeJSON()
}

func (c *ApiController) GetReport() {
	id := c.Input().Get("id")

	c.Data["json"] = object.GetReport(id)
	c.ServeJSON()
}

func (c *ApiController) UpdateReport() {
	id := c.Input().Get("id")

	var report object.Report
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &report)
	if err != nil {
		panic(err)
	}

	c.Data["json"] = object.UpdateReport(id, &report)
	c.ServeJSON()
}

func (c *ApiController) AddReport() {
	var report object.Report
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &report)
	if err != nil {
		panic(err)
	}

	c.Data["json"] = object.AddReport(&report)
	c.ServeJSON()
}

func (c *ApiController) DeleteReport() {
	var report object.Report
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &report)
	if err != nil {
		panic(err)
	}

	c.Data["json"] = object.DeleteReport(&report)
	c.ServeJSON()
}

func (c *ApiController) AutoUpdateReport() {
	id := c.Input().Get("id")
	startDate := c.Input().Get("startDate")
	endDate := c.Input().Get("endDate")
	author := c.Input().Get("author")

	var student object.Student
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &student)
	if err != nil {
		panic(err)
	}

	layout := "2006-01-02"
	startDateT, _ := time.ParseInLocation(layout, startDate, time.UTC)
	endDateT, _ := time.ParseInLocation(layout, endDate, time.UTC)

	c.Data["json"] = object.UpdateReportEvents(id, author, startDateT, endDateT, student)
	c.ServeJSON()
}
