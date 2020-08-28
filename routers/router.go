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

package routers

import (
	"github.com/astaxie/beego"

	"github.com/casbin/casbin-oa/controllers"
)

func init() {
	initAPI()
}

func initAPI() {
	ns :=
		beego.NewNamespace("/api",
			beego.NSInclude(
				&controllers.ApiController{},
			),
		)
	beego.AddNamespace(ns)

	beego.Router("/api/get-programs", &controllers.ApiController{}, "GET:GetPrograms")
	beego.Router("/api/get-program", &controllers.ApiController{}, "GET:GetProgram")
	beego.Router("/api/update-program", &controllers.ApiController{}, "POST:UpdateProgram")
	beego.Router("/api/add-program", &controllers.ApiController{}, "POST:AddProgram")
	beego.Router("/api/delete-program", &controllers.ApiController{}, "POST:DeleteProgram")

	beego.Router("/api/get-students", &controllers.ApiController{}, "GET:GetStudents")
	beego.Router("/api/get-student", &controllers.ApiController{}, "GET:GetStudent")
	beego.Router("/api/update-student", &controllers.ApiController{}, "POST:UpdateStudent")
	beego.Router("/api/add-student", &controllers.ApiController{}, "POST:AddStudent")
	beego.Router("/api/delete-student", &controllers.ApiController{}, "POST:DeleteStudent")
}
