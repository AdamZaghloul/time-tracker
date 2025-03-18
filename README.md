# time-tracker
Track your work time against multiple work types and projects.

## Deploy on RPI
1. GOOS=linux GOARCH=arm go build -o time-tracker
2. docker buildx build --platform=linux/arm64/v8 --push . -t adamzaghloul/time-tracker
    Taken from https://stackoverflow.com/questions/70757791/build-linux-arm64-docker-image-on-linux-amd64-host
3. On RPI: docker pull adamzaghloul/time-tracker
4. docker run -d -p 80:8080 --env-file .env adamzaghloul/time-tracker
