# Build stage
FROM golang:1.21.0-alpine3.18 AS builder
WORKDIR /app
COPY . .
RUN go build -o main main.go
RUN apk add curl
RUN curl -L https://github.com/golang-migrate/migrate/releases/download/v4.12.2/migrate.linux-amd64.tar.gz | tar xvz

# Run stage
FROM alpine:3.18
WORKDIR /app
ENV NEXT_PUBLIC_SUPERPET_DELIVERY_URL=https://superpetdelivery.com.br
COPY --from=builder /app/main .
COPY --from=builder /app/migrate.linux-amd64 ./migrate
COPY app.env .
COPY start.sh .
COPY wait-for.sh .
COPY db/migration ./migration
COPY api/pdf /app/api/pdf
RUN chmod +x ./start.sh
RUN chmod +x ./wait-for.sh

# Set environment variables
ENV ACCESS_TOKEN_DURATION=50m
ENV REFRESH_TOKEN_DURATION=168h

EXPOSE 8080
CMD [ "/app/main" ]
ENTRYPOINT [ "/app/start.sh" ]