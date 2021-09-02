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

        SERVER_DEV = "192.168.100.152"

        SERVER_TEST = "192.168.1.34"
    }

    stages {
        stage('READY') {
            steps{
                sh 'echo ${BRANCH_NAME}'
                sh 'echo ${TAG_NAME}'
            }
        }

        stage('Build') {
            parallel {
                stage('Build Dataknown') {
                    agent {
                        docker {
                            reuseNode true
                            alwaysPull true
                            image 'node:lts-alpine'

                            args '-v jenkins:/var/jenkins_home -v jenkins_yarn_cache:/usr/local/share/.cache/yarn'
                        }
                    }

                    when {
                        anyOf {branch 'master'; tag '*datanown*'}
                     }

                    steps{
                        sh 'pwd'
                        sh 'yarn config set registry https://registry.npm.taobao.org && yarn install --prefer-offline --ignore-optional'
                        sh 'npm run build:dataknown'
                    }
                }

                stage('Build Standard') {
                    when {
                       anyOf {
                        //    branch 'develop'; 
                           allOf{ buildingTag();  
                           not { tag '*datanown*'}}}
                     }

                     agent {
                        docker {
                            reuseNode true
                            alwaysPull true
                            image 'node:lts-alpine'
                            args '-v jenkins:/var/jenkins_home -v jenkins_yarn_cache:/usr/local/share/.cache/yarn'
                        }
                    }

                    steps {
                        sh 'pwd'
                        sh 'yarn config set registry https://registry.npm.taobao.org && yarn install --prefer-offline --ignore-optional'
                        sh 'npm run build'
                    }
                }
            }
        }

        stage('Docker Build') {
            parallel {
                stage('Docker Build Branch') {
                     when {
                         anyOf {
                            branch 'master'
                            // branch 'develop'
                        }
                    }

                    steps{
                        sh 'pwd'
                        sh 'docker build . -f ./docker/Dockerfile.hub -t server.aiknown.cn:31003/${GROUP}/${PROJECT}:${BRANCH_NAME}'
                    }
                }

                stage('Docker Build Tag') {
                    when { buildingTag()}
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
                    when {
                         anyOf {
                            branch 'master'
                            // branch 'develop'
                        }
                    }
                    steps {
                        withDockerRegistry(registry: [url: "https://server.aiknown.cn:31003", credentialsId: 'harbor']) {
                            sh 'docker push server.aiknown.cn:31003/${GROUP}/${PROJECT}:${BRANCH_NAME}'
                            sh 'docker rmi server.aiknown.cn:31003/${GROUP}/${PROJECT}:${BRANCH_NAME}'
                        }
                    }
                }

                stage('Push Tag') {
                    when { buildingTag() }

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
                // stage('Deploy Develop') {
                //     when {
                //         branch 'develop'
                //      }

                //     steps {
                //         sshagent(credentials : ['dataknown_dev']) {
                //              sh "ssh  -t  root@${SERVER_DEV} -o StrictHostKeyChecking=no  'cd /root/project/maintenance_script && docker-compose -f ./compose/z_know_info.yml -p dataknown --env-file ./env/dataknown_dev.env pull &&  docker-compose -f ./compose/z_know_info.yml -p dataknown --env-file ./env/dataknown_dev.env up -d'"
                //         }
                //     }
                // }

                stage('Deploy Test') {
                    when {
                        branch 'master'
                     }

                    steps {
                        sshagent(credentials : ['dataknown_test']) {
                             sh "ssh  -t  root@${SERVER_TEST} -o StrictHostKeyChecking=no  'cd /root/project/maintenance_script && docker-compose -f ./compose/z_know_info.yml -f ./consumer/dataknown/z_know_info_test.yml -p dataknown  --env-file ./env/dataknown_test.env pull &&  docker-compose -f ./compose/z_know_info.yml -f ./consumer/dataknown/z_know_info_test.yml -p dataknown  --env-file ./env/dataknown_test.env up -d'"
                        }
                    }
                }
            }
        }
    }

    post {
        failure {
            emailext (
                subject: "FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
                body: """<p>FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]':</p>
                    <p>Check console output at "<a href="${env.BUILD_URL}">${env.JOB_NAME} [${env.BUILD_NUMBER}]</a>"</p>""",
                to: "xujinhao@dataknown.cn"
            )
        }
    }
}
