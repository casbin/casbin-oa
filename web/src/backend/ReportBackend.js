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
