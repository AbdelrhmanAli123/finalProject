pipeline {
  agent {label 'ballo'}

    stages {
        stage('Maven Build') {
            steps {
                sh 'mvn clean install'
           }
                 // Post building archive Java application

            post {
                success {
                    archiveArtifacts artifacts: '**/target/*.jar'
                }
            }
        
        }
        stage('Maven test'){
            steps {
                sh 'mvn test'
            }
        }
        stage('Build Docker Image') {
            steps {
                    withCredentials([usernamePassword(credentialsId: 'dockerhub', passwordVariable: 'password', usernameVariable: 'username')]) {
                sh """ 
                    docker build . -t  javaimage:latest
                    docker tag javaimage abdelrhmandevops/javaimage:latest
                    docker login -u ${username} -p ${password}
                    docker push abdelrhmandevops/javaimage:latest
                    """
                } 
            }
        }
        stage('deploy the javaApp'){
            steps{
                sh """
                    docker stop javaApp || true && docker rm javaApp || true
                    docker pull abdelrhmandevops/javaimage
                    docker run --name javaApp -d -p 8081:8081 palakbhawsar/javawebapp
                """
            }
        }
    }
}







pipeline {
  agent {label 'ballo'}
  stages {
    stage('Clone Repository') {
      steps {
        git branch: 'main', url: 'https://github.com/AbdelrhmanAli123/docker-deploy-website'
      }
    }
    stage('Build Docker Image') {
      steps {
          withCredentials([usernamePassword(credentialsId: 'dockerhub', passwordVariable: 'password', usernameVariable: 'username')]) {
          sh """ 
          docker build . -t abdelrhmandevops/helllllo
          docker login -u ${username} -p ${password}
          docker push abdelrhmandevops/helllllo
          """
          
    // some block
        }
      }
    }
  }
}
