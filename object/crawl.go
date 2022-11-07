// Copyright 2022 The casbin Authors. All Rights Reserved.
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
	"regexp"
	"strings"
	"time"

	"github.com/casbin/casbin-oa/util"
	"github.com/chromedp/chromedp"
)

var reTitle *regexp.Regexp
var reMember *regexp.Regexp

type TopicInfo struct {
	IsHit  bool   `json:"isHit"`
	Title  string `json:"title"`
	Member string `json:"member"`
}

func init() {
	reTitle = regexp.MustCompile(`"topic-link">(.*?)</a>`)
	reMember = regexp.MustCompile(`/member/(.*?)"`)
}

func getPage(url string) []string {
	ctx, cancel := getContext()
	defer cancel()

	var topic1 string
	var topic2 string

	err := chromedp.Run(ctx,
		chromedp.Navigate(url),

		chromedp.Sleep(1*time.Second),
		chromedp.OuterHTML(`//*[@id="Main"]/div[2]/div[3]`, &topic1),
		chromedp.OuterHTML(`//*[@id="Main"]/div[2]/div[4]`, &topic2),
		//chromedp.Sleep(1*time.Second),
	)
	if err != nil {
		panic(err)
	}

	res := []string{topic1, topic2}
	return res
}

func parseTopicInfo(s string) *TopicInfo {
	isHit := false
	if strings.Contains(s, "background") {
		isHit = true
	}

	title := ""
	m := reTitle.FindStringSubmatch(s)
	if m != nil {
		title = m[1]
	}

	member := ""
	m = reMember.FindStringSubmatch(s)
	if m != nil {
		member = m[1]
	}

	res := &TopicInfo{
		IsHit:  isHit,
		Title:  title,
		Member: member,
	}
	return res
}

func updateTopicString() {
	ss := getPage(Url)

	topicInfos := []*TopicInfo{}
	for _, s := range ss {
		topicInfo := parseTopicInfo(s)
		if !topicInfo.IsHit {
			continue
		}

		//fmt.Printf("%s: %v\n", util.GetCurrentTime(), topicInfo)
		topicInfos = append(topicInfos, topicInfo)
	}

	if len(topicInfos) == 0 {
		fmt.Printf("%s: <empty>\n", util.GetCurrentTime())
		return
	}

	now := time.Now()
	roundName := fmt.Sprintf("%s-%s", ProgramName, now.Format("2006-01-02"))
	studentName := strings.ReplaceAll(now.Format("15:04"), ":", "-")

	report := &Report{
		Owner:       "admin",
		Name:        fmt.Sprintf("report_%s_%s_%s", ProgramName, roundName, studentName),
		CreatedTime: util.GetCurrentTime(),
		Program:     ProgramName,
		Round:       roundName,
		Student:     studentName,
		Mentor:      "",
		Text:        util.StructToJson(topicInfos),
		Score:       len(topicInfos),
		Events:      []*Event{},
	}

	AddReport(report)
	fmt.Printf("%v\n", report)
}
