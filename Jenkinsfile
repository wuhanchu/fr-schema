pipeline {
    triggers {
        pollSCM ('* * * * *')
    }
    
    agent {
        label 'master'
    }

    environment {
        GROUP = "z_know_info"
        PROJECT = "z_know_info_web"
    }

    stages {
        stage('Build') {
            agent {
                docker {
                     reuseNode true
                    alwaysPull true
                    image 'server.aiknown.cn:31003/flask_rest_frame/node:lts-alpine'
                    registryUrl 'https://server.aiknown.cn:31003' 
                    registryCredentialsId 'harbor'
                    args '-v jenkins:/var/jenkins_home -v jenkins_yarn_cache:/usr/local/share/.cache/yarn' 
                }
            }
            steps{
                sh 'pwd'
                sh 'yarn config set registry https://registry.npm.taobao.org && yarn install --prefer-offline --ignore-optional'
                sh 'npm run build'
            }
        }

        stage('Docker Build') {
            steps{
                sh 'pwd'
                sh 'docker build . -f ./docker/Dockerfile.hub -t server.aiknown.cn:31003/${GROUP}/${PROJECT}:${BRANCH_NAME}'
            }
        }

        stage('Push') {
            when {
              expression {
                currentBuild.result == null || currentBuild.result == 'SUCCESS'
              }
            }
            steps {
                withDockerRegistry(registry: [url: "https://server.aiknown.cn:31003", credentialsId: 'harbor']) {
                    sh 'docker push server.aiknown.cn:31003/${GROUP}/${PROJECT}:${BRANCH_NAME}'
                    sh 'docker rmi server.aiknown.cn:31003/${GROUP}/${PROJECT}:${BRANCH_NAME}'
                }
            }
        }

        stage('Deploy') {
            parallel {
                stage('Deploy Develop') {
                    when {
                        branch 'develop'
                     }

                     

                    steps {         
                        sshagent(credentials : ['dataknown_dev']) {
                             sh "ssh   root@192.168.1.150 'docker pull server.aiknown.cn:31003/${GROUP}/${PROJECT}:${BRANCH_NAME} &&  docker rm -f  ${PROJECT}; docker run --restart=always -d -p 8083:80 -e SERVER_URL=http://127.0.0.1:5000 --name ${PROJECT} server.aiknown.cn:31003/${GROUP}/${PROJECT}:${BRANCH_NAME};'"
                        }
                    }
                }
            }
        }
    }
}
 