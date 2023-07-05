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

	DomainExpireTime string `xorm:"varchar(100)" json:"domainExpireTime"`

	Provider     string `xorm:"varchar(100)" json:"provider"`
	Username     string `xorm:"varchar(100)" json:"username"`
	AccessKey    string `xorm:"varchar(100)" json:"accessKey"`
	AccessSecret string `xorm:"varchar(100)" json:"accessSecret"`

	ExpireTime string `xorm:"varchar(100)" json:"expireTime"`
	Cert       string `xorm:"mediumtext" json:"cert"`
	PrivateKey string `xorm:"mediumtext" json:"privateKey"`
}

//根据所有者的名称获取该所有者拥有的所有域名，并按创建时间降序排列。
func GetDomains(owner string) []*Domain {
	domains := []*Domain{}
	err := adapter.Engine.Desc("created_time").Find(&domains, &Domain{Owner: owner})
	if err != nil {
		panic(err)
	}

	return domains
}
//根据所有者和名称获取一个域名对象。
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
//根据域名ID获取一个域名对象
func GetDomain(id string) *Domain {
	owner, name := util.GetOwnerAndNameFromId(id)
	return getDomain(owner, name)
}
//更新一个域名对象
func updateDomain(owner string, name string, domain *Domain) bool {
	if getDomain(owner, name) == nil {
		return false
	}

	_, err := adapter.Engine.ID(core.PK{owner, name}).AllCols().Update(domain)
	if err != nil {
		panic(err)
	}

	//return affected != 0
	return true
}
//根据域名ID更新一个域名对象
func UpdateDomain(id string, domain *Domain) bool {
	owner, name := util.GetOwnerAndNameFromId(id)
	return updateDomain(owner, name, domain)
}
//添加一个域名对象
func AddDomain(domain *Domain) bool {
	affected, err := adapter.Engine.Insert(domain)
	if err != nil {
		panic(err)
	}

	return affected != 0
}
//批量添加多个域名对象
func AddDomains(domains []*Domain) bool {
	affected, err := adapter.Engine.Insert(domains)
	if err != nil {
		panic(err)
	}

	return affected != 0
}
//删除一个域名对象
func DeleteDomain(domain *Domain) bool {
	affected, err := adapter.Engine.ID(core.PK{domain.Owner, domain.Name}).Delete(&Domain{})
	if err != nil {
		panic(err)
	}

	return affected != 0
}
//域名的ID
func (domain *Domain) getId() string {
	return fmt.Sprintf("%s/%s", domain.Owner, domain.Name)
}
//续订一个域名的证书
func RenewDomain(domain *Domain) bool {
	client := cert.GetAcmeClient(acmeEmail, acmePrivateKey, false)

	var certStr, privateKey string
	if domain.Provider == "Aliyun" {
		certStr, privateKey = cert.ObtainCertificateAli(client, domain.Name, domain.AccessKey, domain.AccessSecret)
	} else if domain.Provider == "GoDaddy" {
		certStr, privateKey = cert.ObtainCertificateGoDaddy(client, domain.Name, domain.AccessKey, domain.AccessSecret)
	} else {
		panic(fmt.Errorf("unknown provider: %s", domain.Provider))
	}

	domain.ExpireTime = getCertExpireTime(certStr)
	domain.Cert = certStr
	domain.PrivateKey = privateKey

	return UpdateDomain(domain.getId(), domain)
}
