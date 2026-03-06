@Library('devops-shared-lib@main') _

ciPipeline(
  serviceName: 'frontend-service',
  enableDeploy: false,
  dockerRepo: 'cesarnunezh/frontend-service',
  localImageName: 'frontend-service:ci-local',
  imageBuildCmd: 'make build',
  buildCmd: 'make setup',
  lintCmd: 'make lint',
  testCmd: 'make test',
  securityCmd: 'make scan',
  deployRepo: 'https://github.com/cesarnunezh/DevOpsProject.git'
)
