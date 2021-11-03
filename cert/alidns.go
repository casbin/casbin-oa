package cert

import (
	"time"

	"github.com/casbin/lego/v4/certificate"
	"github.com/casbin/lego/v4/challenge/dns01"
	"github.com/casbin/lego/v4/cmd"
	"github.com/casbin/lego/v4/providers/dns/alidns"
)

type AliConf struct {
	Domains       []string // The domain names for which you want to apply for a certificate
	AccessKey     string   // Aliyun account's AccessKey, if this is not empty, Secret is required.
	Secret        string
	RAMRole       string // Use Ramrole to control aliyun account
	SecurityToken string // Optional
	Path          string // The path to store cert file
	Timeout       int    // Maximum waiting time for certificate application, in minutes
}

//Verify domain ownership, then obtain a certificate, and finally store it locally.
//Need to pass in an AliConf struct, some parameters are required, other parameters can be left blank
func AliDNSGetCert(conf AliConf) (string, string, error) {
	//Get account client to apply for a certificate.
	client := GetClient()
	//Set the parameters required to apply for a certificate.
	if conf.Timeout <= 0 {
		conf.Timeout = 3
	}
	ali := alidns.NewDefaultConfig()
	ali.PropagationTimeout = time.Duration(conf.Timeout) * time.Minute
	ali.APIKey = conf.AccessKey
	ali.SecretKey = conf.Secret
	ali.RAMRole = conf.RAMRole
	ali.SecurityToken = conf.SecurityToken
	DNS, err := alidns.NewDNSProvider(ali)
	if err != nil {
		return "", "", err
	}
	//Choose a local DNS service provider to increase the authentication speed
	servers := []string{"223.5.5.5:53"}
	client.Challenge.SetDNS01Provider(DNS,
		dns01.CondOption(len(servers) > 0, dns01.AddRecursiveNameservers(dns01.ParseNameservers(servers))))
	//Obtain the certificate
	request := certificate.ObtainRequest{
		Domains: conf.Domains,
		Bundle:  true,
	}
	certificates, err := client.Certificate.Obtain(request)
	if err != nil {
		return "", "", err
	}
	return string(certificates.Certificate), string(certificates.PrivateKey), nil
}

func SaveCert(path, filename string, cert *certificate.Resource) {
	//Store the certificate file locally
	certsStorage := cmd.NewCertificatesStorageLib(path, filename, true)
	certsStorage.CreateRootFolder()
	certsStorage.SaveResource(cert)
}
