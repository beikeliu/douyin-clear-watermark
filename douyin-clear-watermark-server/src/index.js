import express from 'express';
import _ from 'lodash';
import axios from 'axios';
import { load } from 'cheerio';

const fetchRedirectedURL = async (url) => {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching URL:', error);
    }
}

const extractJsonFromHtml = async (html) => {
    const $ = load(html);
    const scriptTag = $('#RENDER_DATA');
    if (scriptTag.length) {
        const jsonData = scriptTag.html();
        try {
            const strJson = decodeURIComponent(jsonData);
            const data = JSON.parse(strJson);
            return data;
        } catch (jsonError) {
            console.error('Error parsing JSON:', jsonError);
            return null;
        }
    } else {
        console.error('RENDER_DATA script tag not found');
        return null;
    }
}

const douyinVideoRemoveWatermark = async (shareText) => {
    const urlRegex = /https?:\/\/[^\s]+/g;
    const urls = shareText.match(urlRegex);
    const url = _.get(urls, '[0]');
    if (!url) return console.error('url not found');
    const html = await fetchRedirectedURL(url);
    if (!html) return console.error('html not found');;
    const data = await extractJsonFromHtml(html);
    if (!data) return console.error('data not found');;
    const originUrl = _.get(data, 'app.videoInfoRes.item_list[0].video.play_addr.url_list[0]');
    if (!originUrl) return console.error('play address not found');;
    const downUrl = originUrl.replace('playwm', 'play');
    return downUrl;
}

const getFinalUrl = async (url) => {
    try {
        const response = await axios.get(url, {
            maxRedirects: 30,
            validateStatus: function (status) {
                return status >= 200 && status < 400;
            }
        });
        const finalUrl = response.request.res.responseUrl || url;
        return finalUrl;
    } catch (error) {
        throw new Error(`Failed to get final URL: ${error.message}`);
    }
}

const app = express();
const port = 3000;

app.use(express.json());

app.get('/api/v1/douyinVideoRemoveWatermark', async (req, res) => {
    const downUrl = await douyinVideoRemoveWatermark(_.get(req, 'query.shareText'));
    if (downUrl) {
        const finalUrl = await getFinalUrl(downUrl);
        if (finalUrl) {
            res.json({
                code: 0,
                data: {
                    url: finalUrl
                },
                message: 'success'
            })
        } else {
            res.json({ code: -1 })
        }
    } else {
        res.json({ code: -1 })
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
