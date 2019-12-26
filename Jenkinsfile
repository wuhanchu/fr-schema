pipeline {
    agent {
        docker {
            image 'node:lts-alpine' 
            args '-p 3000:3000 -v $HOME/.m2:/var/jenkins_home/workspace' 
        }
    }
    stages {
        stage('Build') { 
            steps {
                sh 'npm install -g yarn;yarn install' 
            }
        }
    }
}