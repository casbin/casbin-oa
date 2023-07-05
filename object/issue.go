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

type Issue struct {
	Name        string   `xorm:"varchar(100) notnull pk" json:"name"`
	Org         string   `xorm:"varchar(100)" json:"org"`
	Repo        string   `xorm:"varchar(100)"  json:"repo"`
	Assignee    string   `xorm:"varchar(1000)" json:"assignee"`
	ProjectName string   `xorm:"varchar(1000)" json:"project_name"`
	ProjectId   int64    `xorm:"varchar(100)"  json:"project_id"`
	AtPeople    []string `xorm:"varchar(1000)" json:"at_people"`
	Reviewers   []string `xorm:"varchar(1000)" json:"reviewers"`
}
/*
GetIssues 函数用于获取所有的问题，它通过调用 adapter.Engine.Find 方法从数据库中查询所有的问题，并将结果存储在 issueWebhooks 切片中返回。
*/
func GetIssues() []*Issue {
	issueWebhooks := []*Issue{}
	err := adapter.Engine.Find(&issueWebhooks)
	if err != nil {
		panic(err)
	}

	return issueWebhooks
}
/*
GetIssueByName 函数根据问题名称获取问题，它通过创建一个 Issue 对象。
并调用 adapter.Engine.Get 方法从数据库中查询指定名称的问题。如果问题存在，则返回该问题的指针，否则返回 nil。
*/
func GetIssueByName(name string) *Issue {

	issueWebhook := Issue{Name: name}
	existed, err := adapter.Engine.Get(&issueWebhook)
	if err != nil {
		panic(err)
	}
	if existed {
		return &issueWebhook
	} else {
		return nil
	}
}
/*
函数根据组织和仓库获取问题，它根据传入的组织和仓库参数创建一个 Issue 对象，并调用 adapter.Engine.Get 方法从数据库中查询指定组织和仓库的问题。
如果问题存在，则返回该问题的指针，否则返回 nil。如果仓库参数为 "All"，则查询组织下的所有问题。
*/
func GetIssueByOrgAndRepo(org string, repo string) *Issue {
	var existed bool
	var err error
	var issueWebhook Issue
	if repo != "All" {
		issueWebhook = Issue{Org: org, Repo: repo}
		existed, err = adapter.Engine.Get(&issueWebhook)
	} else {
		issueWebhook = Issue{Org: org}
		existed, err = adapter.Engine.Where("repo = 'All' ").Get(&issueWebhook)
	}

	if err != nil {
		panic(err)
	}
	if existed {
		return &issueWebhook
	} else {
		return nil
	}
}
/*
函数根据 owner（组织）和 repo（仓库）获取问题，它首先调用 GetIssueByOrgAndRepo 函数根据 owner 和 repo 获取问题，
如果问题不存在，则再次调用 GetIssueByOrgAndRepo 函数根据 owner 和 "All" 获取问题。最终返回问题的指针
*/
func GetIssueIfExist(owner string, repo string) *Issue {
	issueWebhook := GetIssueByOrgAndRepo(owner, repo)

	if issueWebhook == nil {
		issueWebhook = GetIssueByOrgAndRepo(owner, "All")
	}

	return issueWebhook
}

func AddIssue(issueWebhook *Issue) bool {
	affected, err := adapter.Engine.Insert(issueWebhook)
	if err != nil {
		panic(err)
	}

	return affected != 0
}
/*
函数用于添加问题，它通过调用 adapter.Engine.Insert 方法将问题插入到数据库中。如果插入成功，则返回 true，否则返回 false。
*/
func UpdateIssue(name string, issueWebhook *Issue) bool {
	if GetIssueByName(name) == nil {
		return false
	}

	_, err := adapter.Engine.ID(core.PK{name}).AllCols().Update(issueWebhook)
	if err != nil {
		panic(err)
	}

	return true
}
/*
函数用于删除问题，它通过调用 adapter.Engine.Delete 方法从数据库中删除指定问题。如果删除成功，则返回 true，否则返回 false。
*/
func DeleteIssue(issueWebhook *Issue) bool {
	affected, err := adapter.Engine.ID(core.PK{issueWebhook.Name}).Delete(&Issue{})
	if err != nil {
		panic(err)
	}

	return affected != 0
}
/*
函数用于获取所有的组织，它通过调用 adapter.Engine.Select 方法查询所有的问题，并通过 GroupBy 方法对组织进行分组。最终将组织名称存储在 orgs 切片中返回。
*/
func GetWebhookOrgs() []string {
	issues := []*Issue{}
	var orgs []string
	err := adapter.Engine.Select("org").GroupBy("org").Find(&issues)
	if err != nil {
		panic(err)
	}

	for i := 0; i < len(issues); i++ {
		orgs = append(orgs, issues[i].Org)
	}

	return orgs
}
