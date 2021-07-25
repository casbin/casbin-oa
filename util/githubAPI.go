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

package util

import (
	"context"
	"strings"

	"github.com/astaxie/beego"
	"github.com/google/go-github/v37/github"
	"golang.org/x/oauth2"
)

func GetClient() *github.Client {
	accessToken := beego.AppConfig.String("githubAccessToken")
	if len(accessToken) == 0 {
		return github.NewClient(nil)
	} else {
		ts := oauth2.StaticTokenSource(
			&oauth2.Token{AccessToken: accessToken},
		)
		tc := oauth2.NewClient(context.Background(), ts)
		return github.NewClient(tc)
	}
}

func SetIssueLabel(owner string, repo string, number int, label string) bool {
	client := GetClient()
	issueService := client.Issues
	_, response, err := issueService.AddLabelsToIssue(context.Background(), owner, repo, number, []string{label})

	if err != nil {
		panic(err)
	}
	if response.StatusCode == 200 {
		return true
	}
	return false
}

func SetIssueAssignee(owner string, repo string, number int, assignee string) bool {
	client := GetClient()
	issueService := client.Issues
	_, response, err := issueService.AddAssignees(context.Background(), owner, repo, number, []string{assignee})

	if err != nil {
		panic(err)
	}
	if response.StatusCode == 200 {
		return true
	}
	return false
}

func GetIssueLabel(title string, content string) string {
	title = strings.ToLower(title)
	content = strings.ToLower(content)

	enhancementWords := []string{"make", "support", "add", "allow", "enable", "design", "use", "extract"}
	for i := range enhancementWords {
		if strings.Contains(title, enhancementWords[i]) {
			return "enhancement"
		}
	}

	bugWords := []string{"bug", "wrong", "error", "broken"}
	for i := range bugWords {
		if strings.Contains(title, bugWords[i]) {
			return "bug"
		}
	}
	questionWords := []string{"?", "what", "how", "why"}
	for i := range questionWords {
		if strings.Contains(title, questionWords[i]) || strings.Contains(content, questionWords[i]) {
			return "question"
		}
	}

	return ""
}
