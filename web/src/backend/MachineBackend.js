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

export function getMachines(owner) {
  return fetch(`${Setting.ServerUrl}/api/get-machines?owner=${owner}`, {
    method: "GET",
    credentials: "include"
  }).then(res => res.json());
}

export function getMachine(owner, name) {
  return fetch(`${Setting.ServerUrl}/api/get-machine?id=${owner}/${encodeURIComponent(name)}`, {
    method: "GET",
    credentials: "include"
  }).then(res => res.json());
}

export function updateMachine(owner, name, machine) {
  let newMachine = Setting.deepCopy(machine);
  return fetch(`${Setting.ServerUrl}/api/update-machine?id=${owner}/${encodeURIComponent(name)}`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(newMachine),
  }).then(res => res.json());
}

export function addMachine(machine) {
  let newMachine = Setting.deepCopy(machine);
  return fetch(`${Setting.ServerUrl}/api/add-machine`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(newMachine),
  }).then(res => res.json());
}

export function deleteMachine(machine) {
  let newMachine = Setting.deepCopy(machine);
  return fetch(`${Setting.ServerUrl}/api/delete-machine`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(newMachine),
  }).then(res => res.json());
}
