pipeline {

    agent {
        docker {
            image 'node:lts-alpine' 
            args '-p 3000:3000 -v $HOME/workspace:/var/jenkins_home/workspace' 
        }

    }
    stages {
        stage('Build') { 
            sh 'npm install -g yarn'
            sh 'yarn install'
            sh 'docker build . -f /docker/Dockerfile.hub -t z_antd_design_pro_strater' 
        }

        stage('Push') {
            when {
              expression {
                currentBuild.result == null || currentBuild.result == 'SUCCESS' 
              }
            }
            steps {
                sh 'docker publish z_antd_design_pro_strater'
            }
        }

        stage('Deploy') {
            sh "docker rm z_antd_design_pro_strater_dev "
            sh "docker rm z_antd_design_pro_strater_dev "
        }
    }
}