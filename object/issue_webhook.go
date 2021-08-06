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

type IssueWebhook struct {
	Name        string   `xorm:"varchar(100) notnull pk" json:"name"`
	Org         string   `xorm:"varchar(100)" json:"org"`
	Repo        string   `xorm:"varchar(100)"  json:"repo"`
	Assignee    string   `xorm:"varchar(1000)" json:"assignee"`
	ProjectName string   `xorm:"varchar(1000)" json:"project_name"`
	ProjectId   int64    `xorm:"varchar(100)"  json:"project_id"`
	AtPeople    []string `xorm:"varchar(1000)" json:"at_people"`
	Url         string   `xorm:"varchar(1000)" json:"url"`
}

func GetIssueWebhooks() []*IssueWebhook {
	issueWebhooks := []*IssueWebhook{}
	err := adapter.Engine.Find(&issueWebhooks)
	if err != nil {
		panic(err)
	}

	return issueWebhooks
}

func GetIssueWebhookByName(name string) *IssueWebhook {

	issueWebhook := IssueWebhook{Name: name}
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

func GetIssueWebhookByOrgAndRepo(org string, repo string) *IssueWebhook {
	var existed bool
	var err error
	var issueWebhook IssueWebhook
	if repo != "" {
		issueWebhook = IssueWebhook{Org: org, Repo: repo}
		existed, err = adapter.Engine.Get(&issueWebhook)
	} else {
		issueWebhook = IssueWebhook{Org: org}
		existed, err = adapter.Engine.Where("repo = '' ").Get(&issueWebhook)
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

func AddIssueWebHook(issueWebhook *IssueWebhook) bool {
	affected, err := adapter.Engine.Insert(issueWebhook)
	if err != nil {
		panic(err)
	}

	return affected != 0
}

func UpdateIssueWebHook(name string, issueWebhook *IssueWebhook) bool {
	if GetIssueWebhookByName(name) == nil {
		return false
	}

	_, err := adapter.Engine.Id(core.PK{name}).AllCols().Update(issueWebhook)
	if err != nil {
		panic(err)
	}

	return true
}

func DeleteIssueWebHook(issueWebhook *IssueWebhook) bool {
	affected, err := adapter.Engine.Id(core.PK{issueWebhook.Org, issueWebhook.Repo}).Delete(&IssueWebhook{})
	if err != nil {
		panic(err)
	}

	return affected != 0
}
