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

import {trim} from "./Util";
import Sdk from "casdoor-js-sdk";
import * as Setting from "../Setting";

export let authConfig = {
  serverUrl: "http://example.com", // your Casdoor URL, like the official one: https://door.casbin.com
  clientId: "xxx", // your Casdoor OAuth Client ID
  appName: "app-example", // your Casdoor application name, like: "app-built-in"
  organizationName: "org-example", // your Casdoor organization name, like: "built-in"
};

let casdoorSdk;

export function initAuthWithConfig(config) {
  authConfig = config;
  casdoorSdk = new Sdk(config);
}

export function getSignupUrl() {
  return casdoorSdk.getSignupUrl();
}

export function getSigninUrl() {
  return casdoorSdk.getSigninUrl();
}

export function getUserProfileUrl(userName, account) {
  return casdoorSdk.getUserProfileUrl(userName, account);
}

export function getMyProfileUrl(account) {
  return casdoorSdk.getMyProfileUrl(account);
}

export function signin() {
  return casdoorSdk.signin(Setting.ServerUrl);
}
