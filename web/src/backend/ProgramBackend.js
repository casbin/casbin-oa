import * as Setting from "../Setting";

export function getPrograms(owner) {
  return fetch(`${Setting.ServerUrl}/api/get-programs?owner=${owner}`, {
    method: "GET",
    credentials: "include"
  }).then(res => res.json());
}

export function getProgram(owner, name) {
  return fetch(`${Setting.ServerUrl}/api/get-program?id=${owner}/${encodeURIComponent(name)}`, {
    method: "GET",
    credentials: "include"
  }).then(res => res.json());
}

export function updateProgram(owner, name, program) {
  let newProgram = Setting.deepCopy(program);
  return fetch(`${Setting.ServerUrl}/api/update-program?id=${owner}/${encodeURIComponent(name)}`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(newProgram),
  }).then(res => res.json());
}

export function addProgram(program) {
  let newProgram = Setting.deepCopy(program);
  return fetch(`${Setting.ServerUrl}/api/add-program`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(newProgram),
  }).then(res => res.json());
}

export function deleteProgram(program) {
  let newProgram = Setting.deepCopy(program);
  return fetch(`${Setting.ServerUrl}/api/delete-program`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(newProgram),
  }).then(res => res.json());
}
