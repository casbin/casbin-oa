package controllers

import (
	"encoding/json"
	"fmt"
	"net/http"

	_ "github.com/go-sql-driver/mysql"
	"github.com/go-xorm/xorm"
)

type Repo struct {
	Name string `json:"name"`
}

type Assignee struct {
	Login string `json:"login"`
}

type Label struct {
	Name string `json:"name"`
}

type Milestone struct {
	Title string `json:"title"`
	URL   string `json:"url"`
}

type Issue struct {
	Title     string     `json:"title"`
	URL       string     `json:"url"`
	Number    int        `json:"number"`
	Labels    []Label    `json:"labels"`
	Body      string     `json:"body"`
	Assignees []Assignee `json:"assignees"`
	Milestone Milestone  `json:"milestone"`
	Repo      string
}

type Task struct {
	ID        int    `xorm:"'id' pk autoincr"`
	Title     string `xorm:"'title' varchar(1000)"`
	URL       string `xorm:"'url' varchar(100)"`
	Number    int    `xorm:"'number' int"`
	Labels    string `xorm:"'labels' varchar(100)"`
	Body      string `xorm:"'body' text"`
	Assignees string `xorm:"'assignees' varchar(100)"`
	Milestone string `xorm:"'milestone' varchar(1000)"`
	Repo      string `xorm:"'repo' varchar(100)"`
}


func getAllRepoIssues() ([]Issue, error) {
	// Get the user's repositories list
	repos, err := getUserRepos()
	if err != nil {
		return nil, err
	}

	// Convert repos to []Repo
	var repoList []Repo
	err = json.Unmarshal([]byte(repos), &repoList)
	if err != nil {
		return nil, err
	}

	// Get the issue list for each repository
	var issues []Issue
	for _, repo := range repoList {
		repoIssues, err := getRepoIssues(repo.Name)
		if err != nil {
			return nil, err
		}
		issues = append(issues, repoIssues...)
	}

	return issues, nil
}

func getUserRepos() (string, error) {
	client := &http.Client{}

	url := fmt.Sprintf("https://api.github.com/users/%s/repos", "casbin")
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return "", err
	}

	req.SetBasicAuth("huakainomore", "wyn20031219")

	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var repos []Repo
	err = json.NewDecoder(resp.Body).Decode(&repos)
	if err != nil {
		return "", err
	}

	reposJSON, err := json.Marshal(repos)
	if err != nil {
		return "", err
	}

	return string(reposJSON), nil
}

func getRepoIssues(repo string) ([]Issue, error) {
	client := &http.Client{}

	url := fmt.Sprintf("https://api.github.com/repos/casbin/%s/issues", repo)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.SetBasicAuth("huakainomore", "wyn20031219")

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var issues []Issue
	err = json.NewDecoder(resp.Body).Decode(&issues)
	if err != nil {
		return nil, err
	}

	for i := range issues {
		issues[i].Repo = repo
	}

	return issues, nil
}

func main() {
	issues, err := getAllRepoIssues()
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	engine, err := xorm.NewEngine("mysql", "root:Wyn20031219!@tcp(127.0.0.1:3306)/casbin_oa?charset=utf8mb4")
	if err != nil {
		fmt.Println("Error creating engine:", err)
		return
	}

	err = engine.Sync2(new(Task))
	if err != nil {
		fmt.Println("Error syncing table:", err)
		return
	}

	session := engine.NewSession()
	defer session.Close()

	for _, issue := range issues {
		task := Task{
			Title:     issue.Title,
			URL:       issue.URL,
			Number:    issue.Number,
			Labels:    fmt.Sprintf("%v", issue.Labels),
			Body:      fmt.Sprintf("%v", issue.Body),
			Assignees: fmt.Sprintf("%v", issue.Assignees),
			Milestone: fmt.Sprintf("%v", issue.Milestone),
			Repo:      issue.Repo,
		}

		_, err := session.Insert(&task)
		if err != nil {
			fmt.Println("Error inserting task:", err)
			return
		}
	}

	err = session.Commit()
	if err != nil {
		fmt.Println("Error committing transaction:", err)
		return
	}
}

