import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';

const HOSTS = process.env.HOSTS || ['localhost'];

// 无服务器版本
exports.handler = async function (event, context) {
    try {

        const url = event.queryStringParameters.url;

        console.log('get url', url);

        // 只解析 https
        if (!url || !url.startsWith('http')) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid URL' }),
            };
        }

        const referer = event.headers.referer || '';
        if (referer.length > 0) {
            const refererHost = new URL(referer).hostname || '';
            if (!HOSTS.includes(refererHost)) {
                console.error('referer invalid:', referer);
                return {
                    statusCode: 500,
                    body: JSON.stringify({ "title": "请自部署该服务", "desc": "https://github.com/xaoxuu/site-info-api/" }),
                }
            }
        } else {
            if (!HOSTS.includes('')) {
                console.error('referer can not be empty!');
                return {
                    statusCode: 500,
                    body: JSON.stringify({ "title": "请自部署该服务", "desc": "https://github.com/xaoxuu/site-info-api/" }),
                }
            }
        }


        let response;
        try {
            response = await fetch(url);
        } catch (error) {
            console.error('Error fetching the URL:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to fetch the URL' }),
            };
        }

        if (!response.ok) {
            const location = response.headers.get('location');
            const isRedirect = [301, 302, 303, 307, 308].includes(response.status);
            if (isRedirect && location && location !== url) {
                return handler({
                    request: {
                        url: new URL(location),
                    },
                });
            }
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: 'Failed to fetch with status code: ' + response.status }),
            };
        }

        const html = await response.text();
        const dom = new JSDOM(html);
        const document = dom.window.document;

        const data = {
            url,
        };

        // 获取 title
        let titleEl = document.querySelector('title') || document.querySelector('head meta[property="og:title"]');
        data.title = titleEl ? titleEl.textContent.trim() : '';

        // 获取 desc
        let descEl = document.querySelector('head meta[property="og:description"]') || document.querySelector('head meta[name="description"]');
        data.desc = descEl ? descEl.getAttribute('content').trim() : '';

        // 获取 icon
        let icon;
        let iconEl = document.querySelector('head link[rel="apple-touch-icon"]') || document.querySelector('head link[rel="icon"]');
        if (!iconEl) {
            iconEl = document.querySelector('head meta[property="og:image"]');
            if (!iconEl) {
                iconEl = document.querySelector('head meta[property="twitter:image"]');
            }
        }
        if (iconEl) {
            icon = iconEl.getAttribute('href') || iconEl.content;
        }

        if (icon && !/^https?:\/\/|^\/\//.test(icon)) {
            const origin = new URL(url).origin;
            icon = origin + icon;
        }
        data.icon = icon;

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        };
    } catch (error) {
        console.error('Error processing the request:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};