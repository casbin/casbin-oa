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

import "github.com/google/go-github/v38/github"

type PayLoad struct {
	Review      github.PullRequestReview  `json:"review"`
	PullRequest github.PullRequest        `json:"pull_request"`
	Issue       github.Issue              `json:"issue"`
	Comment     github.PullRequestComment `json:"comment"`
}
