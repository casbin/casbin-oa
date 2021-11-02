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

package cloud

import (
	"fmt"
	"strings"

	"github.com/aliyun/alibaba-cloud-sdk-go/sdk/requests"
	"github.com/aliyun/alibaba-cloud-sdk-go/services/ecs"
)

func GetInstances() []ecs.Instance {
	r := ecs.CreateDescribeInstancesRequest()
	r.InstanceChargeType = "PostPaid"
	r.PageSize = requests.NewInteger(100)
	r.PageNumber = requests.NewInteger(1)

	resp, err := ecsClient.DescribeInstances(r)
	if err != nil {
		panic(err)
	}

	instances := resp.Instances.Instance
	res := []ecs.Instance{}
	for _, instance := range instances {
		if strings.HasPrefix(instance.InstanceName, "auto") {
			res = append(res, instance)
		}
	}

	return res
}

func AddInstance(instanceName string) {
	r := ecs.CreateRunInstancesRequest()
	r.LaunchTemplateName = "auto"

	resp, err := ecsClient.RunInstances(r)
	if err != nil {
		panic(err)
	}

	instanceId := resp.InstanceIdSets.InstanceIdSet[0]

	renameInstance(instanceId, instanceName)
	AddServerToSlb(instanceId, 9095)

	fmt.Printf("1 instance added, name = %s\n", instanceName)
}

func renameInstance(instanceId string, instanceName string) {
	r := ecs.CreateModifyInstanceAttributeRequest()
	r.InstanceId = instanceId
	r.InstanceName = instanceName

	for i := 0; i < 100; i++ {
		_, err := ecsClient.ModifyInstanceAttribute(r)
		if err != nil {
			continue
		}
		break
	}

	fmt.Printf("instance: %s renamed to: %s\n", instanceId, instanceName)
}

func DeleteInstance(instanceId string, instanceName string) {
	r := ecs.CreateDeleteInstancesRequest()
	r.InstanceId = &[]string{instanceId}
	r.Force = requests.NewBoolean(true)

	_, err := ecsClient.DeleteInstances(r)
	if err != nil {
		panic(err)
	}

	fmt.Printf("1 instance deleted, name = %s\n", instanceName)
}
