package cert

import (
	"log"

	"github.com/casbin/casbin-oa/cert/config"
	"github.com/casbin/casbin-oa/cert/providers/alidns"
	"github.com/casbin/casbin-oa/cert/providers/dnspod"
	"github.com/go-acme/lego/v4/certificate"
	"github.com/go-acme/lego/v4/challenge"
	"github.com/go-acme/lego/v4/challenge/dns01"
	"github.com/go-acme/lego/v4/lego"
)

//The entry function for this package. Its required to pass in the domain string variable of the renewal
func AutoCert(domain string) {
	config.InitConfig()
	client := GetLoginAccount()
	GetDNSProvider(client)
	certificates := GetKey(client, domain)
	StoreKey(certificates, domain)
}

//Obtain the DNS Provider and specify the DNS used for the query
func GetDNSProvider(client *lego.Client) *lego.Client {
	var DNS challenge.Provider
	var err error
	switch config.Config.DNSProvider {
	case "alidns":
		DNS, err = alidns.NewDNSProvider()
	case "dnspod":
		DNS, err = dnspod.NewDNSProvider()
	}
	//DNS, err := dnspod.NewDNSProvider()
	if err != nil {
		log.Fatal(err)
	}
	servers := []string{"119.29.29.29:53", "114.114.114.114:53", "223.5.5.5:53"}
	client.Challenge.SetDNS01Provider(DNS,
		dns01.CondOption(len(servers) > 0, dns01.AddRecursiveNameservers(dns01.ParseNameservers(servers))))
	return client
}

//Obtain the certificate, The string type variable that needs to apply for the domain name should be passed in
func GetKey(client *lego.Client, domain string) *certificate.Resource {
	request := certificate.ObtainRequest{
		Domains: []string{domain},
		Bundle:  true,
	}
	certificates, err := client.Certificate.Obtain(request)
	if err != nil {
		log.Fatal(err)
	}
	return (*certificate.Resource)(certificates)
}

//Store the certificate file locally
func StoreKey(certificates *certificate.Resource, domain string) {
	certsStorage := NewCertificatesStorage(domain, true)
	certsStorage.CreateRootFolder()
	certsStorage.SaveResource(certificates)
}
