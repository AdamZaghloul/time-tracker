FROM debian:stable-slim

# COPY source destination
COPY time-tracker /bin/time-tracker/time-tracker

# COPY front end files
COPY web /bin/time-tracker/web

EXPOSE 8080

CMD ["/bin/time-tracker/time-tracker"]