import * as acm from '@aws-cdk/aws-certificatemanager';
import * as apigw from '@aws-cdk/aws-apigatewayv2';
import * as apigwi from '@aws-cdk/aws-apigatewayv2-integrations';
import * as awslogs from '@aws-cdk/aws-logs';
import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as route53 from '@aws-cdk/aws-route53';
import * as route53Targets from '@aws-cdk/aws-route53-targets';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3deploy from '@aws-cdk/aws-s3-deployment';

export interface CustomStackProps {
  domainName: string,
  wwwRecordName: string,
  apiRecordName: string,
}

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: cdk.StackProps & CustomStackProps) {
    super(scope, id, props);

    const { wwwRecordName, apiRecordName, domainName } = props;
    const zone = route53.HostedZone.fromLookup(this, 'HostedZone', { domainName });
    const cert = new acm.Certificate(this, 'DomainCertificate', {
      domainName,
      validation: acm.CertificateValidation.fromDns(zone),
      subjectAlternativeNames: [`*.${domainName}`],
    });

    const rustVersion = '1.53';
    const target = 'x86_64-unknown-linux-musl';
    const apiLambda = new lambda.Function(this, 'ApiHandler', {
      code: lambda.Code.fromAsset('../api-lambda', {
        bundling: {
          command: [
            'bash', '-c',
            `rustup target add ${target} && \
             cargo build --release --target ${target} && \
             cp target/${target}/release/bootstrap /asset-output/bootstrap`
          ],
          image: cdk.DockerImage.fromRegistry(`rust:${rustVersion}-slim`),
        }
      }),
      functionName: domainName.split('.')[0] + '-api',
      handler: 'main',
      runtime: lambda.Runtime.PROVIDED_AL2,
      logRetention: awslogs.RetentionDays.ONE_MONTH,
    });

    const apiGwCustomDomain = new apigw.DomainName(this, 'ApiGatewayDomain', {
      domainName: [apiRecordName, domainName].join('.'),
      certificate: cert,
    });

    new apigw.HttpApi(this, 'ApiEndpoint', {
      defaultIntegration: new apigwi.LambdaProxyIntegration({
        handler: apiLambda,
        payloadFormatVersion: apigw.PayloadFormatVersion.VERSION_2_0,
      }),
      defaultDomainMapping: {
        domainName: apiGwCustomDomain,
        mappingKey: 'latest',
      },
      corsPreflight: {
        allowOrigins: [
          'http://' + [wwwRecordName, domainName].join('.')
        ],
        allowCredentials: true,
        allowMethods: [
          apigw.CorsHttpMethod.ANY,
        ],
      },
    });

    new route53.ARecord(this, 'ApiARecord', {
      zone, recordName: apiRecordName,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.ApiGatewayv2DomainProperties(
          apiGwCustomDomain.regionalDomainName,
          apiGwCustomDomain.regionalHostedZoneId,
        )
      )
    });

    const redirectBucket = new s3.Bucket(this, 'RedirectBucket', {
      bucketName: domainName,
      websiteRedirect: { hostName: `${wwwRecordName}.${domainName}` },
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    new route53.ARecord(this, `RedirectBucketARecord`, {
      zone, recordName: domainName,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.BucketWebsiteTarget(redirectBucket)
      ),
    });

    const websiteBucket = new s3.Bucket(this, 'ReactWebsiteBucket', {
      bucketName: [wwwRecordName, domainName].join('.'),
      websiteIndexDocument: 'index.html',
      publicReadAccess: true,
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [
        s3deploy.Source.asset('../react-website', {
          bundling: {
            command: [
              'bash', '-c',
              'npm i && npm run build && cp -r build/. /asset-output/'
            ],
            image: cdk.DockerImage.fromRegistry('node:latest'),
          }
        })
      ],
      destinationBucket: websiteBucket,
    });

    new route53.ARecord(this, 'WwwBucketARecord', {
      zone, recordName: wwwRecordName,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.BucketWebsiteTarget(websiteBucket)
      ),
    });
  }
}
