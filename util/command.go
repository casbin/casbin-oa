package util

import (
	"bytes"
	"fmt"
	"os"
	"os/exec"
	"strings"
)

func CD(path string) string {
	_, err := os.Stat(path)
	if os.IsNotExist(err) {
		return "Path Wrong"
	}

	gitPullCommand := fmt.Sprintf("cd %s \ngit pull\n", path)
	message := Command(gitPullCommand)

	if strings.Contains(message, "not a git repository") {
		return "Path Wrong"
	}
	runCommand := fmt.Sprintf("cd %s \ngo run main.go\n", path)
	buildCommand := fmt.Sprintf("cd %s/web\nyarn run build\n", path)

	message = Command(runCommand)
	if strings.Contains(message, "Automatic merge failed") {
		return message
	}
	go Command(buildCommand)

	return ""
}
func Command(command string) string {
	cmd := exec.Command("cmd")
	in := bytes.NewBuffer(nil)
	cmd.Stdin = in
	var out bytes.Buffer
	cmd.Stdout = &out
	go func() {
		in.WriteString(command)
	}()
	cmd.Start()
	cmd.Wait()
	fmt.Println(out.String())
	return out.String()
}
