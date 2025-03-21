# Time Tracker
[Time Tracker](https://time.adamdevs.com) is a full stack web app that reminds you where you've been spending your time and attention after a busy day. Track your time against multiple work types and projects and get analytics to see how your focus changes over the course of weeks, months, and years.

![demo](./web/images/demo.gif)

One of Peter Drucker's main points in his book *The Effective Executive* is *How can you be effective if you don't know where you're spending your time?* You can't. It's easy to spend a whole day jumping between tasks and finish the day knowing you were busy but not quite knowing where all the time went.


There are a lot of time tracking platforms like Toggl Track or Clockify, but they seem to be geared more towards consultants billing hours to clients and come bogged down with features to allow that. I wanted something simple. Track. Categorize. Review.


So I built this time tracker -- after proving the concept in a spreadsheet system for about a year -- so that all of my work time is accounted for and I can tell which types of work and projects are really getting my care and attention. By reviewing I can come to the conclusion that either:

1. All is well and I should carry on, or
2. More likely, I need to strategize, delegate, or prune my to-do list to focus on a more important project, make meetings more efficient, or spend less time out to lunch :).

## 🚀 Quick Start

Head over to [time.adamdevs.com](https://time.adamdevs.com) and sign up!

## 📖 Usage

* Track
    * Enter your activity and submit when you're done. Rinse and repeat.
    * Automatically detects start and end times. Enter an override duration in minutes if you forgot to submit an earlier activity.
* Log
    * See all of your submitted activities and update their info by clicking on a cell if needed.
* Report
    * See the total hours spent on each category and project.
    * Drill down into years, months, and weeks, and click in to get some graphs for trending.
* Settings
    * Add categories and projects to track against your time.
    * Add automatic categorization terms to categories and projects. If any of these comma-separated terms are present in an activity name, that category or project will automatically be applied.
    * Import your own activity history CSV for tracking in the system. See downloadable template for format.
    * Export your data in CSV format.

## 🤝 Contributing

Note this assumes:
1. You have golang, postgres or other sql database, and [goose database management tool](https://github.com/pressly/goose)
2. You have a .env file
    * FILEPATH - location of frontend to serve - "./web/" by default
    * PORT - "8080" by default
    * DB_STRING - database connection string
    * JWT_SECRET - Secret for JWT authentication/authorization

### Clone the repo

```bash
git clone https://github.com/AdamZaghloul/time-tracker
cd time-tracker
```

### Run database up migrations

```bash
cd sql/schema
goose postgres <CONNECTION STRING> up
cd ../..
```

### Run the project locally

```bash
go run .
```

### Submit a pull request

If you'd like to contribute, please fork the repository and open a pull request to the `main` branch.

## FAQ

**Any plans to avoid manual data entry by automatically detetcting what you're working on based on apps, content, etc?**

No. I'm a firm believer that managing your time should not and cannot be made passive/automatic. There are platforms like RescueTime and even apple screentime that do that sort of automatic tracking. I've used them both and at best I would check the analytics every one in a while, smile, and nod, but at worst I'd ignore them completely.


The act of deliberately sitting down and putting into writing -- on one line -- what you're going to be attending to for the next 10 minutes, 30 minutes, an hour, or however long really sets the stage for a focused and effective work session. When I'm at my most productive I do it as a part of a whole routine where I close irrelevant tabs and apps so I can get down to business.


Similarly, the act of reviewing each of the activities in the log and categorizing them one at a time really lets you internalize what you've been up to. I debated whether or not to include the automatic categorization feature, but ended up doing it because I knew selecting categories from a dropdown would be much more tedious than copy/pastingand autocomplete on a spreadsheet.

## Roadmap

### Priority
1. Lazyload the log data as sometimes it takes ~3s to load a years worth of data. Looks like the api call is still ~100ms so the rate limiter may be populating the DOM.
2. Add a loading spinner to the import data section. Large imports can hang with no feedback and feel broken.

### Nice to Have
1. Don't call an API Post when there is no change to the input on a cell in the log or settings.
2. Combine projects and categories into one data type to avoid repeating code. This may be a very large backend refactor with minimal benefits.
3. Fix import so that text can contain commas and quotes. Currently csv processing is manual and simple, not allowing commas while quote behavior is untested.
4. Update import/export formats so that an export can be re-imported without any processing. In retrospect this is how it should have been from the get go but hindsight is 20/20.

## How to Deploy on RPI
I chose to deploy the hosted app on my Raspberry Pie by containerizing with docker, which requires some extra steps for building on the arm architecture. Feel free to pull my image from dockerhub as well. 

1. GOOS=linux GOARCH=arm go build -o time-tracker
2. docker buildx build --platform=linux/arm64/v8 --push . -t adamzaghloul/time-tracker
    Taken from https://stackoverflow.com/questions/70757791/build-linux-arm64-docker-image-on-linux-amd64-host
3. On RPI: docker pull adamzaghloul/time-tracker
4. docker run -d -p 80:8080 --env-file .env adamzaghloul/time-tracker
