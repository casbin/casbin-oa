// Copyright 2020 The casbin Authors. All Rights Reserved.
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
	"strings"
	"time"

	"github.com/casbin/casbin-oa/util"
	"xorm.io/core"
)

type Report struct {
	Owner       string `xorm:"varchar(100) notnull pk" json:"owner"`
	Name        string `xorm:"varchar(100) notnull pk" json:"name"`
	CreatedTime string `xorm:"varchar(100)" json:"createdTime"`

	Program string   `xorm:"varchar(100)" json:"program"`
	Round   string   `xorm:"varchar(100)" json:"round"`
	Student string   `xorm:"varchar(100)" json:"student"`
	Mentor  string   `xorm:"varchar(100)" json:"mentor"`
	Text    string   `xorm:"mediumtext" json:"text"`
	Score   int      `json:"score"`
	Events  []*Event `json:"events"`
}

func GetReports(owner string) []*Report {
	reports := []*Report{}
	err := adapter.Engine.Desc("created_time").Find(&reports, &Report{Owner: owner})
	if err != nil {
		panic(err)
	}

	return reports
}

func GetFilteredReports(owner string, program string) []*Report {
	reports := []*Report{}
	err := adapter.Engine.Desc("created_time").Find(&reports, &Report{Owner: owner, Program: program})
	if err != nil {
		panic(err)
	}

	return reports
}

func getReport(owner string, name string) *Report {
	report := Report{Owner: owner, Name: name}
	existed, err := adapter.Engine.Get(&report)
	if err != nil {
		panic(err)
	}

	if existed {
		return &report
	} else {
		return nil
	}
}

func GetReport(id string) *Report {
	owner, name := util.GetOwnerAndNameFromId(id)
	return getReport(owner, name)
}

func UpdateReport(id string, report *Report) bool {
	owner, name := util.GetOwnerAndNameFromId(id)
	if getReport(owner, name) == nil {
		AddReport(report)
		return true
	}

	_, err := adapter.Engine.Id(core.PK{owner, name}).AllCols().Update(report)
	if err != nil {
		panic(err)
	}

	//return affected != 0
	return true
}

func AddReport(report *Report) bool {
	affected, err := adapter.Engine.Insert(report)
	if err != nil {
		panic(err)
	}

	return affected != 0
}

func DeleteReport(report *Report) bool {
	affected, err := adapter.Engine.Id(core.PK{report.Owner, report.Name}).Delete(&Report{})
	if err != nil {
		panic(err)
	}

	return affected != 0
}

func GetReportTextByEvents(events []*Event) string {

	if len(events) == 0 {
		return ""
	}

	var PREvents []*Event
	var IssueCommentEvents []*Event
	var CodeReviewEvents []*Event

	for i := len(events) - 1; i >= 0; i-- {
		if events[i].Type == "PR" {
			PREvents = append(PREvents, events[i])
		} else if events[i].Type == "IssueComment" {
			IssueCommentEvents = append(IssueCommentEvents, events[i])
		} else if events[i].Type == "CodeReview" {
			CodeReviewEvents = append(CodeReviewEvents, events[i])
		}
	}

	//`| ${item.create_at} | <a href="${item.html_url}" target="_blank">${item.repo_name}#${item.number}</a> | <img width="20">${item.title}<img width="20">`

	var PRsText string
	if len(PREvents) == 0 {
		PRsText = "# PRs: \n empty \n"
	} else {
		PRsText = "# PRs: \n | Day | Repo | Title | Status | \n | :--: | :------------: | :-------: | \n"
		for i := range PREvents {
			curEvent := PREvents[i]
			PRsText = fmt.Sprintf("%s| %s | <a href=%s target=_blank>%s#%v</a> | <img width=20>%s<img width=20>", PRsText, curEvent.CreateAt, curEvent.HtmlURL,
				curEvent.RepoName, curEvent.Number, curEvent.Title)
			if curEvent.State == "open" {
				PRsText = fmt.Sprintf("%s%s", PRsText, "| ![badge](https://img.shields.io/badge/PR-Open-green?style=for-the-badge&logo=appveyor) | \n")
			} else if curEvent.State == "Draft" {
				PRsText = fmt.Sprintf("%s%s", PRsText, "| ![badge](https://img.shields.io/badge/PR-Draft-gray?style=for-the-badge&logo=appveyor) | \n")
			} else if curEvent.State == "Merged" {
				PRsText = fmt.Sprintf("%s%s", PRsText, "| ![badge](https://img.shields.io/badge/PR-Merged-blueviolet?style=for-the-badge&logo=appveyor) | \n")
			} else {
				PRsText = fmt.Sprintf("%s%s", PRsText, "| ![badge](https://img.shields.io/badge/PR-Close-red?style=for-the-badge&logo=appveyor) | \n")
			}
		}
	}

	var IssuesCommentText string

	if len(IssueCommentEvents) == 0 {
		IssuesCommentText = "# Issues: \n empty \n"
	} else {
		IssuesCommentText = "# Issues: \n | Day | Repo | Content \n | :--: | :--: | :-------: | \n"
		for i := range IssueCommentEvents {
			curEvent := IssueCommentEvents[i]
			IssuesCommentText = fmt.Sprintf("%s| %s | <a href=%s target=_blank>%s#%v</a> | <img width=20> %s | \n",
				IssuesCommentText, curEvent.CreateAt, curEvent.HtmlURL, curEvent.RepoName, curEvent.Number, curEvent.Title)
		}
	}

	var CodeReviewText string

	if len(CodeReviewEvents) == 0 {
		CodeReviewText = "# CodeReview: \n empty \n"
	} else {
		CodeReviewText = "# CodeReview: \n | Day | Repo | URL \n | :--: | :--: | :-------: | \n"
		for i := range CodeReviewEvents {
			curEvent := CodeReviewEvents[i]
			CodeReviewText = fmt.Sprintf("%s| %s | %s <img width=20> | <a href = %s target=_blank> %s </a> | \n",
				CodeReviewText, curEvent.CreateAt, curEvent.RepoName, curEvent.HtmlURL, curEvent.HtmlURL)
		}
	}

	return fmt.Sprintf("%s\n%s\n%s", PRsText, IssuesCommentText, CodeReviewText)
}

func AutoUpdateReportText(id string, author string, startDate time.Time, endDate time.Time, student Student) string {
	orgAndRepositories := student.OrgRepositories
	orgOrRepoMap := getDefaultOrg()
	for i := range orgAndRepositories {
		org := orgAndRepositories[i].Organization
		repositories := orgAndRepositories[i].Repositories

		for j := range repositories {
			fullName := fmt.Sprintf("%s/%s", org, repositories[j])
			orgOrRepoMap[fullName] = true
		}
	}

	report := GetReport(id)

	events := GetEvents(author, orgOrRepoMap, startDate, endDate)
	report.Events = events
	text := report.Text
	textByEvents := GetReportTextByEvents(events)

	if textByEvents == "" {
		return ""
	}

	splitsArr := strings.Split(text, "\n***\n")
	if len(splitsArr) == 0 || text == "" {
		report.Text = fmt.Sprintf("%s \n***\n %s", report.Text, GetReportTextByEvents(events))
	} else {
		report.Text = fmt.Sprintf("%s \n***\n %s", splitsArr[0], GetReportTextByEvents(events))
	}

	if UpdateReport(id, report) {
		return report.Text
	}
	return ""
}
