pipeline {
  agent {label 'ubuntu'}
      stages{
        stage('Build Docker Image') {
            steps {
                sh """ 
                    docker build . -t  projectimage
                    docker tag projectimage projectimage:${BUILD_NUMBER}
                    """
            }
        }
        stage('deploy the javaApp'){
            steps{
                sh """
                    docker stop projectcontainer || true && docker rm projectcontainer || true
                    docker run --name  projectcontainer -d -p 8081:4000 projectimage:${BUILD_NUMBER}
                """
            }
        }
        stage('Clean Up Docker Images') {
            steps {
                sh """
                    docker rmi --force \$(docker images -f "dangling=true" -q) || true
                    docker rmi --force projectimage:${BUILD_NUMBER} || true
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