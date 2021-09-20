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

func GetIssues() []*Issue {
	issueWebhooks := []*Issue{}
	err := adapter.Engine.Find(&issueWebhooks)
	if err != nil {
		panic(err)
	}

	return issueWebhooks
}

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

func UpdateIssue(name string, issueWebhook *Issue) bool {
	if GetIssueByName(name) == nil {
		return false
	}

	_, err := adapter.Engine.Id(core.PK{name}).AllCols().Update(issueWebhook)
	if err != nil {
		panic(err)
	}

	return true
}

func DeleteIssue(issueWebhook *Issue) bool {
	affected, err := adapter.Engine.Id(core.PK{issueWebhook.Name}).Delete(&Issue{})
	if err != nil {
		panic(err)
	}

	return affected != 0
}

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
