pipeline {
  agent any

    stages {
        // stage('Maven Build') {
        //     steps {
        //         sh 'mvn clean install'
        //    }
        //          // Post building archive Java application

        //     post {
        //         success {
        //             archiveArtifacts artifacts: '**/target/*.jar'
        //         }
        //     }
        
        // }
        // stage('Maven test'){
        //     steps {
        //         sh 'mvn test'
        //     }
        // }
        stage('Build Docker Image') {
            steps {
                    // withCredentials([usernamePassword(credentialsId: 'dockerhub', passwordVariable: 'password', usernameVariable: 'username')]) {
                sh """ 
                    docker build . -t  projectimage
                    """
                } 
            }
        }
        stage('deploy the javaApp'){
            steps{
                sh """
                    docker stop projectcontainer || true && docker rm projectcontainer || true
                    docker run --name  projectcontainer -d -p 8081:4000 projectimage
                    docker rmi --force projectimage || true
                """
            }
        }
    }
}







// pipeline {
//   agent {label 'ballo'}
//   stages {
//     stage('Clone Repository') {
//       steps {
//         git branch: 'main', url: 'https://github.com/AbdelrhmanAli123/docker-deploy-website'
//       }
//     }
//     stage('Build Docker Image') {
//       steps {
//           withCredentials([usernamePassword(credentialsId: 'dockerhub', passwordVariable: 'password', usernameVariable: 'username')]) {
//           sh """ 
//           docker build . -t abdelrhmandevops/helllllo
//           docker login -u ${username} -p ${password}
//           docker push abdelrhmandevops/helllllo
//           """
          
//     // some block
//         }
//       }
//     }
//   }
// }
