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
	"math"
	"time"

	"github.com/casbin/casbin-oa/util"
	"xorm.io/core"
)

type Round struct {
	Owner       string `xorm:"varchar(100) notnull pk" json:"owner"`
	Name        string `xorm:"varchar(100) notnull pk" json:"name"`
	CreatedTime string `xorm:"varchar(100)" json:"createdTime"`

	Title     string `xorm:"varchar(100)" json:"title"`
	Program   string `xorm:"varchar(100)" json:"program"`
	StartDate string `xorm:"varchar(100)" json:"startDate"`
	EndDate   string `xorm:"varchar(100)" json:"endDate"`
}

func GetRounds(owner string) []*Round {
	rounds := []*Round{}
	err := adapter.Engine.Asc("created_time").Find(&rounds, &Round{Owner: owner})
	if err != nil {
		panic(err)
	}

	return rounds
}

func GetFilteredRounds(owner string, program string) []*Round {
	rounds := []*Round{}
	err := adapter.Engine.Asc("created_time").Find(&rounds, &Round{Owner: owner, Program: program})
	if err != nil {
		panic(err)
	}

	return rounds
}

func GetLateRound(owner string, program string) *Round {

	DateTemplate := "2006-01-02"
	round := Round{Owner: owner, Program: program}
	now := time.Now().Format(DateTemplate)
	has, err := adapter.Engine.Where("end_date <= ?", now).Desc("end_date").Limit(1).Get(&round)
	if err != nil {
		panic(err)
	}
	if !has {
		return nil
	}

	EndDate, _ := time.ParseInLocation(DateTemplate, round.EndDate, time.UTC)
	if math.Abs(float64(time.Now().YearDay()-EndDate.YearDay())) <= 2 {
		return &round
	}
	return nil
}

func getRound(owner string, name string) *Round {
	round := Round{Owner: owner, Name: name}
	existed, err := adapter.Engine.Get(&round)
	if err != nil {
		panic(err)
	}

	if existed {
		return &round
	} else {
		return nil
	}
}

func GetRound(id string) *Round {
	owner, name := util.GetOwnerAndNameFromId(id)
	return getRound(owner, name)
}

func UpdateRound(id string, round *Round) bool {
	owner, name := util.GetOwnerAndNameFromId(id)
	if getRound(owner, name) == nil {
		return false
	}

	_, err := adapter.Engine.Id(core.PK{owner, name}).AllCols().Update(round)
	if err != nil {
		panic(err)
	}

	//return affected != 0
	return true
}

func AddRound(round *Round) bool {
	affected, err := adapter.Engine.Insert(round)
	if err != nil {
		panic(err)
	}

	return affected != 0
}

func DeleteRound(round *Round) bool {
	affected, err := adapter.Engine.Id(core.PK{round.Owner, round.Name}).Delete(&Round{})
	if err != nil {
		panic(err)
	}

	return affected != 0
}
