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

export function getRounds(owner) {
  return fetch(`${Setting.ServerUrl}/api/get-rounds?owner=${owner}`, {
    method: "GET",
    credentials: "include"
  }).then(res => res.json());
}

export function getFilteredRounds(owner, program) {
  return fetch(`${Setting.ServerUrl}/api/get-filtered-rounds?owner=${owner}&program=${program}`, {
    method: "GET",
    credentials: "include"
  }).then(res => res.json());
}

export function getRound(owner, name) {
  return fetch(`${Setting.ServerUrl}/api/get-round?id=${owner}/${encodeURIComponent(name)}`, {
    method: "GET",
    credentials: "include"
  }).then(res => res.json());
}

export function updateRound(owner, name, round) {
  let newRound = Setting.deepCopy(round);
  return fetch(`${Setting.ServerUrl}/api/update-round?id=${owner}/${encodeURIComponent(name)}`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(newRound),
  }).then(res => res.json());
}

export function addRound(round) {
  let newRound = Setting.deepCopy(round);
  return fetch(`${Setting.ServerUrl}/api/add-round`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(newRound),
  }).then(res => res.json());
}

export function deleteRound(round) {
  let newRound = Setting.deepCopy(round);
  return fetch(`${Setting.ServerUrl}/api/delete-round`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(newRound),
  }).then(res => res.json());
}
