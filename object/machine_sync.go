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
	"regexp"
	"strings"

	"github.com/casbin/casbin-oa/ssh"
)

var reBatNames *regexp.Regexp

func init() {
	reBatNames = regexp.MustCompile("run_(.*?)\\.bat")
}

func getMachineService(id string, service *Service) *Service {
	machine := GetMachine(id)
	res := machine.Services[service.No]
	return res
}

func updateMachineService(id string, service *Service) bool {
	machine := GetMachine(id)
	machine.Services[service.No] = service
	return UpdateMachine(id, machine)
}

func updateMachineServiceStatus(machine *Machine, service *Service, status string) bool {
	id := machine.getId()
	service.Status = status
	return updateMachineService(id, service)
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

func (machine *Machine) runCommand(command string) string {
	output := ssh.RunCommand(machine.Ip, machine.Username, machine.Password, command)
	return output
}

func getBatInfo(machine *Machine) map[string]int {
	command := "wmic process where (name=\"cmd.exe\") get CommandLine"
	output := machine.runCommand(command)
	batNameMap := getBatNamesFromOutput(output)
	return batNameMap
}

func doPull(machine *Machine, service *Service) error {
	updateMachineServiceStatus(machine, service, "Pull: Running")

	command := fmt.Sprintf("cd C:/github_repos/%s && git pull --rebase --autostash", service.Name)
	output := machine.runCommand(command)

	var err error
	if strings.Contains(output, "Successfully rebased and updated") || strings.Contains(output, "Current branch master is up to date") {
		err = nil
		updateMachineServiceStatus(machine, service, "Pull: Done")
	} else {
		err = fmt.Errorf(output)
		updateMachineServiceStatus(machine, service, fmt.Sprintf("Pull: Error: %s", output))
	}
	return err
}

func doBuild(machine *Machine, service *Service) error {
	updateMachineServiceStatus(machine, service, "Build: Running")

	command := fmt.Sprintf("cd C:/github_repos/%s/web && yarn build", service.Name)
	output := machine.runCommand(command)

	var err error
	if strings.Contains(output, "Done in ") {
		err = nil
		updateMachineServiceStatus(machine, service, "Build: Done")
	} else {
		err = fmt.Errorf(output)
		updateMachineServiceStatus(machine, service, fmt.Sprintf("Build: Error: %s", output))
	}
	return err
}

func doDeploy(machine *Machine, service *Service) error {
	updateMachineServiceStatus(machine, service, "Deploy: Running")

	command := fmt.Sprintf("cd C:/github_repos/%s && go test -run TestDeploy ./oss/conf.go ./oss/deploy.go ./oss/deploy_test.go ./oss/oss.go", service.Name)
	output := machine.runCommand(command)

	var err error
	if strings.HasPrefix(output, "ok") {
		err = nil
		updateMachineServiceStatus(machine, service, "Deploy: Done")
	} else {
		err = fmt.Errorf(output)
		updateMachineServiceStatus(machine, service, fmt.Sprintf("Deploy: Error: %s", output))
	}
	return err
}

func syncMachine(machine *Machine) {
	batNameMap := getBatInfo(machine)
	for _, service := range machine.Services {
		doPull(machine, service)
		doBuild(machine, service)
		doDeploy(machine, service)

		if _, ok := batNameMap[service.Name]; ok {
			service.Status = "Running"
		} else {
			service.Status = "Stopped"
		}
	}

	updateMachine(machine.Owner, machine.Name, machine)
}
