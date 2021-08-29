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

package controllers

import (
	"encoding/json"
	"fmt"

	"github.com/casbin/casbin-oa/object"
	"github.com/casbin/casbin-oa/util"
	"github.com/google/go-github/v38/github"
)

func (c *ApiController) Webhook() {
	var pushEvent github.WebHookPayload
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &pushEvent)
	if err != nil {
		panic(err)
	}

	if pushEvent.GetRef() != "" {
		c.Data["json"] = PushEventStart(pushEvent)
	} else {
		var issueEvent github.IssuesEvent
		err = json.Unmarshal(c.Ctx.Input.RequestBody, &issueEvent)
		if err != nil {
			panic(err)
		}
		c.Data["json"] = IssueEventStart(issueEvent)
	}

	c.ServeJSON()
}

func PushEventStart(pushEvent github.WebHookPayload) bool {
	org, repo := util.GetOwnerAndNameFromId(pushEvent.Repo.GetFullName())
	cd := object.GetCDByOrgAndRepo(org, repo)

	if cd == nil {
		return false
	}

	fmt.Println(cd.Path)
	util.CD(cd.Path)
	return true

}

func IssueEventStart(issueEvent github.IssuesEvent) bool {
	if issueEvent.GetAction() != "opened" {
		return false
	}

	org, repo := util.GetOwnerAndNameFromId(issueEvent.Repo.GetFullName())
	issueWebhook := object.GetIssueByOrgAndRepo(org, repo)

	if issueWebhook == nil {
		issueWebhook = object.GetIssueByOrgAndRepo(org, "All")
	}

	if issueWebhook != nil {
		issueNumber := issueEvent.Issue.GetNumber()

		label := util.GetIssueLabel(issueEvent.Issue.GetTitle(), issueEvent.Issue.GetBody())
		if label != "" {
			go util.SetIssueLabel(org, repo, issueNumber, label)
		}

		if issueWebhook.ProjectId != -1 {
			go util.AddIssueToProjectCard(issueWebhook.ProjectId, issueEvent.GetIssue().GetID())
		}

		if issueWebhook.Assignee != "" {
			go util.SetIssueAssignee(org, repo, issueNumber, issueWebhook.Assignee)

		}

		if len(issueWebhook.AtPeople) != 0 {
			go util.AtPeople(issueWebhook.AtPeople, org, repo, issueNumber)
		}

	}
	return true
}
