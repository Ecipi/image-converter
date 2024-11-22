const express = require('express');
const sharp = require('sharp');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 9461;

app.use(bodyParser.raw({ type: 'image/*', limit: '10mb' }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/convert', async (req, res) => {
    console.log('Received a request');
    console.log('Headers:', req.headers);
    console.log('Body length:', req.body.length);
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
            case 'avif':
                outputBuffer = await sharp(resizedImageBuffer)
                    .avif()
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

        res.set('Content-Type', 
            format === 'jpeg' ? 'image/jpeg' : 
            format === 'png' ? 'image/png' : 
            format === 'avif' ? 'image/avif' : 
            'image/webp'
        );
        res.send(outputBuffer);
    } catch (error) {
        console.error('Error converting image:', error);
        res.status(500).send('An error occurred while converting the image.');
    }
});

app.listen(port, () => {
    console.log(`Image conversion service listening at http://localhost:${port}`);
});
