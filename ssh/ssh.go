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

package ssh

import (
	"net"

	"github.com/casbin/casbin-oa/util"
	"github.com/melbahja/goph"
	"golang.org/x/crypto/ssh"
)

func RunCommand(ip string, username string, password string, command string) string {
	client, err := goph.NewConn(&goph.Config{
		User:    username,
		Addr:    ip,
		Port:    22,
		Auth:    goph.Password(password),
		Timeout: goph.DefaultTimeout,
		Callback: func(host string, remote net.Addr, key ssh.PublicKey) error {
			return nil
		},
	})
	if err != nil {
		panic(err)
	}
	defer client.Close()

	output, err := client.Run(command)
	if output == nil && err != nil {
		panic(err)
	}

	gbkOutput, err := util.GbkToUtf8(output)
	if err != nil {
		panic(err)
	}

	res := string(gbkOutput)
	return res
}
