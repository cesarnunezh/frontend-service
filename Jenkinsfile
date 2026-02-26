pipeline {
  agent any
  stages {
    stage('Checkout') {
      steps { checkout scm }
    }
    stage('Setup') {
      steps { sh 'make setup' }
    }
    stage('Lint') {
      steps { sh 'make lint' }
    }
    stage('Test') {
      steps { sh 'make test' }
    }
    stage('Build') {
      steps { sh 'make build' }
    }
    stage('Docker Build') {
      steps { sh 'docker build -t frontend-service:local .' }
    }
  }
}
