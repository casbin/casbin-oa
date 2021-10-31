package config

import (
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"sync"

	"github.com/astaxie/beego/utils"
	"gopkg.in/yaml.v2"
)

type AliDNS struct {
	RAMMode       bool   `yaml:"RAMMode"`
	RAMRole       string `yaml:"RAMRole"`
	AccessKey     string `yaml:"AccessKey"`
	SecretKey     string `yaml:"SecretKey"`
	SecurityToken string `yaml:"SecurityToken"`
}
type DNSPOD struct {
	Token string `yaml:"Token"`
}
type Conf struct {
	PropagationTimeout int    `yaml:"PropagationTimeout"`
	DNSProvider        string `yaml:"DNSProvider"`
	DevMode            bool   `yaml:"DevMode"`
	SecretKey          string `yaml:"SecretKey"`
	Path               string `yaml:"Path"`
	Email              string `yaml:"Email"`
	AliDNS             AliDNS `yaml:"AliDNS"`
	DNSPOD             DNSPOD `yaml:"DNSPOD"`
	CADirURL           string
}

const (
	// LEDirectoryProduction URL to the Let's Encrypt production.
	LEDirectoryProduction = "https://acme-v02.api.letsencrypt.org/directory"

	// LEDirectoryStaging URL to the Let's Encrypt staging.
	LEDirectoryStaging = "https://acme-staging-v02.api.letsencrypt.org/directory"
)

var (
	Config     Conf
	onceConfig sync.Once
	AppPath    string
	WorkPath   string
)

//Use once to initialize the configuration only once
func InitConfig() Conf {
	onceConfig.Do(func() {
		var err error
		if AppPath, err = filepath.Abs(filepath.Dir(os.Args[0])); err != nil {
			panic(err)
		}
		WorkPath, err = os.Getwd()
		if err != nil {
			panic(err)
		}
		filename := "cert.yaml"
		configPath := filepath.Join(WorkPath, "conf", filename)
		if !utils.FileExists(configPath) {
			configPath = filepath.Join(AppPath, "conf", filename)
		}
		tmp, err := ioutil.ReadFile(configPath)
		if err != nil {
			log.Fatal(err)
		}
		yaml.Unmarshal(tmp, &Config)
	})
	if Config.DevMode {
		Config.CADirURL = LEDirectoryStaging
	} else {
		Config.CADirURL = LEDirectoryProduction
	}
	return Config
}
