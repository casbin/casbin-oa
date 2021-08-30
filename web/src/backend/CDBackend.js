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

export function getCDs() {
    return fetch(`${Setting.ServerUrl}/api/get-cds`, {
        method: "GET",
        credentials: "include"
    }).then(res => res.json());
}

export function getCD(name) {
    return fetch(`${Setting.ServerUrl}/api/get-filtered-cd?name=${name}`, {
        method: "Get",
        credentials: "include"
    }).then(res => res.json())
}

export function addCD(CD) {
    let newIssueWebhook = Setting.deepCopy(CD);
    return fetch(`${Setting.ServerUrl}/api/add-cd`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(newIssueWebhook),
    }).then(res => res.json());
}

export function updateCD(name, CD) {
    let newIssueWebhook = Setting.deepCopy(CD);
    return fetch(`${Setting.ServerUrl}/api/update-cd?name=${name}`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(newIssueWebhook),
    }).then(res => res.json());
}

export function deleteCD(CD) {
    let newIssueWebhook = Setting.deepCopy(CD);
    return fetch(`${Setting.ServerUrl}/api/delete-cd`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(newIssueWebhook),
    }).then(res => res.json());
}