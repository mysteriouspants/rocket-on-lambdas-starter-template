import * as acm from '@aws-cdk/aws-certificatemanager';
import * as cdk from '@aws-cdk/core';
import * as route53 from '@aws-cdk/aws-route53';

export interface CustomStackProps {
  domainName: string,
}

export class DnsStack extends cdk.Stack {
  readonly zone: route53.IHostedZone;
  readonly cert: acm.ICertificate;

  constructor(
    scope: cdk.Construct, id: string,
    props: cdk.StackProps & CustomStackProps
  ) {
    super(scope, id, props);
    const { domainName } = props;

    this.zone = route53.HostedZone.fromLookup(
      this, 'HostedZone', { domainName }
    );
    this.cert = new acm.Certificate(this, 'DomainCertificate', {
      domainName,
      validation: acm.CertificateValidation.fromDns(this.zone),
      subjectAlternativeNames: [`*.${domainName}`],
    });
  }
}
