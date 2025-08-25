# Anvil（ローカルブロックチェーン）環境
FROM debian:bookworm-slim

# 必要なパッケージのインストール
RUN apt-get update && apt-get upgrade -y && apt-get install -y \
    curl \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Foundryのインストール（v1.3.0固定でバグ回避）
RUN curl -L https://foundry.paradigm.xyz | bash && \
    export PATH="/root/.foundry/bin:${PATH}" && \
    foundryup --install v1.3.0

# Foundryのパスを設定
ENV PATH="/root/.foundry/bin:${PATH}"

# デフォルトコマンド（Anvilを起動）
CMD ["anvil", "--host", "0.0.0.0", "--port", "8545"] 