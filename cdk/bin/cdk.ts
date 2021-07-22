#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CdkStack } from '../lib/cdk-stack';

const app = new cdk.App();
const [wwwRecordName, apiRecordName, domainName] = ['www', 'api', 'example.com'];

new CdkStack(app, 'ExampleInfaStack', {
  domainName, wwwRecordName, apiRecordName,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  },
});
