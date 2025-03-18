# time-tracker
Track your work time against multiple work types and projects.

## Roadmap

### Priority
1. Lazyload the log data as sometimes it takes ~3s to load a years worth of data. Looks like the api call is still ~100ms so the rate limiter may be populating the DOM.
2. Add a loading spinner to the import data section. Large imports can hang with no feedback and feel broken.

### Nice to Have
1. Don't call an API Post when there is no change to the input on a cell in the log or settings.
2. Combine projects and categories into one data type to avoid repeating code. This may be a very large backend refactor with minimal benefits.
3. Fix import so that text can contain commas and quotes. Currently csv processing is manual and simple, not allowing commas while quote behavior is untested.

## How to Deploy on RPI
1. GOOS=linux GOARCH=arm go build -o time-tracker
2. docker buildx build --platform=linux/arm64/v8 --push . -t adamzaghloul/time-tracker
    Taken from https://stackoverflow.com/questions/70757791/build-linux-arm64-docker-image-on-linux-amd64-host
3. On RPI: docker pull adamzaghloul/time-tracker
4. docker run -d -p 80:8080 --env-file .env adamzaghloul/time-tracker
