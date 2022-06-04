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

	"github.com/casbin/casbin-oa/cert"
	"github.com/casbin/casbin-oa/util"
	"xorm.io/core"
)

type Domain struct {
	Owner       string `xorm:"varchar(100) notnull pk" json:"owner"`
	Name        string `xorm:"varchar(100) notnull pk" json:"name"`
	CreatedTime string `xorm:"varchar(100)" json:"createdTime"`

	Username     string `xorm:"varchar(100)" json:"username"`
	AccessKey    string `xorm:"varchar(100)" json:"accessKey"`
	AccessSecret string `xorm:"varchar(100)" json:"accessSecret"`

	ExpireTime string `xorm:"varchar(100)" json:"expireTime"`
	Cert       string `xorm:"mediumtext" json:"cert"`
	PrivateKey string `xorm:"mediumtext" json:"privateKey"`
}

func GetDomains(owner string) []*Domain {
	domains := []*Domain{}
	err := adapter.Engine.Desc("created_time").Find(&domains, &Domain{Owner: owner})
	if err != nil {
		panic(err)
	}

	return domains
}

func getDomain(owner string, name string) *Domain {
	domain := Domain{Owner: owner, Name: name}
	existed, err := adapter.Engine.Get(&domain)
	if err != nil {
		panic(err)
	}

	if existed {
		return &domain
	} else {
		return nil
	}
}

func GetDomain(id string) *Domain {
	owner, name := util.GetOwnerAndNameFromId(id)
	return getDomain(owner, name)
}

func updateDomain(owner string, name string, domain *Domain) bool {
	if getDomain(owner, name) == nil {
		return false
	}

	_, err := adapter.Engine.Id(core.PK{owner, name}).AllCols().Update(domain)
	if err != nil {
		panic(err)
	}

	//return affected != 0
	return true
}

func UpdateDomain(id string, domain *Domain) bool {
	owner, name := util.GetOwnerAndNameFromId(id)
	return updateDomain(owner, name, domain)
}

func AddDomain(domain *Domain) bool {
	affected, err := adapter.Engine.Insert(domain)
	if err != nil {
		panic(err)
	}

	return affected != 0
}

func AddDomains(domains []*Domain) bool {
	affected, err := adapter.Engine.Insert(domains)
	if err != nil {
		panic(err)
	}

	return affected != 0
}

func DeleteDomain(domain *Domain) bool {
	affected, err := adapter.Engine.Id(core.PK{domain.Owner, domain.Name}).Delete(&Domain{})
	if err != nil {
		panic(err)
	}

	return affected != 0
}

func (domain *Domain) getId() string {
	return fmt.Sprintf("%s/%s", domain.Owner, domain.Name)
}

func RenewDomain(domain *Domain) bool {
	client := cert.GetAcmeClient(acmeEmail, acmePrivateKey, false)
	certStr, privateKey := cert.ObtainCertificate(client, domain.Name, domain.AccessKey, domain.AccessSecret)

	domain.ExpireTime = getCertExpireTime(certStr)
	domain.Cert = certStr
	domain.PrivateKey = privateKey

	return UpdateDomain(domain.getId(), domain)
}
