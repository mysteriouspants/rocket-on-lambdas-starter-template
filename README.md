# Rust+Lambda/ReactJS Starter Template

A starter template to get going with Rust+Rocket on AWS Lambda, with a
ReactJS frontend thrown in for good measure. Designed for ease of
deployment and economy of cost!

Explained in some detail at [this blog post][the-blog].

## Quickstart

Have an AWS account, get it set up with AWS CLI. Install CDK using
`npm i -g typescript aws-cdk@1.114.0`. Get a domain name set up in Route53.
Fill it in at `cdk/bin/cdk.ts`. Run `cdk deploy` in `cda/` to put your lambda
in the cloud. Tinker and experiment to your heart's delight!

## License

We want you to be able to use this software regardless of who you may be, what
you are working on, or the environment in which you are working on it - we hope
you'll use it for good and not evil! To this end, this starter template
code is licensed under the [2-clause BSD][2cbsd] license, with other licenses
available by request. Happy coding!

[2cbsd]: https://opensource.org/licenses/BSD-2-Clause
[the-blog]: https://www.mysteriouspants.com/2021/07/21/reactive-rocket-on-lambda.html

