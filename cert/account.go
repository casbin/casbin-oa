// This part is borrowed from https://github.com/go-acme/lego/blob/60ae6e6dc935977d0e9d7b7d965e14384c973c18/cmd/accounts_storage.go
package cert

import (
	"crypto"
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"log"

	"github.com/casbin/casbin-oa/cert/config"
	"github.com/go-acme/lego/v4/certcrypto"
	"github.com/go-acme/lego/v4/lego"
	"github.com/go-acme/lego/v4/registration"
)

type Account struct {
	Email        string
	Registration *registration.Resource
	key          crypto.PrivateKey
}

/** Implementation of the registration.User interface **/

// GetEmail returns the email address for the account.
func (a *Account) GetEmail() string {
	return a.Email
}

// GetPrivateKey returns the private RSA account key.
func (a *Account) GetPrivateKey() crypto.PrivateKey {
	return a.key
}

// GetRegistration returns the server registration.
func (a *Account) GetRegistration() *registration.Resource {
	return a.Registration
}

//GetLoginAccount will register an account to apply for a certificate.
//Due to the complexity of the code, the reuse of accounts has not been implemented yet,
//so the call of this function per hour will be limited, and subsequent optimization will be considered.
func GetLoginAccount() *lego.Client {
	// Create a user. New accounts need an email and private key to start.
	privateKey, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	if err != nil {
		log.Fatal(err)
	}

	myUser := Account{
		Email: config.Config.Email,
		key:   privateKey,
	}
	legoConfig := lego.NewConfig(&myUser)
	legoConfig.CADirURL = config.Config.CADirURL
	legoConfig.Certificate.KeyType = certcrypto.RSA2048
	client, err := lego.NewClient(legoConfig)
	if err != nil {
		log.Fatal(err)
	}

	myUser.Registration, err = client.Registration.Register(registration.RegisterOptions{TermsOfServiceAgreed: true})
	if err != nil {
		log.Fatal(err)
	}
	return client
}
