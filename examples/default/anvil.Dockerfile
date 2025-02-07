FROM --platform=linux/amd64 ghcr.io/foundry-rs/foundry:latest

RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

ENTRYPOINT ["anvil", "--host", "0.0.0.0", "--fork-url", "https://mainnet.base.org", "--chain-id", "31337"]