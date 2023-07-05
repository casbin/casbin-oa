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
/*
这个方法用于处理 GitHub 的 Webhook 请求中的 opened 事件。
声明 issueEvent 和 pullRequestEvent 两个变量，分别表示 github.IssuesEvent 和 github.PullRequestEvent。
通过 json.Unmarshal() 将请求的 JSON 数据解析为 pullRequestEvent。
声明 result 变量用于存储操作结果。
如果 pullRequestEvent 中的 PullRequest 字段不为空，表示是 Pull Request 相关的事件，则调用 PullRequestOpen(pullRequestEvent) 方法处理该事件，并将结果赋值给 result。
否则，通过 json.Unmarshal() 将请求的 JSON 数据解析为 issueEvent。
调用 IssueOpen(issueEvent) 方法处理 Issue 相关的事件，并将结果赋值给 result。
将 result 赋值给 c.Data["json"]。
通过 ServeJSON() 方法将 JSON 格式的结果作为响应返回
*/
func (c *ApiController) WebhookOpen() {
	var issueEvent github.IssuesEvent
	var pullRequestEvent github.PullRequestEvent
	json.Unmarshal(c.Ctx.Input.RequestBody, &pullRequestEvent)

	var result bool
	if pullRequestEvent.PullRequest != nil {
		result = PullRequestOpen(pullRequestEvent)
	} else {
		err := json.Unmarshal(c.Ctx.Input.RequestBody, &issueEvent)
		if err != nil {
			panic(err)
		}
		result = IssueOpen(issueEvent)
	}

	c.Data["json"] = result
	c.ServeJSON()
}
/*
这个函数处理 Issue 相关的 opened 事件。
检查 issueEvent 的操作类型是否为 "opened"，如果不是则返回 false。
从 issueEvent.Repo.GetFullName() 中获取仓库的拥有者和名称。
调用 object.GetIssueIfExist(owner, repo) 获取与该仓库相关的 Webhook 配置信息，存储在 issueWebhook 变量中。
如果 issueWebhook 不为空，则继续执行以下操作：
获取当前 Issue 的编号 issueNumber。
调用 util.GetIssueLabel() 从 Issue 的标题和正文中获取标签。
如果标签不为空，则使用 util.SetIssueLabel() 方法为 Issue 添加标签。
如果 issueWebhook.ProjectId 不为 -1，则使用 util.AddIssueToProjectCard() 方法将 Issue 添加到指定的项目卡片中。
如果 issueWebhook.Assignee 不为空，则使用 util.SetIssueAssignee() 方法指派给指定的用户。
如果 issueWebhook.AtPeople 不为空，则使用 util.AtPeople() 方法在评论中提及指定的用户。
返回 true 表示操作成功。
*/
func IssueOpen(issueEvent github.IssuesEvent) bool {
	if issueEvent.GetAction() != "opened" {
		return false
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
	return true
}
/*
这个函数处理 Pull Request 相关的 opened 事件。
检查 pullRequestEvent 的操作类型是否为 "opened"，如果不是则返回 false。
从 pullRequestEvent.Repo.GetFullName() 中获取仓库的拥有者和名称。
调用 object.GetIssueIfExist(owner, repo) 获取与该仓库相关的 Webhook 配置信息，存储在 issueWebhook 变量中。
如果 issueWebhook 不为空，则继续执行以下操作：
获取需要进行代码审查的人员列表 reviewers。
获取触发事件的发送者的用户名 sender。
如果 reviewers 列表不为空，则进行以下操作：
获取组织成员列表 members。
遍历 reviewers 列表，检查每个人员是否存在于组织成员列表中，如果不存在或者与发送者相同，则将其从 reviewers 列表中删除。
如果 reviewers 列表不为空，则调用 util.RequestReviewers() 方法请求这些人员进行代码审查。
根据 reviewers 列表生成评论内容 commentStr，并调用 util.Comment() 方法在 Pull Request 中发表评论。
返回 true 表示操作成功。
*/
func PullRequestOpen(pullRequestEvent github.PullRequestEvent) bool {
	if pullRequestEvent.GetAction() != "opened" {
		return false
	}
	owner, repo := util.GetOwnerAndNameFromId(pullRequestEvent.Repo.GetFullName())
	issueWebhook := object.GetIssueIfExist(owner, repo)

	if issueWebhook != nil {
		at_people := issueWebhook.AtPeople
		sender := pullRequestEvent.Sender.GetLogin()

		if len(at_people) != 0 {
			members := util.GetOrgMembers(owner)
			for i := 0; i < len(at_people); i++ {
				_, existed := members[at_people[i]]
				if !existed || at_people[i] == sender {
					at_people = append(at_people[:i], at_people[i+1:]...)
					i = i - 1
				}
			}
			if len(at_people) != 0 {
				go util.RequestReviewers(owner, repo, pullRequestEvent.GetNumber(), at_people)

				var commentStr string
				for i := range at_people {
					commentStr = fmt.Sprintf("%s @%s", commentStr, at_people[i])
				}
				commentStr = fmt.Sprintf("%s %s", commentStr, "please review")

				go util.Comment(commentStr, owner, repo, pullRequestEvent.GetNumber())
			}
		}
	}
	return true
}
