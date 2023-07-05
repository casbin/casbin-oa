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

package casdoor

import (
	"runtime"

	"github.com/astaxie/beego"
	_ "github.com/go-sql-driver/mysql"
	"xorm.io/xorm"
)

/*
adapter 是一个指向 Adapter 结构的指针，用于管理与数据库的交互。
CasdoorOrganization, CasdoorApplication 是用于存储 Casdoor 组织和应用程序的名称的字符串变量。
*/
var (
	adapter             *Adapter = nil
	CasdoorOrganization string
	CasdoorApplication  string
)
/*
这个结构体用于表示会话信息，并使用 xorm 标签指定了与数据库表的映射关系。
*/
type Session struct {
	SessionKey    string  `xorm:"char(64) notnull pk"`
	SessionData   []uint8 `xorm:"blob"`
	SessionExpiry int     `xorm:"notnull"`
}
/*
这个函数用于初始化 Casdoor 适配器，并从 Beego 框架的配置中获取必要的数据库连接信息和 Casdoor 组织、应用程序的名称。
*/
func InitCasdoorAdapter() {
	casdoorDbName := beego.AppConfig.String("casdoorDbName")
	if casdoorDbName == "" {
		return
	}

	adapter = NewAdapter(beego.AppConfig.String("driverName"), beego.AppConfig.String("dataSourceName"), beego.AppConfig.String("casdoorDbName"))

	CasdoorOrganization = beego.AppConfig.String("casdoorOrganization")
	CasdoorApplication = beego.AppConfig.String("casdoorApplication")
}

// Adapter represents the MySQL adapter for policy storage.
/*
这个结构体用于表示 Casdoor 适配器，其中包含数据库连接相关的信息和 xorm.Engine 实例。
*/
type Adapter struct {
	driverName     string
	dataSourceName string
	dbName         string
	Engine         *xorm.Engine
}

// finalizer is the destructor for Adapter.
/*
这是 Adapter 结构体的析构函数。在对象释放时，会调用该函数来关闭与数据库的连接。
它使用 xorm.Engine 实例的 Close() 方法来关闭数据库连接。如果关闭过程中发生错误，会触发 panic。
*/
func finalizer(a *Adapter) {
	err := a.Engine.Close()
	if err != nil {
		panic(err)
	}
}

// NewAdapter is the constructor for Adapter.
func NewAdapter(driverName string, dataSourceName string, dbName string) *Adapter {
	a := &Adapter{}
	a.driverName = driverName
	a.dataSourceName = dataSourceName
	a.dbName = dbName

	// Open the DB, create it if not existed.
	a.open()

	// Call the destructor when the object is released. 
	//设置析构函数
	runtime.SetFinalizer(a, finalizer)

	return a
}

func (a *Adapter) open() {
	Engine, err := xorm.NewEngine(a.driverName, a.dataSourceName+a.dbName)
	if err != nil {
		panic(err)
	}

	a.Engine = Engine
}

func (a *Adapter) close() {
	a.Engine.Close()
	a.Engine = nil
}
