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

export function getStudents(owner) {
  return fetch(`${Setting.ServerUrl}/api/get-students?owner=${owner}`, {
    method: "GET",
    credentials: "include"
  }).then(res => res.json());
}

export function getFilteredStudents(owner, program) {
  return fetch(`${Setting.ServerUrl}/api/get-filtered-students?owner=${owner}&program=${program}`, {
    method: "GET",
    credentials: "include"
  }).then(res => res.json());
}

export function getStudent(owner, name, program) {
  return fetch(`${Setting.ServerUrl}/api/get-student?owner=${owner}&name=${name}&program=${program}`, {
    method: "GET",
    credentials: "include"
  }).then(res => res.json());
}

export function updateStudent(owner, name, program, student) {
  let newStudent = Setting.deepCopy(student);
  return fetch(`${Setting.ServerUrl}/api/update-student?owner=${owner}&name=${name}&program=${program}`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(newStudent),
  }).then(res => res.json());
}

export function addStudent(student) {
  let newStudent = Setting.deepCopy(student);
  return fetch(`${Setting.ServerUrl}/api/add-student`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(newStudent),
  }).then(res => res.json());
}

export function deleteStudent(student) {
  let newStudent = Setting.deepCopy(student);
  return fetch(`${Setting.ServerUrl}/api/delete-student`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(newStudent),
  }).then(res => res.json());
}
