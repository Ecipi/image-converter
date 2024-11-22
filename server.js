const express = require('express');
const sharp = require('sharp');
const bodyParser = require('body-parser');

const app = express();
const port = 9461;

app.use(bodyParser.raw({ type: 'image/*', limit: '10mb' }));

app.post('/convert-to-webp', async (req, res) => {
    try {
        const imageBuffer = req.body;
        const width = parseInt(req.headers['width']) || 1000;
        const height = parseInt(req.headers['height']) || 500;
        const format = req.headers['format'] || 'webp';

        const resizedImageBuffer = await sharp(imageBuffer)
            .resize(width, height)
            .toBuffer();

        let outputBuffer;
        switch (format) {
            case 'jpeg':
                outputBuffer = await sharp(resizedImageBuffer)
                    .jpeg()
                    .toBuffer();
                break;
            case 'png':
                outputBuffer = await sharp(resizedImageBuffer)
                    .png()
                    .toBuffer();
                break;
            case 'webp':
            default:
                outputBuffer = await sharp(resizedImageBuffer)
                    .webp()
                    .toBuffer();
                break;
        }

        const fileName = req.headers['x-filename'] || 'default-image-name.' + format;

        res.set('Content-Type', format === 'jpeg' ? 'image/jpeg' : format === 'png' ? 'image/png' : 'image/webp');
        res.set('Content-Disposition', `attachment; filename="${fileName}"`);
        res.send(outputBuffer);
    } catch (error) {
        console.error('Error converting image:', error);
        res.status(500).send('An error occurred while converting the image.');
    }
});

app.listen(port, () => {
    console.log(`Image conversion service listening at http://localhost:${port}`);
});
