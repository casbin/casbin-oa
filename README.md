casbin-oa
====

Casbin-oa is An official manuscript processing, evaluation and display system for Casbin technical writers

## Architecture

Casbin-oa contains 2 parts:

Name | Description | Language | Source code
----|------|----|----
Frontend | Web frontend UI for Casbin-oa | Javascript + React | https://github.com/casbin/casbin-oa/tree/master/web
Backend | RESTful API backend for Casbin-oa | Golang + Beego + MySQL | https://github.com/casbin/casbin-oa/ 


## Installation

- Get the code:

    ```shell
    go get github.com/casbin/casbin-oa
    ```
  or
    ```shell
    git clone https://github.com/casbin/casbin-oa.git
    ```

- Setup database:

  Casbin-oa will store its student, report and topics informations in a MySQL database named: `casbin_oa`, will create it if not existed. The DB connection string can be specified at: https://github.com/casbin/casbin-oa/tree/master/conf

    ```ini
    dataSourceName = root:123@tcp(localhost:3306)/
    ```

  Casbin-oa uses XORM to connect to DB, so all DBs supported by XORM can also be used.

- Run backend (in port 10000):

    ```shell
    go run main.go
    ```

- Run frontend (in the same machine's port 9000):

    ```shell
    cd web
    ## npm
    npm install
    npm run start
    ## yarn
    yarn install
    yarn run start
    ```

- Open browser:

  http://localhost:9000/
