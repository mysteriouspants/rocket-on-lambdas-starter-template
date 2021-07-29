#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CdkStack } from '../lib/cdk-stack';
import { DnsStack } from '../lib/dns-stack';

const app = new cdk.App();
const [
  wwwRecordName, apiRecordName, domainName
] = ['www', 'api', 'example.com'];

const dnsStack = new DnsStack(app, 'DnsStack', {
  domainName,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  },
});

new CdkStack(app, 'BetaExampleInfraStack', {
  domainName, wwwRecordName: `beta-${wwwRecordName}`,
  apiRecordName: `beta-${apiRecordName}`,
  zone: dnsStack.zone, cert: dnsStack.cert,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  },
});

new CdkStack(app, 'ExampleInfraStack', {
  domainName, wwwRecordName, apiRecordName, redirects: true,
  zone: dnsStack.zone, cert: dnsStack.cert,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  },
});
