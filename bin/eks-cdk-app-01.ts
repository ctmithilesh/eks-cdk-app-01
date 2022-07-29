#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { EksCdkApp01Stack } from '../lib/eks-cdk-app-01-stack';

const app = new cdk.App();
new EksCdkApp01Stack(app, 'EksCdkApp01Stack');
