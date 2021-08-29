package util

import (
	"bytes"
	"fmt"
	"os/exec"
)

func CD(path string) {
	err := Command("git pull\n")
	if err != nil {
		panic(err)
	} else {
		runCommand := fmt.Sprintf("cd %s \ngo run main.go\n", path)
		buildCommand := fmt.Sprintf("cd %s/web\nyarn run build\n", path)
		go Command(runCommand)
		go Command(buildCommand)
	}
}
func Command(command string) error {
	cmd := exec.Command("cmd")
	in := bytes.NewBuffer(nil)
	cmd.Stdin = in
	var out bytes.Buffer
	cmd.Stdout = &out
	go func() {
		in.WriteString(command)
	}()
	err := cmd.Start()
	if err != nil {
		return err
	}

	err = cmd.Wait()
	fmt.Println(out.String())
	return err
}
