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
