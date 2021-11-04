package cert

import (
	"crypto"
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/x509"
	"encoding/pem"
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
//After initializing the configuration, It will try to obtain an account based on the private key,
//if it fails, it will create an account based on the private key.
//This account will be used during the running of the program
func CreateAccount(email string, privateKey *ecdsa.PrivateKey, devMode bool) (*lego.Client, error) {
	// Create a user. New accounts need an email and private key to start.
	once.Do(func() {
		// This function will only generate an account config the first time it is run
		initConfig(email, privateKey, devMode)
	})
	//try to obtain an account based on the private key,
	myUser.Registration, _ = client.Registration.ResolveAccountByKey()
	if myUser.Registration == nil || myUser.Registration.Body.Status == "" {
		//Failed to get account, so create an account based on the private key.
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

//Return the input private key object as string type private key
func EncodeEC(privateKey *ecdsa.PrivateKey) (string, error) {
	x509Encoded, err := x509.MarshalECPrivateKey(privateKey)
	if err != nil {
		return "", err
	}
	pemEncoded := pem.EncodeToMemory(&pem.Block{Type: "EC PRIVATE KEY", Bytes: x509Encoded})
	return string(pemEncoded), nil
}

//Return the entered private key string as a private key object that can be used
func DecodeEC(pemEncoded string) (*ecdsa.PrivateKey, error) {
	block, _ := pem.Decode([]byte(pemEncoded))
	x509Encoded := block.Bytes
	privateKey, err := x509.ParseECPrivateKey(x509Encoded)
	return privateKey, err
}
