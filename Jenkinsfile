pipeline {
    agent any
    stages {
        stage('Build') { 
            agent {
                docker {
                    image 'node:lts-alpine' 
                    args '-v $HOME/workspace:/var/jenkins_home/workspace' 
                }
            }
            steps{
                sh 'npm install -g yarn'
                sh 'yarn install'
                sh 'npm run build'
            }
        }

        stage('Docker Build') {
            steps{
                sh 'docker build . -f ./docker/Dockerfile.hub -t asus.uglyxu.cn:35744/z_antd_design_pro_strater:master' 
            }
        }

        stage('Push') {
            when {
              expression {
                currentBuild.result == null || currentBuild.result == 'SUCCESS' 
              }
            }
            steps {
                sh 'docker push asus.uglyxu.cn:35744/z_antd_design_pro_strater:master'
                sh 'docker rmi asus.uglyxu.cn:35744/z_antd_design_pro_strater:master'
            }
        }

        stage('Deploy') {
            steps{
                sh "docker pull asus.uglyxu.cn:35744/z_antd_design_pro_strater:master"
                sh "docker run asus.uglyxu.cn:35744/z_antd_design_pro_strater -p 8080:80 --name z_antd_design_pro_strater_master z_antd_design_pro_strater:master"
            }
        }
    }
}