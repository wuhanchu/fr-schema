pipeline {
    agent any
    stages {
        

        stage('Build') { 
            agent {
                docker {
                    image 'node:lts-alpine' 
                    args '-v jenkins-data:/var/jenkins_home -v jenkins_yarn_cache:/usr/local/share/.cache/yarn' 
                }
            }
            steps{
                sh 'yarn config set registry https://registry.npm.taobao.org && yarn install'
                sh 'npm run build'
            }
        }

        stage('Docker Build') {
            steps{
                sh 'docker build . -f ./docker/Dockerfile.hub -t server.aiknown.cn:31003/library/z_antd_design_pro_strater:master' 
            }
        }

        stage('Push') {
            when {
              expression {
                currentBuild.result == null || currentBuild.result == 'SUCCESS' 
              }
            }
            steps {
                withDockerRegistry(registry: [uri: "server.aiknown.cn:31003", credentialsId: 'dataknown_harbor']) {
                    sh 'docker push server.aiknown.cn:31003/library/z_antd_design_pro_strater:master'
                    sh 'docker rmi server.aiknown.cn:31003/library/z_antd_design_pro_strater:master'
                }
            }
        }

        stage('Deploy') {
            steps{
                sshagent(credentials : ['centos']) {
                    sh "docker pull server.aiknown.cn:31003/library/z_antd_design_pro_strater:master"
                    sh "docker run server.aiknown.cn:31003/z_antd_design_pro_strater -p 8080:80 --name z_antd_design_pro_strater_master z_antd_design_pro_strater:master"
                }
            }
        }
    }
}