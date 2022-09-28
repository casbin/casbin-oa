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
	"github.com/casdoor/casdoor-go-sdk/casdoorsdk"
	"xorm.io/core"
)

type Student struct {
	Owner           string             `xorm:"varchar(100) notnull pk" json:"owner"`
	Name            string             `xorm:"varchar(100) notnull pk" json:"name"`
	Program         string             `xorm:"varchar(100) notnull pk" json:"program"`
	CreatedTime     string             `xorm:"varchar(100)" json:"createdTime"`
	OrgRepositories []*OrgRepositories `xorm:"varchar(1000)" json:"org_repositories"`
	Mentor          string             `xorm:"varchar(100)" json:"mentor"`
}

func GetStudents(owner string) []*Student {
	students := []*Student{}
	err := adapter.Engine.Desc("created_time").Find(&students, &Student{Owner: owner})
	if err != nil {
		panic(err)
	}

	return students
}

func GetFilteredStudents(owner string, program string) []*Student {
	students := []*Student{}
	err := adapter.Engine.Desc("created_time").Find(&students, &Student{Owner: owner, Program: program})
	if err != nil {
		panic(err)
	}

	return students
}

func GetStudent(owner string, name string, program string) *Student {
	student := Student{Owner: owner, Name: name, Program: program}
	existed, err := adapter.Engine.Get(&student)
	if err != nil {
		panic(err)
	}

	if existed {
		return &student
	} else {
		return nil
	}
}

func UpdateStudent(owner string, name string, program string, student *Student) bool {
	if GetStudent(owner, name, program) == nil {
		return false
	}

	_, err := adapter.Engine.ID(core.PK{owner, name, program}).AllCols().Update(student)
	if err != nil {
		panic(err)
	}

	//return affected != 0
	return true
}

func AddStudent(student *Student) bool {
	affected, err := adapter.Engine.Insert(student)
	if err != nil {
		panic(err)
	}

	return affected != 0
}

func DeleteStudent(student *Student) bool {
	affected, err := adapter.Engine.ID(core.PK{student.Owner, student.Name, student.Program}).Delete(&Student{})
	if err != nil {
		panic(err)
	}

	return affected != 0
}

func GetStudentGithubMap(students []*Student, users []*casdoorsdk.User) map[string]string {

	userMap := make(map[string]*casdoorsdk.User)
	studentGithubMap := make(map[string]string)

	for i := range users {
		userMap[users[i].Name] = users[i]
	}

	for i := range students {
		var githubUsername string
		studentName := students[i].Name

		user, ok := userMap[studentName]
		if ok {
			githubUsername, ok = user.Properties["oauth_GitHub_username"]
			if !ok {
				githubUsername = user.Github
			}
			studentGithubMap[studentName] = githubUsername
		}
	}
	return studentGithubMap
}
