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
	"crypto/x509"
	"encoding/pem"
	"fmt"
	"time"
)

func getCertExpireTime(cert string) string {
	block, _ := pem.Decode([]byte(cert))
	if block == nil {
		panic(fmt.Errorf("failed to parse domain cert: %s", cert))
	}

	certificate, err := x509.ParseCertificate(block.Bytes)
	if err != nil {
		panic(err)
	}

	return certificate.NotAfter.Local().Format(time.RFC3339)
}

func (domain *Domain) checkDomain() string {
	return getCertExpireTime(domain.Cert)
}
