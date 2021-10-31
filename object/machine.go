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

import (
	"fmt"

	"github.com/casbin/casbin-oa/util"
	"xorm.io/core"
)

type Service struct {
	No             int    `json:"no"`
	Name           string `json:"name"`
	Path           string `json:"path"`
	Port           int    `json:"port"`
	ProcessId      int    `json:"processId"`
	ExpectedStatus string `json:"expectedStatus"`
	Status         string `json:"status"`
	SubStatus      string `json:"subStatus"`
	Message        string `json:"message"`
}

type Machine struct {
	Owner       string `xorm:"varchar(100) notnull pk" json:"owner"`
	Name        string `xorm:"varchar(100) notnull pk" json:"name"`
	CreatedTime string `xorm:"varchar(100)" json:"createdTime"`

	Description string `xorm:"varchar(100)" json:"description"`
	Ip          string `xorm:"varchar(100)" json:"ip"`
	Username    string `xorm:"varchar(100)" json:"username"`
	Password    string `xorm:"varchar(100)" json:"password"`
	AutoQuery   bool   `json:"autoQuery"`

	Services []*Service `json:"services"`
}

func GetMachines(owner string) []*Machine {
	machines := []*Machine{}
	err := adapter.Engine.Desc("created_time").Find(&machines, &Machine{Owner: owner})
	if err != nil {
		panic(err)
	}

	return machines
}

func getMachine(owner string, name string) *Machine {
	machine := Machine{Owner: owner, Name: name}
	existed, err := adapter.Engine.Get(&machine)
	if err != nil {
		panic(err)
	}

	if existed {
		return &machine
	} else {
		return nil
	}
}

func GetMachine(id string) *Machine {
	owner, name := util.GetOwnerAndNameFromId(id)
	return getMachine(owner, name)
}

func updateMachine(owner string, name string, machine *Machine) bool {
	if getMachine(owner, name) == nil {
		return false
	}

	_, err := adapter.Engine.Id(core.PK{owner, name}).AllCols().Update(machine)
	if err != nil {
		panic(err)
	}

	//return affected != 0
	return true
}

func UpdateMachine(id string, machine *Machine) bool {
	owner, name := util.GetOwnerAndNameFromId(id)
	return updateMachine(owner, name, machine)
}

func AddMachine(machine *Machine) bool {
	affected, err := adapter.Engine.Insert(machine)
	if err != nil {
		panic(err)
	}

	return affected != 0
}

func DeleteMachine(machine *Machine) bool {
	affected, err := adapter.Engine.Id(core.PK{machine.Owner, machine.Name}).Delete(&Machine{})
	if err != nil {
		panic(err)
	}

	return affected != 0
}

func (machine *Machine) getId() string {
	return fmt.Sprintf("%s/%s", machine.Owner, machine.Name)
}
