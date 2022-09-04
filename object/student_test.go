// Copyright 2022 The casbin Authors. All Rights Reserved.
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
)

func TestAddStudents(t *testing.T) {
	InitConfig()

	startDate := getDateFromString("2022-01-13")

	for i := 0; i < 24; i++ {
		for j := 0; j < 60; j++ {
			student := &Student{
				Owner:           "admin",
				Name:            fmt.Sprintf("%02d-%02d", i, j),
				Program:         ProgramName,
				CreatedTime:     fmt.Sprintf("%sT00:00:00+08:00", startDate),
				OrgRepositories: []*OrgRepositories{},
				Mentor:          "",
			}

			AddStudent(student)
			fmt.Printf("%v\n", student)
		}
	}
}
