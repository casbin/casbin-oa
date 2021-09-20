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

	"github.com/casbin/casbin-oa/object"
	"github.com/casbin/casbin-oa/util"
	"github.com/google/go-github/v38/github"
)

func (c *ApiController) IssueOpen() {
	var issueEvent github.IssuesEvent
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &issueEvent)
	if err != nil {
		panic(err)
	}

	if issueEvent.GetAction() != "opened" {
		c.Data["json"] = false
		c.ServeJSON()
		return
	}

	owner, repo := util.GetOwnerAndNameFromId(issueEvent.Repo.GetFullName())
	issueWebhook := object.GetIssueIfExist(owner, repo)

	if issueWebhook != nil {
		issueNumber := issueEvent.Issue.GetNumber()

		label := util.GetIssueLabel(issueEvent.Issue.GetTitle(), issueEvent.Issue.GetBody())
		if label != "" {
			go util.SetIssueLabel(owner, repo, issueNumber, label)
		}

		if issueWebhook.ProjectId != -1 {
			go util.AddIssueToProjectCard(issueWebhook.ProjectId, issueEvent.GetIssue().GetID())
		}

		if issueWebhook.Assignee != "" {
			go util.SetIssueAssignee(owner, repo, issueNumber, issueWebhook.Assignee)

		}

		if len(issueWebhook.AtPeople) != 0 {
			go util.AtPeople(issueWebhook.AtPeople, owner, repo, issueNumber)
		}

	}

	c.Data["json"] = true
	c.ServeJSON()
}

func (c *ApiController) PullRequestOpen() {
	var pullRequestEvent github.PullRequestEvent
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &pullRequestEvent)
	if err != nil {
		panic(err)
	}

	if pullRequestEvent.GetAction() != "opened" {
		c.Data["json"] = false
		c.ServeJSON()
		return
	}
	owner, repo := util.GetOwnerAndNameFromId(pullRequestEvent.Repo.GetFullName())
	issueWebhook := object.GetIssueIfExist(owner, repo)

	result := true
	if issueWebhook != nil {
		reviewers := issueWebhook.Reviewers
		if len(reviewers) != 0 {
			result = util.RequestReviewers(owner, repo, pullRequestEvent.GetNumber(), reviewers)
		}
	}

	c.Data["json"] = result
	c.ServeJSON()
}
