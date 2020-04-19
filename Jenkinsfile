pipeline {
    agent any
    triggers {
        pollSCM ('* * * * *')
    }

    environment {
        GROUP = "z_know_info"
        PROJECT = "z_know_info_web"
    }

    stages {
         stage('Ready') {
            
            steps {
                sh 'docker pull server.aiknown.cn:31003/flask_rest_frame/node:lts-alpine'
            }
        }

        stage('Build') {
            agent {
                docker {
                    image 'server.aiknown.cn:31003/flask_rest_frame/node:lts-alpine'
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
                sh 'docker build . -f ./docker/Dockerfile.hub -t server.aiknown.cn:31003/${GROUP}/${PROJECT} server.aiknown.cn:31003/${GROUP}/${PROJECT}:${BRANCH_NAME}'
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
                                sh """
                                    docker pull server.aiknown.cn:31003/${GROUP}/${PROJECT}:${BRANCH_NAME}
                                    docker rm -f  ${PROJECT}
                                    docker run --restart=always -d -p 8083:80 -e SERVER_URL='http://127.0.0.1:5000' --name ${PROJECT}_master server.aiknown.cn:31003/${GROUP}/${PROJECT}:develop
                                """
                        }
                    }
                }
            }
        }
    }
}
