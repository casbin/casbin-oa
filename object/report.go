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

	"github.com/astaxie/beego"
	"github.com/casbin/casbin-oa/casdoor"
	"github.com/casbin/casbin-oa/util"
	"github.com/mileusna/crontab"
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

	_, err := adapter.Engine.ID(core.PK{owner, name}).AllCols().Update(report)
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
	affected, err := adapter.Engine.ID(core.PK{report.Owner, report.Name}).Delete(&Report{})
	if err != nil {
		panic(err)
	}

	return affected != 0
}

func GetReportTextByEvents(events []*Event) string {
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
		CodeReviewText = "# CodeReview: \n empty"
	} else {
		CodeReviewText = "# CodeReview: \n | Day | Repo | URL \n | :--: | :--: | :-------: | \n"
		for i := range CodeReviewEvents {
			curEvent := CodeReviewEvents[i]
			CodeReviewText = fmt.Sprintf("%s| %s | %s <img width=20> | <a href = %s target=_blank> %s </a> | \n",
				CodeReviewText, curEvent.CreateAt, curEvent.RepoName, curEvent.HtmlURL, curEvent.HtmlURL)
		}
	}

	return fmt.Sprintf("%s\n%s\n%s\n%s\n%s\n%s\n%s", "<!--PR_TABLE_START-->", "***\n", PRsText, IssuesCommentText, CodeReviewText, "\n***", "<!--PR_TABLE_END-->")
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
	splitsArr := strings.Split(text, "<!--PR_TABLE_START-->")

	if text == "" {
		report.Text = GetReportTextByEvents(events)
	} else if len(splitsArr) == 1 {
		report.Text = fmt.Sprintf("%s\n%s", text, GetReportTextByEvents(events))
	} else {
		afterSplits := strings.Split(text, "<!--PR_TABLE_END-->")
		if len(splitsArr[0]) == 0 {
			report.Text = fmt.Sprintf("%s%s", GetReportTextByEvents(events), afterSplits[1])
		} else {
			report.Text = fmt.Sprintf("%s%s%s", splitsArr[0], GetReportTextByEvents(events), afterSplits[1])
		}

	}

	if UpdateReport(id, report) {
		return report.Text
	}
	return ""
}

func TimingAutoUpdate() {
	fmt.Println("TimingAutoUpdate Start!")
	owner := beego.AppConfig.String("defaultOwner")
	program := beego.AppConfig.String("defaultProgram")
	round := GetLateRound(owner, program)
	fmt.Println("The latest round")
	fmt.Println(round)
	if round == nil {
		return
	}

	layout := "2006-01-02"
	startDate, _ := time.ParseInLocation(layout, round.StartDate, time.UTC)
	endDate, _ := time.ParseInLocation(layout, round.EndDate, time.UTC)

	students := GetFilteredStudents(owner, program)
	users := casdoor.GetUsers()
	studentGithubMap := GetStudentGithubMap(students, users)

	for i := range students {
		curStudent := students[i]
		id := fmt.Sprintf("%s/report_%s_%s_%s", owner, program, round.Name, curStudent.Name)
		if GetReport(id) == nil {
			AddReport(GetNewReport(round.Name, *curStudent))
		}

		githubUserName, ok := studentGithubMap[curStudent.Name]
		if ok && githubUserName != "" {
			fmt.Printf("update %s report", githubUserName)
			go AutoUpdateReportText(id, githubUserName, startDate, endDate, *curStudent)
		}

	}
}

func GetNewReport(roundName string, student Student) *Report {
	owner := beego.AppConfig.String("defaultOwner")
	program := beego.AppConfig.String("defaultProgram")
	name := fmt.Sprintf("report_%s_%s_%s", program, roundName, student.Name)
	createdTime := time.Now().Format("2006-01-02 15:04:05")
	round := roundName
	studentName := student.Name
	mentor := student.Mentor
	text := ""
	score := -1

	return &Report{Owner: owner, Program: program, Name: name, CreatedTime: createdTime, Round: round, Student: studentName, Mentor: mentor, Text: text, Score: score}
}

func RegularUpdate() {
	ctab := crontab.New()
	ctab.MustAddJob("0 2 * * *", TimingAutoUpdate)
}
