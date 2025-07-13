FROM golang:1.22-alpine AS builder

WORKDIR /app

#RUN apk --no-cache bash git make gcc gettext

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o /bin/app ./cmd/app/main.go

FROM alpine:latest

COPY --from=builder /bin/app /app
COPY --from=builder /app/configs /configs

EXPOSE 80

CMD /app