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

        SERVER_DEV = "192.168.1.150"
        SERVER_URL_DEV = "http://172.17.0.1:32029"
        AUTH_URL_DEV  = "http://172.17.0.1:32024"
        PORT_DEV  = "32030"

        SERVER_TEST = "192.168.1.34"
        SERVER_URL_TEST = "http://172.17.0.1:40017"
        AUTH_URL_TEST = "http://172.17.0.1:40016"
        PORT_TEST  = "40010"
    }

    stages {
        stage('READY') {
            steps{
                sh 'echo ${TAG_NAME}'
            }
        }

        stage('Npm Build') {
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

            parallel {
                stage('Deploy Dataknown') {
                    when {
                        anyOf {branch 'develop'; tag '*datanown*'}
                     }

                    steps{
                        sh 'pwd'
                        sh 'yarn config set registry https://registry.npm.taobao.org && yarn install --prefer-offline --ignore-optional'
                        sh 'npm run build:dataknown'
                    }
                }

                stage('Deploy Standard') {
                    when {
                        allOf{ branch 'master'; buildingTag(); not { tag '*datanown* '}}
                     }

                    steps {
                        sshagent(credentials : ['dataknown_test']) {
                             sh "ssh  -t  root@${SERVER_TEST} -o StrictHostKeyChecking=no  'docker pull server.aiknown.cn:31003/${GROUP}/${PROJECT}:${TAG_NAME} &&  docker rm -f  ${PROJECT}; docker run --restart=always -d -p ${PORT_TEST}:80 -e SERVER_URL=${SERVER_URL_TEST} -e AUTH_URL=${AUTH_URL_TEST} --name ${PROJECT} server.aiknown.cn:31003/${GROUP}/${PROJECT}:${TAG_NAME};'"
                        }
                    }
                }
            }
        }

        stage('Docker Build') {
            parallel {
                stage('Docker Build Branch') {
                    steps{
                        sh 'pwd'
                        sh 'docker build . -f ./docker/Dockerfile.hub -t server.aiknown.cn:31003/${GROUP}/${PROJECT}:${BRANCH_NAME}'
                    }
                }

                stage('Docker Build Tag') {
                    when { allOf{ branch 'master'; buildingTag() }
                    steps{
                        sh 'docker build . -f ./docker/Dockerfile.hub -t server.aiknown.cn:31003/${GROUP}/${PROJECT}:${TAG_NAME}'
                    }
                }
            }
        }

        stage('Push') {
            when {
              expression {
                currentBuild.result == null || currentBuild.result == 'SUCCESS'
              }
            }

            parallel {
                stage('Push Branch') {
                    steps {
                        withDockerRegistry(registry: [url: "https://server.aiknown.cn:31003", credentialsId: 'harbor']) {
                            sh 'docker push server.aiknown.cn:31003/${GROUP}/${PROJECT}:${BRANCH_NAME}'
                            sh 'docker rmi server.aiknown.cn:31003/${GROUP}/${PROJECT}:${BRANCH_NAME}'
                        }
                    }
                }

                stage('Push Tag') {
                    when { allOf{ branch 'master'; buildingTag() }}

                    steps{
                        withDockerRegistry(registry: [url: "https://server.aiknown.cn:31003", credentialsId: 'harbor']) {
                            sh 'docker push server.aiknown.cn:31003/${GROUP}/${PROJECT}:${TAG_NAME}'
                            sh 'docker rmi server.aiknown.cn:31003/${GROUP}/${PROJECT}:${TAG_NAME}'
                        }
                    }
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
                             sh "ssh  -t  root@${SERVER_DEV} -o StrictHostKeyChecking=no  'docker pull server.aiknown.cn:31003/${GROUP}/${PROJECT}:${BRANCH_NAME} &&  docker rm -f  ${PROJECT}; docker run --restart=always -d -p ${PORT_DEV}:80 -e SERVER_URL=${SERVER_URL_DEV} -e AUTH_URL=${AUTH_URL_DEV}  --name ${PROJECT} server.aiknown.cn:31003/${GROUP}/${PROJECT}:${BRANCH_NAME};'"
                        }
                    }
                }

                stage('Deploy Test') {
                    when {
                        branch 'master'
                     }

                    steps {
                        sshagent(credentials : ['dataknown_test']) {
                             sh "ssh  -t  root@${SERVER_TEST} -o StrictHostKeyChecking=no  'docker pull server.aiknown.cn:31003/${GROUP}/${PROJECT}:${TAG_NAME} &&  docker rm -f  ${PROJECT}; docker run --restart=always -d -p ${PORT_TEST}:80 -e SERVER_URL=${SERVER_URL_TEST} -e AUTH_URL=${AUTH_URL_TEST} --name ${PROJECT} server.aiknown.cn:31003/${GROUP}/${PROJECT}:${TAG_NAME};'"
                        }
                    }
                }
            }
        }
    }
}