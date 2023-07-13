// Copyright 2022 The Casdoor Authors. All Rights Reserved.
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
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	_ "github.com/go-sql-driver/mysql"
	"github.com/go-xorm/xorm"
	"xorm.io/core"
	"golang.org/x/oauth2"
	"github.com/casbin/casbin-oa/util"
)

type Repo struct {
	Name string `json:"name" xorm:"varchar(100) notnull pk"`
}

type JSONTask struct {
	Name         string      `json:"name"`
	Org          string      `json:"org"`
	Repo         string      `json:"repo"`
	Number       int32       `json:"number"`
	Assignee     Assignee    `json:"assignee"`
	Title        string      `json:"title"`
	Labels       []Label     `json:"labels"`
	State        string      `json:"state"`
	Pull_request PullRequest `json:"pull_request"`
}

type PullRequest struct {
	URL string `json:"url"`
}

type Task struct {
	Name        string   `xorm:"varchar(100) notnull pk" json:"name"`
	Org         string   `xorm:"varchar(100)" json:"org"`
	Repo        string   `xorm:"varchar(100)" json:"repo"`
	Number      int32    `xorm:"int" json:"number"`
	Assignee    string   `xorm:"varchar(100)" json:"assignee"`
	Title       string   `xorm:"varchar(500)" json:"title"`
	Labels      []string `xorm:"json" json:"labels"`
	Status      string   `xorm:"varchar(100)" json:"status"`
	PullRequest string   `xorm:"text" json:"pull_request"`
}

type Assignee struct {
	Login string `json:"login"`
}

type Label struct {
	Name string `json:"name"`
}

// get JSONTask by org and repo
func GetJSONTaskByOrganizationAndRepo(organization string, repo *Repo) []*JSONTask {
	client := GetHttpClient()

	url := fmt.Sprintf("https://api.github.com/repos/%s/%s/issues", organization, repo.Name)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		panic(err)
	}

	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	var tasks []*JSONTask
	err = json.NewDecoder(resp.Body).Decode(&tasks)
	if err != nil {
		panic(err)
	}

	for i := range tasks {
		tasks[i].Repo = repo.Name
		tasks[i].Org = organization
		tasks[i].Name = fmt.Sprintf("%s/%s/%v", organization, repo.Name, tasks[i].Number)
		// 根据实际情况对 PullRequests 进行赋值
		//tasks[i].PullRequests = []string{}
	}

	return tasks
}

// get repo by org
func GetRepoByOrganization(organization string) []*Repo {
	client := GetHttpClient()

	url := fmt.Sprintf("https://api.github.com/users/%s/repos", organization)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		panic(err)
	}

	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	var repos []*Repo
	err = json.NewDecoder(resp.Body).Decode(&repos)
	if err != nil {
		panic(err)
	}

	return repos
}

// get task from org
func GetTasksByOrganization(organization string) []*Task {
	repoList := GetRepoByOrganization(organization)

	var tasks []*Task
	for _, repo := range repoList {
		repoTasks := GetJSONTaskByOrganizationAndRepo(organization, repo)
		for _, jsonTask := range repoTasks {
			labels := make([]string, len(jsonTask.Labels))
			for i, label := range jsonTask.Labels {
				labels[i] = label.Name
			}

			task := &Task{
				Name:        jsonTask.Name,
				Org:         jsonTask.Org,
				Repo:        jsonTask.Repo,
				Number:      jsonTask.Number,
				Assignee:    jsonTask.Assignee.Login,
				Title:       jsonTask.Title,
				Labels:      labels,
				Status:      jsonTask.State,
				PullRequest: jsonTask.Pull_request.URL,
			}
			tasks = append(tasks, task)
		}
	}
	return tasks
}

// get all tasks
func GetTasks() []*Task {
	var tasks []*Task
	tasks = append(tasks, GetTasksByOrganization("casbin")...)
	tasks = append(tasks, GetTasksByOrganization("casdoor")...)
	return tasks
}

// 从github上拉取然后insert进数据库
func inserting() {
	tasks := GetTasks()

	err = adapter.Engine.Sync2(new(Task))
	if err != nil {
		fmt.Println("Error syncing table:", err)
		return
	}
	session := adapter.Engine.NewSession()
	defer session.Close()

	for _, task := range tasks {
		_, err := session.Insert(task)
		if err != nil {
			fmt.Println("Error inserting task:", err)
			return
		}
	}
	err = session.Commit()
	if err != nil {
		fmt.Println("Error committing transaction:", err)
		return
	}
}

//与数据库交互部分
func AddTasktodb(taskWebhook *Task) bool {
	affected, err := adapter.Engine.Insert(taskWebhook)
	if err != nil {
		panic(err)
	}

	return affected != 0
}

func Gettasksfromdb() []*Task {
	taskWebhooks := []*Task{}
	err := adapter.Engine.Find(&taskWebhooks)
	if err != nil {
		panic(err)
	}

	return taskWebhooks
}

func GettaskByNamefromdb(name string) *Task {
	taskWebhook := Task{Name: name}
	existed, err := adapter.Engine.Get(&taskWebhook)
	if err != nil {
		panic(err)
	}
	if existed {
		return &taskWebhook
	} else {
		return nil
	}
}

func GettaskByOrgAndRepofromdb(org string, repo string) *Task {
	var existed bool
	var err error
	var taskWebhook Task
	if repo != "All" {
		taskWebhook = Task{Org: org, Repo: repo}
		existed, err = adapter.Engine.Get(&taskWebhook)
	} else {
		taskWebhook = Issue{Org: org}
		existed, err = adapter.Engine.Where("repo = 'All' ").Get(&taskWebhook)
	}

	if err != nil {
		panic(err)
	}
	if existed {
		return &taskWebhook
	} else {
		return nil
	}
}