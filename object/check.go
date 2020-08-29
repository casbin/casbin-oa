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

package object

func CheckUserRegister(user string, password string) string {
	if len(user) == 0 || len(password) == 0 {
		return "Username or password is empty"
	} else if HasUser(user) {
		return "Username already exists, please login instead"
	} else {
		return ""
	}
}

func CheckUserLogin(user string, password string) string {
	if !HasUser(user) {
		return "Username doesn't exist, please register first"
	}

	if !IsPasswordCorrect(user, password) {
		return "Wrong password"
	}

	return ""
}
