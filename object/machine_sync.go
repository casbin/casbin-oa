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
	"regexp"

	"github.com/casbin/casbin-oa/ssh"
)

var reBatNames *regexp.Regexp

func init() {
	reBatNames = regexp.MustCompile("run_(.*?)\\.bat")
}

func getBatNamesFromOutput(output string) map[string]int {
	res := map[string]int{}
	matches := reBatNames.FindAllStringSubmatch(output, -1)
	for _, v := range matches {
		batName := v[1]
		res[batName] = 1
	}

	return res
}

func getBatInfo(machine *Machine) map[string]int {
	command := "wmic process where (name=\"cmd.exe\") get CommandLine"
	output := ssh.RunCommand(machine.Ip, machine.Username, machine.Password, command)
	batNameMap := getBatNamesFromOutput(output)
	return batNameMap
}

func syncMachine(machine *Machine) {
	batNameMap := getBatInfo(machine)
	for _, service := range machine.Services {
		if _, ok := batNameMap[service.Name]; ok {
			service.Status = "Running"
		} else {
			service.Status = "Stopped"
		}
	}

	updateMachine(machine.Owner, machine.Name, machine)
}
