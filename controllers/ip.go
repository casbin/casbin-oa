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

package controllers

import (
	"net/http"
	"strings"

	"github.com/casbin/casbin-oa/ip"
)

/*
函数 getIpFromRequest(req *http.Request) string：
这个函数用于从 HTTP 请求中获取客户端的 IP 地址。
函数接受一个 *http.Request 类型的参数 req，表示 HTTP 请求对象。
首先尝试从请求头中获取客户端的 IP 地址，使用 req.Header.Get("x-forwarded-for") 获取名为 "x-forwarded-for" 的请求头的值。
如果请求头中没有找到 IP 地址，那么通过解析 req.RemoteAddr 字段获取 IP 地址。
使用 strings.Split(req.RemoteAddr, ":") 分割 req.RemoteAddr 字段，得到 IP 地址和端口号的字符串数组。
如果字符串数组的长度为 1 到 2，说明 IP 地址存在于数组的第一个元素，将其赋值给 clientIp。
如果字符串数组的长度大于 2，说明 IP 地址可能包含端口号和 IPv6 地址的方括号。通过适当的字符串处理，将 IP 地址赋值给 clientIp。
返回 clientIp。
*/
func getIpFromRequest(req *http.Request) string {
	clientIp := req.Header.Get("x-forwarded-for")
	if clientIp == "" {
		ipPort := strings.Split(req.RemoteAddr, ":")
		if len(ipPort) >= 1 && len(ipPort) <= 2 {
			clientIp = ipPort[0]
		} else if len(ipPort) > 2 {
			idx := strings.LastIndex(req.RemoteAddr, ":")
			clientIp = req.RemoteAddr[0:idx]
			clientIp = strings.TrimLeft(clientIp, "[")
			clientIp = strings.TrimRight(clientIp, "]")
		}
	}

	return clientIp
}

func (c *ApiController) IsMainlandIp() {
	clientIp := getIpFromRequest(c.Ctx.Request)
	isMainlandIp := ip.IsMainlandIp(clientIp)

	c.Data["json"] = isMainlandIp
	c.ServeJSON()
}
