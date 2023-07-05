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

package controllers

import (
	"encoding/gob"

	"github.com/astaxie/beego"
	"github.com/casdoor/casdoor-go-sdk/casdoorsdk"
)

//Beego控制器
type ApiController struct {
	beego.Controller
}

/*
这个函数在应用程序启动时被调用，用于注册 casdoorsdk.Claims 的类型，以便在会话中进行序列化和反序列化。
*/
func init() {
	gob.Register(casdoorsdk.Claims{})
}

/*
这个函数用于从会话中获取用户声明（Claims）。
函数调用 c.GetSession() 获取名为 "user" 的会话值。
如果会话值为 nil，表示用户未登录，函数返回 nil。
否则，将会话值转换为 casdoorsdk.Claims 类型，并返回该声明。
*/
func (c *ApiController) GetSessionClaims() *casdoorsdk.Claims {
	s := c.GetSession("user")
	if s == nil {
		return nil
	}

	claims := s.(casdoorsdk.Claims)
	return &claims
}
/*
这个函数用于设置会话中的用户声明（Claims）。
如果参数 claims 为 nil，表示用户登出，函数调用 c.DelSession() 删除名为 "user" 的会话值。
否则，将参数 claims 设置为会话值。
*/
func (c *ApiController) SetSessionClaims(claims *casdoorsdk.Claims) {
	if claims == nil {
		c.DelSession("user")
		return
	}

	c.SetSession("user", *claims)
}
/*
这个函数用于从会话中获取用户对象（casdoorsdk.User）。
函数调用 c.GetSessionClaims() 获取用户声明。
如果用户声明为空，表示用户未登录，函数返回 nil。
否则，从用户声明中获取用户对象，并返回该用户对象。
*/
func (c *ApiController) GetSessionUser() *casdoorsdk.User {
	claims := c.GetSessionClaims()
	if claims == nil {
		return nil
	}

	return &claims.User
}
