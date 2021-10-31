// Package dnspod implements a DNS provider for solving the DNS-01 challenge using dnspod DNS.
//Derived from https://github.com/go-acme/lego/blob/60ae6e6dc935977d0e9d7b7d965e14384c973c18/providers/dns/dnspod/dnspod.go, modified to comply with the current package use
package dnspod

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	conf "github.com/casbin/casbin-oa/cert/config"
	"github.com/go-acme/lego/v4/challenge/dns01"
	"github.com/nrdcg/dnspod-go"
)

// Config is used to configure the creation of the DNSProvider.
type Config struct {
	LoginToken         string
	TTL                int
	PropagationTimeout time.Duration
	PollingInterval    time.Duration
	HTTPClient         *http.Client
}

// NewDefaultConfig returns a default configuration for the DNSProvider.
func NewDefaultConfig() *Config {
	return &Config{
		TTL:                600,
		PropagationTimeout: time.Duration(conf.Config.PropagationTimeout) * time.Minute,
		PollingInterval:    dns01.DefaultPollingInterval,
		HTTPClient: &http.Client{
			Timeout: 45 * time.Second,
		},
	}
}

// DNSProvider implements the challenge.Provider interface.
type DNSProvider struct {
	config *Config
	client *dnspod.Client
}

// NewDNSProvider returns a DNSProvider instance configured for dnspod.
// Credentials must be passed in DNSPOD_API_KEY.
func NewDNSProvider() (*DNSProvider, error) {
	config := NewDefaultConfig()
	config.LoginToken = conf.Config.DNSPOD.Token
	return NewDNSProviderConfig(config)
}

// NewDNSProviderConfig return a DNSProvider instance configured for dnspod.
func NewDNSProviderConfig(config *Config) (*DNSProvider, error) {
	if config == nil {
		return nil, errors.New("dnspod: the configuration of the DNS provider is nil")
	}

	if config.LoginToken == "" {
		return nil, errors.New("dnspod: credentials missing")
	}

	params := dnspod.CommonParams{LoginToken: config.LoginToken, Format: "json"}

	client := dnspod.NewClient(params)
	client.HTTPClient = config.HTTPClient

	return &DNSProvider{client: client, config: config}, nil
}

// Present creates a TXT record to fulfill the dns-01 challenge.
func (d *DNSProvider) Present(domain, token, keyAuth string) error {
	fqdn, value := dns01.GetRecord(domain, keyAuth)
	zoneID, zoneName, err := d.getHostedZone(domain)
	if err != nil {
		return err
	}

	recordAttributes := d.newTxtRecord(zoneName, fqdn, value, d.config.TTL)
	_, _, err = d.client.Records.Create(zoneID, *recordAttributes)
	if err != nil {
		return fmt.Errorf("API call failed: %w", err)
	}

	return nil
}

// CleanUp removes the TXT record matching the specified parameters.
func (d *DNSProvider) CleanUp(domain, token, keyAuth string) error {
	fqdn, _ := dns01.GetRecord(domain, keyAuth)

	records, err := d.findTxtRecords(domain, fqdn)
	if err != nil {
		return err
	}

	zoneID, _, err := d.getHostedZone(domain)
	if err != nil {
		return err
	}

	for _, rec := range records {
		_, err := d.client.Records.Delete(zoneID, rec.ID)
		if err != nil {
			return err
		}
	}
	return nil
}

// Timeout returns the timeout and interval to use when checking for DNS propagation.
// Adjusting here to cope with spikes in propagation times.
func (d *DNSProvider) Timeout() (timeout, interval time.Duration) {
	return d.config.PropagationTimeout, d.config.PollingInterval
}

func (d *DNSProvider) getHostedZone(domain string) (string, string, error) {
	zones, _, err := d.client.Domains.List()
	if err != nil {
		return "", "", fmt.Errorf("API call failed: %w", err)
	}

	authZone, err := dns01.FindZoneByFqdn(dns01.ToFqdn(domain))
	if err != nil {
		return "", "", err
	}

	var hostedZone dnspod.Domain
	for _, zone := range zones {
		if zone.Name == dns01.UnFqdn(authZone) {
			hostedZone = zone
		}
	}

	if hostedZone.ID == "" || hostedZone.ID == "0" {
		return "", "", fmt.Errorf("zone %s not found in dnspod for domain %s", authZone, domain)
	}

	return fmt.Sprintf("%v", hostedZone.ID), hostedZone.Name, nil
}

func (d *DNSProvider) newTxtRecord(zone, fqdn, value string, ttl int) *dnspod.Record {
	name := extractRecordName(fqdn, zone)

	return &dnspod.Record{
		Type:  "TXT",
		Name:  name,
		Value: value,
		Line:  "默认",
		TTL:   strconv.Itoa(ttl),
	}
}

func (d *DNSProvider) findTxtRecords(domain, fqdn string) ([]dnspod.Record, error) {
	zoneID, zoneName, err := d.getHostedZone(domain)
	if err != nil {
		return nil, err
	}

	recordName := extractRecordName(fqdn, zoneName)

	var records []dnspod.Record
	result, _, err := d.client.Records.List(zoneID, recordName)
	if err != nil {
		return records, fmt.Errorf("API call has failed: %w", err)
	}

	for _, record := range result {
		if record.Name == recordName {
			records = append(records, record)
		}
	}

	return records, nil
}

func extractRecordName(fqdn, zone string) string {
	name := dns01.UnFqdn(fqdn)
	if idx := strings.Index(name, "."+zone); idx != -1 {
		return name[:idx]
	}
	return name
}