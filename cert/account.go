package cert

import (
	"crypto"
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"sync"

	"github.com/casbin/lego/v4/certcrypto"
	"github.com/casbin/lego/v4/lego"
	"github.com/casbin/lego/v4/registration"
)

const (
	// LEDirectoryProduction URL to the Let's Encrypt production.
	LEDirectoryProduction = "https://acme-v02.api.letsencrypt.org/directory"

	// LEDirectoryStaging URL to the Let's Encrypt staging.
	LEDirectoryStaging = "https://acme-staging-v02.api.letsencrypt.org/directory"
)

var (
	client *lego.Client
	once   sync.Once
	myUser Account
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

//Incoming an email ,a privatekey and a Boolean value that controls the opening of the test environment
//When this function is started for the first time, it will initialize the account-related configuration,
//After initializing the configuration, an account will be applied for,
//and this account will be used during the running of the program
func CreateAccount(email string, privateKey *ecdsa.PrivateKey, devMode bool) (*lego.Client, error) {
	// Create a user. New accounts need an email and private key to start.
	once.Do(func() {
		// This function will only generate an account config the first time it is run
		initConfig(email, privateKey, devMode)
	})
	if myUser.Registration == nil || myUser.Registration.Body.Status == "" {
		var err error
		myUser.Registration, err = client.Registration.Register(registration.RegisterOptions{TermsOfServiceAgreed: true})
		if err != nil {
			return nil, err
		}
	}
	return client, nil
}

func GetClient() *lego.Client {
	return client
}

func initConfig(email string, privateKey *ecdsa.PrivateKey, devMode bool) {
	myUser = Account{
		Email: email,
		key:   privateKey,
	}
	legoConfig := lego.NewConfig(&myUser)
	if devMode {
		legoConfig.CADirURL = LEDirectoryStaging
	} else {
		legoConfig.CADirURL = LEDirectoryProduction
	}
	legoConfig.Certificate.KeyType = certcrypto.RSA2048
	client, _ = lego.NewClient(legoConfig)
}

//GenerateKey generates a public and private key pair.(NIST P-256)
func GenerateKey() *ecdsa.PrivateKey {
	privateKey, _ := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	return privateKey
}
