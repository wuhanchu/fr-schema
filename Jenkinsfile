pipeline {
    stages {
        stage('Build') { 
            agent {
                docker {
                    image 'node:lts-alpine' 
                    args '-p 3000:3000 -v $HOME/workspace:/var/jenkins_home/workspace -v ' 
                }
            }
            steps{
                sh 'npm install -g yarn'
                sh 'yarn install'
            }
        }

        stage('Docker Build') {
            sh 'docker build . -f /docker/Dockerfile.hub -t asus.uglyxu.cn:35744/z_antd_design_pro_strater:master' 
        }

        stage('Push') {
            when {
              expression {
                currentBuild.result == null || currentBuild.result == 'SUCCESS' 
              }
            }
            steps {
                sh 'docker push asus.uglyxu.cn:35744/z_antd_design_pro_strater:master'
                sh 'docker rmi asus.uglyxu.cn:35744/z_antd_design_pro_strater:master
            }
        }

        stage('Deploy') {
            sh "docker pull asus.uglyxu.cn:35744/z_antd_design_pro_strater:master"
            sh "docker run asus.uglyxu.cn:35744/z_antd_design_pro_strater -p 8080:80 --name z_antd_design_pro_strater_master z_antd_design_pro_strater:master"
        }
    }
}