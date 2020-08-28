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

type Student struct {
	Owner       string `xorm:"varchar(100) notnull pk" json:"owner"`
	Name        string `xorm:"varchar(100) notnull pk" json:"name"`
	CreatedTime string `xorm:"varchar(100)" json:"createdTime"`

	RealName string `xorm:"varchar(100)" json:"realName"`
	School   string `xorm:"varchar(100)" json:"school"`
	Program  string `xorm:"varchar(100)" json:"program"`
	Mentor   string `xorm:"varchar(100)" json:"mentor"`
	Github   string `xorm:"varchar(100)" json:"github"`
	Email    string `xorm:"varchar(100)" json:"email"`
}

func GetStudents(owner string) []*Student {
	students := []*Student{}
	err := adapter.engine.Desc("created_time").Find(&students, &Student{Owner: owner})
	if err != nil {
		panic(err)
	}

	return students
}

func getStudent(owner string, name string) *Student {
	student := Student{Owner: owner, Name: name}
	existed, err := adapter.engine.Get(&student)
	if err != nil {
		panic(err)
	}

	if existed {
		return &student
	} else {
		return nil
	}
}

func GetStudent(id string) *Student {
	owner, name := util.GetOwnerAndNameFromId(id)
	return getStudent(owner, name)
}

func UpdateStudent(id string, student *Student) bool {
	owner, name := util.GetOwnerAndNameFromId(id)
	if getStudent(owner, name) == nil {
		return false
	}

	_, err := adapter.engine.Id(core.PK{owner, name}).AllCols().Update(student)
	if err != nil {
		panic(err)
	}

	//return affected != 0
	return true
}

func AddStudent(student *Student) bool {
	affected, err := adapter.engine.Insert(student)
	if err != nil {
		panic(err)
	}

	return affected != 0
}

func DeleteStudent(student *Student) bool {
	affected, err := adapter.engine.Id(core.PK{student.Owner, student.Name}).Delete(&Student{})
	if err != nil {
		panic(err)
	}

	return affected != 0
}
