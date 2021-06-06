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
	"testing"
	"time"
)

func getDateFromString(date string) time.Time {
	dateString := date + "T00:00:00+08:00"
	res, err := time.Parse(time.RFC3339, dateString)
	if err != nil {
		panic(err)
	}

	return res
}

func TestAddRounds(t *testing.T) {
	InitConfig()
	InitAdapter()

	startDate := getDateFromString("2021-06-11")

	now := time.Now()
	date := now.Format("2006-01-02")
	for i := 0; i < 10; i++ {
		round := &Round{
			Owner:       "admin",
			Name:        fmt.Sprintf("gsoc-2021-week-%d", i),
			CreatedTime: fmt.Sprintf("%sT00:00:%02d+08:00", date, i),
			Title:       fmt.Sprintf("Week %d", i),
			Program:     "gsoc2021",
			StartDate:   startDate.AddDate(0, 0, 7*i).Format("2006-01-02"),
			EndDate:     startDate.AddDate(0, 0, 7*(i+1)).Format("2006-01-02"),
		}

		AddRound(round)
		fmt.Printf("%v\n", round)
	}
}
