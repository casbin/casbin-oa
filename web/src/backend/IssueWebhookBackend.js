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

import * as Setting from "../Setting";

export function getIssueWebhooks() {
    return fetch(`${Setting.ServerUrl}/api/get-issue-webhooks`, {
        method: "GET",
        credentials: "include"
    }).then(res => res.json());
}

export function getIssueWebhook(name) {
    return fetch(`${Setting.ServerUrl}/api/get-filtered-issue-webhook?name=${name}`, {
        method: "Get",
        credentials: "include"
    }).then(res => res.json())
}

export function addIssueWebhook(issueWebhook) {
    let newIssueWebhook = Setting.deepCopy(issueWebhook);
    return fetch(`${Setting.ServerUrl}/api/add-issue-webhook`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(newIssueWebhook),
    }).then(res => res.json());
}

export function updateIssueWebhook(name, issueWebhook) {
    let newIssueWebhook = Setting.deepCopy(issueWebhook);
    return fetch(`${Setting.ServerUrl}/api/update-issue-webhook?name=${name}`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(newIssueWebhook),
    }).then(res => res.json());
}

export function deleteIssueWebhook(issueWebhook) {
    let newIssueWebhook = Setting.deepCopy(issueWebhook);
    return fetch(`${Setting.ServerUrl}/api/delete-issue-webhook`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(newIssueWebhook),
    }).then(res => res.json());
}

export function getProjectColumns() {
    return fetch(`${Setting.ServerUrl}/api/get-project-columns`,{
        method: 'Get',
        credentials: 'include',
    }).then(res => res.json());
}

export function getAvatarByUsername(username){
    return fetch(`${Setting.ServerUrl}/api/get-github-user?username=${username}`,{
        method: 'Get',
        credentials: `include`
    }).then(res => res.json());
}