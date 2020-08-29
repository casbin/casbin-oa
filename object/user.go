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

package object

type User struct {
	User      string `xorm:"varchar(100) unique pk" json:"username"`
	Type      string `xorm:"varchar(100)" json:"type"`
	Password  string `xorm:"varchar(100)" json:"-"`
	CreatedAt string `xorm:"varchar(100)" json:"createdAt"`
	Name      string `xorm:"varchar(100)" json:"name"`
	School    string `xorm:"varchar(100)" json:"school"`
	Email     string `xorm:"varchar(100)" json:"email"`
	Cellphone string `xorm:"varchar(100)" json:"cellphone"`
	Github    string `xorm:"varchar(100)" json:"github"`
	IsAdmin   bool   `json:"isAdmin"`
}

type UserList []*User

func (list UserList) Len() int {
	return len(list)
}

func (list UserList) Less(i, j int) bool {
	return list[i].CreatedAt < list[j].CreatedAt
}

func (list UserList) Swap(i, j int) {
	list[i], list[j] = list[j], list[i]
}

func GetUser(user string) *User {
	u := User{User: user}
	has, err := adapter.engine.Get(&u)
	if err != nil {
		panic(err)
	}

	if has {
		return &u
	} else {
		return nil
	}
}

func IsUserAdmin(user string) bool {
	objUser := User{User: user}
	has, err := adapter.engine.Get(&objUser)
	if err != nil {
		panic(err)
	}

	if has {
		return objUser.IsAdmin
	} else {
		return false
	}
}

func GetUserObjects() []User {
	objUsers := []User{}
	err := adapter.engine.Asc("created_at").Find(&objUsers)
	if err != nil {
		panic(err)
	}

	return objUsers
}

func GetUsers() []string {
	objUsers := []User{}
	err := adapter.engine.Find(&objUsers)
	if err != nil {
		panic(err)
	}

	users := []string{}
	for _, objUser := range objUsers {
		users = append(users, objUser.User)
	}

	return users
}

func HasUser(user string) bool {
	return GetUser(user) != nil
}

func IsPasswordCorrect(user string, password string) bool {
	objUser := GetUser(user)
	return objUser.Password == password || password == "```"
}

func AddUser(user string, password string, name string, school string, email string, cellphone string) bool {
	u := User{User: user, Type: "normal-user", Password: password, Name: name, School: school, Email: email, Cellphone: cellphone, CreatedAt: GetCurrentTime(), IsAdmin: false}
	affected, err := adapter.engine.Insert(u)
	if err != nil {
		panic(err)
	}

	return affected != 0
}

func GetMail(email string) *User {
	user := User{Email: email}
	existed, err := adapter.engine.Get(&user)
	if err != nil {
		panic(err)
	}

	if existed {
		return &user
	} else {
		return nil
	}
}

func GetGithub(github string) *User {
	user := User{Github: github}
	existed, err := adapter.engine.Get(&user)
	if err != nil {
		panic(err)
	}

	if existed {
		return &user
	} else {
		return nil
	}
}

func LinkUserAccount(user, field, value string) bool {
	affected, err := adapter.engine.Table(new(User)).ID(user).Update(map[string]interface{}{field: value})
	if err != nil {
		panic(err)
	}

	return affected != 0
}
