const express = require('express');
const sharp = require('sharp');
const bodyParser = require('body-parser');

const app = express();
const port = 9461;

app.use(bodyParser.raw({ type: 'image/*', limit: '10mb' }));

app.post('/convert-to-webp', async (req, res) => {
    try {
        const imageBuffer = req.body;

        const resizedImageBuffer = await sharp(imageBuffer)
            .resize(1000, 500)
            .toBuffer();

        const webpBuffer = await sharp(resizedImageBuffer)
            .webp()
            .toBuffer();

        const fileName = req.headers['x-filename'] || 'default-image-name.webp';

        res.set('Content-Type', 'image/webp');
        res.set('Content-Disposition', `attachment; filename="${fileName}"`);
        res.send(webpBuffer);
    } catch (error) {
        console.error('Error converting image:', error);
        res.status(500).send('An error occurred while converting the image.');
    }
});

app.listen(port, () => {
    console.log(`Image conversion service listening at http://localhost:${port}`);
});
