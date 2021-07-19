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
	"github.com/astaxie/beego"
	"github.com/casbin/casbin-oa/util"
	"github.com/google/go-github/v37/github"
)

type OrgRepositories struct {
	Organization string   `json:"organization"`
	Repositories []string `json:"repositories"`
}

func GetRepositoryByOrganization(org string) OrgRepositories {
	client := util.GetClient()
	options := github.RepositoryListByOrgOptions{Sort: "pushed", ListOptions: github.ListOptions{PerPage: 100}}
	lists, _, err := client.Repositories.ListByOrg(context.Background(), org, &options)

	if err != nil {
		panic(err)
	}

	var repositories []string

	for i := range lists {
		repositories = append(repositories, *lists[i].Name)
	}
	return OrgRepositories{Organization: org, Repositories: repositories}
}

func getDefaultOrg() map[string]bool {

	defaultOrgMap := make(map[string]bool)
	organizations := beego.AppConfig.Strings("defaultOrg")
	for i := range organizations {
		defaultOrgMap[organizations[i]] = true
	}
	return defaultOrgMap
}
