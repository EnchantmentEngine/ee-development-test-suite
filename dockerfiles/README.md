
# Bot-tests

- Dockerfile_bot

    - In this Dockerfile we have use Ubuntu image. 
    - Then we have Install nodejs and chrome in Ubuntu image.
    - Cloned EtherealEngine repository
    - Then change WORKDIR and installed ee-development-test-suite and ir-bot in this path /etherealengine/packages/projects/projects/
    - Then we have change WORKDIR to etherealengine and copied the env's to .env.local
    - Then we have installed dependencies of etherealengine.
    - Pass ENV APP_HOST=default-value to pass env when we run the Dockerfile_bot
    - Then we have run the command to execute the tests in container

    - Building the Dockerfile_bot

            `docker build -t image_name -f Dockerfile_bot.`
    
    - Running the Docker_image
             
            `docker run -e APP_HOST=mydomain.com image_name`
            e.g.
            `docker run -e APP_HOST=test2.etherealengine.com image_name`
        So this will run the tests locally 

- Creating cronjob for above Dockerfile_bot
    
    - Cron Job for Running ir-bot Tests
        
    - Cron.yaml

            apiVersion: batch/v1
            kind: CronJob
            metadata:
                name: ir-bot-test-run
            spec:
              schedule: "0 * * * *"  # Run every hour
            jobTemplate:
              spec:
                template:
                  spec:
                    containers:
                    - name: e2e-test
                      image: ashishaes/ir-bot:latest  # Replace with your Docker image and tag
                      env: 
                      - name:  APP_HOST
                        value: "test2.etherealengine.com" #Pass domain on which you have to perform bot-testing
                    restartPolicy: Never

       - This cron job is designed to run periodic tests using the ir-bot tool. It is configured to run every hour.

    - Cron Job Configuration

           The cron job is defined using Kubernetes cron job resource. It is configured to use the Docker image `image_name` and runs a job that consists of a container named `e2e-test`.

    -  Environment Variable

            To configure the test environment, the `APP_HOST` environment variable is set within the CronJob configuration. It specifies the host URL that the e2e test will interact with. In this cronjob, the value is set to "test2.etherealengine.com".


    - Schedule

            The cron job is scheduled to run every hour using the following cron expression:

            0 * * * *
    - If you want to run cronjob into Cluster run this command  
            
            kubectl apply -f cron.yaml 

-  Kubernetes Job: ir-bot-test-job

        This Kubernetes Job is designed to run a bot-testing task using a specified Docker image (`ashishaes/ir-bot:latest`). The task is configured to use the environment variable `APP_HOST` with the value set to "test2.etherealengine.com"
    - ir-bot-test-job.yaml

            apiVersion: batch/v1
            kind: Job
            metadata:
              name: ir-bot-test-job
            spec:
              template:
                spec:
                  containers:
                  - name: e2e-test
                    image: ashishaes/ir-bot:latest
                    env: 
                    - name: APP_HOST
                      value: "test2.etherealengine.com"
                 restartPolicy: Never
    - Create the Job:
            
            kubectl apply -f ir-bot-test-job.yaml
    

     

