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

export function getReports(owner) {
  return fetch(`${Setting.ServerUrl}/api/get-reports?owner=${owner}`, {
    method: "GET",
    credentials: "include"
  }).then(res => res.json());
}

export function getFilteredReports(owner, program) {
  return fetch(`${Setting.ServerUrl}/api/get-filtered-reports?owner=${owner}&program=${program}`, {
    method: "GET",
    credentials: "include"
  }).then(res => res.json());
}

export function getReport(owner, name) {
  return fetch(`${Setting.ServerUrl}/api/get-report?id=${owner}/${encodeURIComponent(name)}`, {
    method: "GET",
    credentials: "include"
  }).then(res => res.json());
}

export function updateReport(owner, name, report) {
  let newReport = Setting.deepCopy(report);
  return fetch(`${Setting.ServerUrl}/api/update-report?id=${owner}/${encodeURIComponent(name)}`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(newReport),
  }).then(res => res.json());
}

export function addReport(report) {
  let newReport = Setting.deepCopy(report);
  return fetch(`${Setting.ServerUrl}/api/add-report`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(newReport),
  }).then(res => res.json());
}

export function deleteReport(report) {
  let newReport = Setting.deepCopy(report);
  return fetch(`${Setting.ServerUrl}/api/delete-report`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(newReport),
  }).then(res => res.json());
}

export function autoUpdateReport(owner, name, student,curRound){
  const githubUsername = student?.properties.oauth_GitHub_username || ""
  if (githubUsername === ""){
    return false
  }
  return fetch(`${Setting.ServerUrl}/api/auto-update-report?id=${owner}/${encodeURIComponent(name)}&startDate=${curRound.startDate}&endDate=${curRound.endDate}&author=${githubUsername}`, {
    method: 'Post',
    credentials: 'include',
    body: JSON.stringify(student)
  }).then(res => res.json());

}
