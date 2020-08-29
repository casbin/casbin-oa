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

export function getStudent(owner, name) {
  return fetch(`${Setting.ServerUrl}/api/get-student?id=${owner}/${encodeURIComponent(name)}`, {
    method: "GET",
    credentials: "include"
  }).then(res => res.json());
}

export function updateStudent(owner, name, student) {
  let newStudent = Setting.deepCopy(student);
  return fetch(`${Setting.ServerUrl}/api/update-student?id=${owner}/${encodeURIComponent(name)}`, {
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
