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

package object

import "xorm.io/core"

type CD struct {
	Name string `xorm:"varchar(100) notnull pk" json:"name"`
	Org  string `xorm:"varchar(100)" json:"org"`
	Repo string `xorm:"varchar(100)"  json:"repo"`
	Path string `xorm:"varchar(255)" json:"path"`
}

func GetCD() []*CD {
	cd := []*CD{}
	err := adapter.Engine.Find(&cd)
	if err != nil {
		panic(err)
	}

	return cd
}

func GetCDByOrgAndRepo(org string, repo string) *CD {
	cd := CD{Org: org, Repo: repo}
	existed, err := adapter.Engine.Get(&cd)

	if err != nil {
		panic(err)
	}
	if existed {
		return &cd
	} else {
		return nil
	}
}

func GetCDByName(name string) *CD {

	cd := CD{Name: name}
	existed, err := adapter.Engine.Get(&cd)
	if err != nil {
		panic(err)
	}
	if existed {
		return &cd
	} else {
		return nil
	}
}

func AddCD(cd *CD) bool {
	affected, err := adapter.Engine.Insert(cd)
	if err != nil {
		panic(err)
	}

	return affected != 0
}

func UpdateCD(name string, cd *CD) bool {
	if GetCDByName(name) == nil {
		return false
	}

	_, err := adapter.Engine.Id(core.PK{name}).AllCols().Update(cd)
	if err != nil {
		panic(err)
	}

	return true
}

func DeleteCD(cd *CD) bool {
	affected, err := adapter.Engine.Id(core.PK{cd.Name}).Delete(&CD{})
	if err != nil {
		panic(err)
	}

	return affected != 0
}
