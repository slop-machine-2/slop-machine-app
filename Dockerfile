FROM oven/bun:latest

RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

ADD https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux /usr/local/bin/yt-dlp
RUN chmod a+rx /usr/local/bin/yt-dlp

# Set the working directory
WORKDIR /app

# Ensure the bun user owns the application directory
RUN chown -R bun:bun /app

# Switch to the bun user
USER bun

CMD ["sleep", "infinity"]