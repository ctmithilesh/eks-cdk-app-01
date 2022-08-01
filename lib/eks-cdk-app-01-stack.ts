import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as eks from 'aws-cdk-lib/aws-eks'
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling'
import { Construct } from 'constructs';

export class EksCdkApp01Stack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    
    const vpc = new ec2.Vpc(this, 'EKSVpc');  // Create a new VPC for our cluster

     // IAM role for our EC2 worker nodes
     const workerRole = new iam.Role(this, 'EKSWorkerRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com')
    })

    const eksCluster = new eks.Cluster(this, 'Cluster', {
      vpc: vpc,
      defaultCapacity: 0,  // we want to manage capacity our selves
      version: eks.KubernetesVersion.V1_21,
      clusterLogging:[
        eks.ClusterLoggingTypes.API,
        eks.ClusterLoggingTypes.AUTHENTICATOR,
        eks.ClusterLoggingTypes.SCHEDULER
      ]
    });

    

    const onDemandASG = new autoscaling.AutoScalingGroup(this, 'OnDemandASG', {
      vpc: vpc,
      role: workerRole,
      minCapacity: 1,
      maxCapacity: 10,
      instanceType: new ec2.InstanceType('t3.medium'),
      machineImage: new eks.EksOptimizedImage({
        kubernetesVersion: '1.21',
        nodeType: eks.NodeType.STANDARD  // without this, incorrect SSM parameter for AMI is resolved
      }),
      updatePolicy: autoscaling.UpdatePolicy.rollingUpdate()
      });

      eksCluster.connectAutoScalingGroupCapacity(onDemandASG, {});

  }
}
