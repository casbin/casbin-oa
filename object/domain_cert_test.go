// Copyright 2022 The casbin Authors. All Rights Reserved.
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

import (
	"fmt"
	"testing"

	"github.com/casbin/casbin-oa/proxy"
	"github.com/casbin/casbin-oa/util"
)

func TestGetCertExpireTime(t *testing.T) {
	InitConfig()

	domain := getDomain("admin", "casbin.com")
	println(getCertExpireTime(domain.Cert))
}

func TestRenewAllCerts(t *testing.T) {
	InitConfig()
	proxy.InitHttpClient()

	domains := GetDomains("admin")
	for i, domain := range domains {
		res := RenewDomain(domain)
		fmt.Printf("[%d/%d] Renewed domain: [%s] to [%s], res = %v\n", i+1, len(domains), domain.Name, domain.ExpireTime, res)
	}
}

func TestApplyAllCerts(t *testing.T) {
	InitConfig()

	baseDir := "F:/github_repos/nginx/conf/ssl"
	domains := GetDomains("admin")
	for _, domain := range domains {
		if domain.Cert == "" || domain.PrivateKey == "" {
			continue
		}

		util.WriteStringToPath(domain.Cert, fmt.Sprintf("%s/%s.pem", baseDir, domain.Name))
		util.WriteStringToPath(domain.PrivateKey, fmt.Sprintf("%s/%s.key", baseDir, domain.Name))
	}
}
