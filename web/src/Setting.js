// Copyright 2020 The casbin Authors. All Rights Reserved.
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

import {message} from "antd";
import {isMobile as isMobileDevice} from "react-device-detect";
import Sdk from "casdoor-js-sdk";

export let ServerUrl = '';
export let CasdoorSdk;

export function initServerUrl() {
  const hostname = window.location.hostname;
  if (hostname === 'localhost') {
    ServerUrl = `http://${hostname}:10000`;
  }
}

export function initCasdoorSdk(config) {
  CasdoorSdk = new Sdk(config);
}

export function getSignupUrl() {
  return CasdoorSdk.getSignupUrl();
}

export function getSigninUrl() {
  return CasdoorSdk.getSigninUrl();
}

export function getUserProfileUrl(userName, account) {
  return CasdoorSdk.getUserProfileUrl(userName, account);
}

export function getMyProfileUrl(account) {
  return CasdoorSdk.getMyProfileUrl(account);
}

export function signin() {
  return CasdoorSdk.signin(ServerUrl);
}

export function parseJson(s) {
  if (s === "") {
    return null;
  } else {
    return JSON.parse(s);
  }
}

export function myParseInt(i) {
  const res = parseInt(i);
  return isNaN(res) ? 0 : res;
}

export function openLink(link) {
  // this.props.history.push(link);
  const w = window.open('about:blank');
  w.location.href = link;
}

export function goToLink(link) {
  window.location.href = link;
}

export function showMessage(type, text) {
  if (type === "") {
    return;
  } else if (type === "success") {
    message.success(text);
  } else if (type === "error") {
    message.error(text);
  } else if (type === "warn") {
    message.warn(text)
  }
}

export function isAdminUser(account) {
  return account?.isAdmin;
}

export function deepCopy(obj) {
  return Object.assign({}, obj);
}

export function addRow(array, row) {
  return [...array, row];
}

export function prependRow(array, row) {
  return [row, ...array];
}

export function insertRow(array, i, row) {
  return [].concat(array.slice(0, i), row, array.slice(i));
}

export function deleteRow(array, i) {
  // return array = array.slice(0, i).concat(array.slice(i + 1));
  return [...array.slice(0, i), ...array.slice(i + 1)];
}

export function swapRow(array, i, j) {
  return [...array.slice(0, i), array[j], ...array.slice(i + 1, j), array[i], ...array.slice(j + 1)];
}

export function isMobile() {
  // return getIsMobileView();
  return isMobileDevice;
}

export function getFormattedDate(date) {
  if (date === undefined || date === null) {
    return null;
  }

  date = date.replace('T', ' ');
  date = date.replace('+08:00', ' ');
  return date;
}

export function getFormattedDateShort(date) {
  return date.slice(0, 10);
}

export function getShortName(s) {
  return s.split('/').slice(-1)[0];
}

export function toCsv(s) {
  if (s === undefined) {
    return "";
  }

  if (typeof s === "string") {
    return s.replace(/"/g, '""');
  } else {
    return s;
  }
}

export function getPercentage(f) {
  if (f === undefined) {
    return 0.0;
  }

  return (100 * f).toFixed(1);
}

function getRandomInt(s) {
  let hash = 0;
  if (s.length !== 0) {
    for (let i = 0; i < s.length; i ++) {
      let char = s.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
  }

  return hash;
}

export function getAvatarColor(s) {
  const colorList = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae'];
  let random = getRandomInt(s);
  if (random < 0) {
    random = -random;
  }
  return colorList[random % 4];
}

export function isChineseStr(s) {
  if (s === undefined || s === null || s === "") {
    return false;
  }

  // https://www.cnblogs.com/weihanli/p/validrealnameandidcardno.html
  const re =/^[\u4E00-\u9FA5]{2,4}$/u;
  return re.test(s);
}
