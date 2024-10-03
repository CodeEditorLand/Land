export function chunkInput(data) {
    const chunks = [];
    let nextChunkStartIndex = 0;
    for (let i = 0; i < data.length - 1; i++) {
        if (i - nextChunkStartIndex + 1 >= 50 ||
            data[i + 1] === '\x1b') {
            chunks.push(data.substring(nextChunkStartIndex, i + 1));
            nextChunkStartIndex = i + 1;
            i++;
        }
    }
    if (nextChunkStartIndex !== data.length) {
        chunks.push(data.substring(nextChunkStartIndex));
    }
    return chunks;
}
