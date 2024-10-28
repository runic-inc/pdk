FROM ghcr.io/foundry-rs/foundry:latest

RUN apk add --no-cache curl

ENTRYPOINT ["anvil", "--host", "0.0.0.0"]