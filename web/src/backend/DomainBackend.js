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

import * as Setting from "../Setting";

export function getDomains(owner) {
  return fetch(`${Setting.ServerUrl}/api/get-domains?owner=${owner}`, {
    method: "GET",
    credentials: "include"
  }).then(res => res.json());
}

export function getDomain(owner, name) {
  return fetch(`${Setting.ServerUrl}/api/get-domain?id=${owner}/${encodeURIComponent(name)}`, {
    method: "GET",
    credentials: "include"
  }).then(res => res.json());
}

export function updateDomain(owner, name, domain) {
  let newDomain = Setting.deepCopy(domain);
  return fetch(`${Setting.ServerUrl}/api/update-domain?id=${owner}/${encodeURIComponent(name)}`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(newDomain),
  }).then(res => res.json());
}

export function addDomain(domain) {
  let newDomain = Setting.deepCopy(domain);
  return fetch(`${Setting.ServerUrl}/api/add-domain`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(newDomain),
  }).then(res => res.json());
}

export function deleteDomain(domain) {
  let newDomain = Setting.deepCopy(domain);
  return fetch(`${Setting.ServerUrl}/api/delete-domain`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(newDomain),
  }).then(res => res.json());
}
