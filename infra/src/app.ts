#!/usr/bin/env node
import type { StackProps } from "aws-cdk-lib";
import { App, Stage } from "aws-cdk-lib";
import { RemovalPolicies } from "aws-cdk-lib/core";
import { existsSync } from "node:fs";

import type { StageConfig } from "./stacks";
import { configureStacks, DomainStack, MailStack } from "./stacks";

const DOMAIN_NAME = "malomart.link";

if (existsSync(".env")) {
  process.loadEnvFile();
}

const app = new App();
const env: StackProps["env"] = { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION };

const domainStack = new DomainStack(app, "MaloMartDomain", { env, domainName: DOMAIN_NAME });
new MailStack(app, "MaloMartMail", {
  env,
  zone: domainStack.zone,
  inboxDomain: `inbox.${DOMAIN_NAME}`,
  alarmEmail: process.env.DEV_ALARM_EMAIL,
  forwarding: process.env.CONTACT_FORWARD_EMAIL
    ? { recipients: [`contact@${DOMAIN_NAME}`], to: process.env.CONTACT_FORWARD_EMAIL }
    : undefined
});

const stages: Record<string, { env: StackProps["env"]; config: StageConfig; retainData?: boolean }> = {
  Dev: {
    env,
    config: {
      siteDomain: { zoneName: DOMAIN_NAME, hostName: `dev.${DOMAIN_NAME}` },
      emailDomain: DOMAIN_NAME,
      alarmEmail: process.env.DEV_ALARM_EMAIL,
      fulfillmentTimeScale: 0.1,
      localDevOrigin: "http://localhost:5173",
      googleAuth: {
        authDomain: { zoneName: DOMAIN_NAME, hostName: `auth.dev.${DOMAIN_NAME}` },
        secretName: "malomart/dev/google-oauth"
      }
    }
  },
  Prod: {
    env,
    retainData: true,
    config: {
      siteDomain: { zoneName: DOMAIN_NAME, hostName: DOMAIN_NAME },
      redirectWww: true,
      emailDomain: DOMAIN_NAME,
      alarmEmail: process.env.PROD_ALARM_EMAIL,
      googleAuth: {
        authDomain: { zoneName: DOMAIN_NAME, hostName: `auth.${DOMAIN_NAME}` },
        secretName: "malomart/prod/google-oauth"
      }
    }
  }
};

for (const [stageName, { env, config, retainData }] of Object.entries(stages)) {
  const stage = new Stage(app, `MaloMart${stageName}`, {
    env,
    stageName
  });
  configureStacks(stage, config);
  RemovalPolicies.of(stage).destroy();
  if (retainData) {
    RemovalPolicies.of(stage).retain({
      applyToResourceTypes: ["AWS::DynamoDB::Table", "AWS::Cognito::UserPool", "AWS::KMS::Key"]
    });
  }
}

app.synth();
