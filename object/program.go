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
	"xorm.io/core"
)

type Program struct {
	Owner       string `xorm:"varchar(100) notnull pk" json:"owner"`
	Name        string `xorm:"varchar(100) notnull pk" json:"name"`
	CreatedTime string `xorm:"varchar(100)" json:"createdTime"`

	Title     string `xorm:"varchar(100)" json:"title"`
	Url       string `xorm:"varchar(100)" json:"url"`
	StartDate string `xorm:"varchar(100)" json:"startDate"`
	EndDate   string `xorm:"varchar(100)" json:"endDate"`
}

func GetPrograms(owner string) []*Program {
	programs := []*Program{}
	err := adapter.engine.Desc("created_time").Find(&programs, &Program{Owner: owner})
	if err != nil {
		panic(err)
	}

	return programs
}

func getProgram(owner string, name string) *Program {
	program := Program{Owner: owner, Name: name}
	existed, err := adapter.engine.Get(&program)
	if err != nil {
		panic(err)
	}

	if existed {
		return &program
	} else {
		return nil
	}
}

func GetProgram(id string) *Program {
	owner, name := util.GetOwnerAndNameFromId(id)
	return getProgram(owner, name)
}

func UpdateProgram(id string, program *Program) bool {
	owner, name := util.GetOwnerAndNameFromId(id)
	if getProgram(owner, name) == nil {
		return false
	}

	_, err := adapter.engine.Id(core.PK{owner, name}).AllCols().Update(program)
	if err != nil {
		panic(err)
	}

	//return affected != 0
	return true
}

func AddProgram(program *Program) bool {
	affected, err := adapter.engine.Insert(program)
	if err != nil {
		panic(err)
	}

	return affected != 0
}

func DeleteProgram(program *Program) bool {
	affected, err := adapter.engine.Id(core.PK{program.Owner, program.Name}).Delete(&Program{})
	if err != nil {
		panic(err)
	}

	return affected != 0
}
