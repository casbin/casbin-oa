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

package casdoor

import "github.com/casdoor/casdoor-go-sdk/casdoorsdk"


/*
创建一个空的用户数组 users，用于存储从数据库中检索到的用户信息。
使用 adapter.Engine.Desc("created_time").Find() 方法从数据库中检索用户信息。
这里使用了 Casdoor Go SDK 提供的 User 结构作为查询条件，根据组织名称和应用程序名称进行筛选，并按照创建时间降序排序。
*/
func getUsers() []*casdoorsdk.User {
	owner := CasdoorOrganization
	application := CasdoorApplication

	if adapter == nil {
		panic("casdoor adapter is nil")
	}

	users := []*casdoorsdk.User{}
	err := adapter.Engine.Desc("created_time").Find(&users, &casdoorsdk.User{Owner: owner, SignupApplication: application})
	if err != nil {
		panic(err)
	}

	return users
}
