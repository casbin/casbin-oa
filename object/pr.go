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

import (
	"context"
	"github.com/casbin/casbin-oa/util"
	"github.com/google/go-github/v37/github"
	"time"
)

type Pr struct {
	Title    string `json:"title"`
	Author   string `json:"author"`
	HtmlURL  string `json:"html_url"`
	CreateAt string `json:"create_at"`
	State    string `json:"state"`
}

func ListPrs(author string, owner string, repo string, startDate time.Time, endDate time.Time) []*Pr {
	curPage := 1
	client := util.GetClient()
	options := github.PullRequestListOptions{State: "all", ListOptions: github.ListOptions{Page: curPage}}
	list, _, err := client.PullRequests.List(context.Background(), owner, repo, &options)
	if err != nil {
		panic(err)
	}

	var prs []*Pr
	i := 0
	for {
		i++
		if len(list) == 0 {
			return prs
		}
		//All items of the current page are traversed,traverse the next page
		if i > len(list) {
			i = 0
			curPage++
			options = github.PullRequestListOptions{State: "all", ListOptions: github.ListOptions{Page: curPage}}
			list, _, err = client.PullRequests.List(context.Background(), owner, repo, &options)
			if err != nil {
				panic(err)
			}
			continue
		}
		creatTime := *list[i-1].CreatedAt

		//Current Pr' creatTime After than endDate
		if creatTime.After(endDate) {
			continue
		}
		//Current Pr' creatTime Before than startDate,stop traverse,because the next Pr' creatTime also before than startDate
		if creatTime.Before(startDate) {
			return prs
		}

		curPr := list[i-1]
		if *curPr.User.Login == author {

			var state string
			if curPr.MergedAt != nil {
				state = "Merged"
			} else {
				state = *curPr.State
			}
			pr := Pr{Title: *curPr.Title, Author: *curPr.User.Login, HtmlURL: *curPr.HTMLURL, CreateAt: curPr.CreatedAt.Format("2006-01-02 15:04:05"), State: state}
			prs = append(prs, &pr)
		}
	}
	return prs
}
