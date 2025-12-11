
const { streamText } = require('ai');

const mockModel = {
    specificationVersion: 'v2',
    doStream: async () => ({
        stream: (async function* () { yield { type: 'text-delta', textDelta: 'Hello' }; })(),
        rawCall: {},
        warnings: [],
    }),
    provider: 'mock'
};

async function run() {
    try {
        const result = await streamText({
            model: mockModel,
            prompt: 'test',
        });

        console.log('Result keys:', Object.keys(result));
        console.log('Has toDataStreamResponse:', typeof result.toDataStreamResponse);
        console.log('Has toTextStreamResponse:', typeof result.toTextStreamResponse);
        console.log('Has textStream:', typeof result.textStream);
    } catch (err) {
        console.error(err);
    }
}

run();
