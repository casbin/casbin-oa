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

package util

import (
	"errors"
	"io/ioutil"
	"strconv"
	"strings"
)

func ParseInt(s string) int {
	i, err := strconv.Atoi(s)
	if err != nil {
		panic(err)
	}

	return i
}

func GetOwnerAndNameFromId(id string) (string, string) {
	tokens := strings.Split(id, "/")
	if len(tokens) != 2 {
		panic(errors.New("GetOwnerAndNameFromId() error, wrong token count for ID: " + id))
	}

	return tokens[0], tokens[1]
}

func ReadStringFromPath(path string) string {
	data, err := ioutil.ReadFile(path)
	if err != nil {
		panic(err)
	}

	return string(data)
}

func WriteStringToPath(s string, path string) {
	err := ioutil.WriteFile(path, []byte(s), 0644)
	if err != nil {
		panic(err)
	}
}
