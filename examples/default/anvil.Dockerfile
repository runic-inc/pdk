FROM --platform=linux/amd64 ghcr.io/foundry-rs/foundry:latest

RUN apk add --no-cache curl

ENTRYPOINT ["anvil", "--host", "0.0.0.0", "--fork-url", "https://mainnet.base.org", "--chain-id", "31337"]