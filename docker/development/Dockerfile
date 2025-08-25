# Node.js + Foundry統合開発環境
FROM node:20-bookworm-slim

# 必要なパッケージのインストール
RUN apt-get update && apt-get upgrade -y && apt-get install -y \
    curl \
    git \
    build-essential \
    vim \
    xz-utils \
    locales \
    && rm -rf /var/lib/apt/lists/*

# 日本語ロケール設定
RUN localedef -f UTF-8 -i ja_JP ja_JP
RUN echo "export LANG=ja_JP.UTF-8" >> ~/.bashrc

# Foundryのインストール（v1.3.0固定でバグ回避）
RUN curl -L https://foundry.paradigm.xyz | bash && \
    export PATH="/root/.foundry/bin:${PATH}" && \
    foundryup --install v1.3.0

# Foundryのパスを設定
ENV PATH="/root/.foundry/bin:${PATH}"

# pnpmのインストール
RUN npm install -g pnpm

# git設定（Docker内での安全なgit操作）
RUN git config --global --add safe.directory /application

# 不要なパッケージを削除してイメージサイズ削減
RUN apt-get autoremove -y

# 作業ディレクトリを設定
WORKDIR /application

# デフォルトコマンド
CMD ["tail", "-f", "/dev/null"] 