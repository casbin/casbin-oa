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

package object

import (
	"github.com/casbin/casbin-oa/util"
	"time"
	"xorm.io/core"
)

type Report struct {
	Owner       string `xorm:"varchar(100) notnull pk" json:"owner"`
	Name        string `xorm:"varchar(100) notnull pk" json:"name"`
	CreatedTime string `xorm:"varchar(100)" json:"createdTime"`

	Program string `xorm:"varchar(100)" json:"program"`
	Round   string `xorm:"varchar(100)" json:"round"`
	Student string `xorm:"varchar(100)" json:"student"`
	Mentor  string `xorm:"varchar(100)" json:"mentor"`
	Text    string `xorm:"mediumtext" json:"text"`
	Score   int    `json:"score"`
	Prs     []*Pr  `xorm:"varchar(10000)" json:"prs"`
}

func GetReports(owner string) []*Report {
	reports := []*Report{}
	err := adapter.Engine.Desc("created_time").Find(&reports, &Report{Owner: owner})
	if err != nil {
		panic(err)
	}

	return reports
}

func GetFilteredReports(owner string, program string) []*Report {
	reports := []*Report{}
	err := adapter.Engine.Desc("created_time").Find(&reports, &Report{Owner: owner, Program: program})
	if err != nil {
		panic(err)
	}

	return reports
}

func getReport(owner string, name string) *Report {
	report := Report{Owner: owner, Name: name}
	existed, err := adapter.Engine.Get(&report)
	if err != nil {
		panic(err)
	}

	if existed {
		return &report
	} else {
		return nil
	}
}

func GetReport(id string) *Report {
	owner, name := util.GetOwnerAndNameFromId(id)
	return getReport(owner, name)
}

func UpdateReport(id string, report *Report) bool {
	owner, name := util.GetOwnerAndNameFromId(id)
	if getReport(owner, name) == nil {
		AddReport(report)
		return true
	}

	_, err := adapter.Engine.Id(core.PK{owner, name}).AllCols().Update(report)
	if err != nil {
		panic(err)
	}

	//return affected != 0
	return true
}

func AddReport(report *Report) bool {
	affected, err := adapter.Engine.Insert(report)
	if err != nil {
		panic(err)
	}

	return affected != 0
}

func DeleteReport(report *Report) bool {
	affected, err := adapter.Engine.Id(core.PK{report.Owner, report.Name}).Delete(&Report{})
	if err != nil {
		panic(err)
	}

	return affected != 0
}

func AutoUpdateReport(id string, author string, startDate time.Time, endDate time.Time, student Student) bool {
	var prs []*Pr
	repositories := student.Repositories

	for i := range repositories {
		listPrs := ListPrs(author, "casbin", repositories[i], startDate, endDate)
		prs = append(prs, listPrs...)
	}

	report := GetReport(id)
	if report == nil {
		return false
	}
	report.Prs = prs

	return UpdateReport(id, report)
}
