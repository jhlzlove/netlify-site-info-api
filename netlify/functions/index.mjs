import { JSDOM } from 'jsdom';

const HOSTS = process.env.HOSTS || ['localhost'];


// 无服务器版本
exports.handler = async function (event, context) {
    try {

        const url = event.queryStringParameters.url;

        // 只解析 https
        if (!url || !url.startsWith('http')) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid URL' }),
            };
        }

        const referer = event.headers.referer || '';
        console.log(`referer : ${referer}`);
        if (referer.length > 0) {
            const refererHost = new URL(referer).hostname || '';
            if (!HOSTS.includes(refererHost)) {
                console.error('referer invalid:', referer);
                return {
                    statusCode: 500,
                    body: JSON.stringify({ "title": "请自部署该服务", "desc": "https://github.com/jhlzlove/netlify-site-info-api/" }),
                }
            }
        } else {
            if (!HOSTS.includes('')) {
                console.error('referer can not be empty!');
                return {
                    statusCode: 500,
                    body: JSON.stringify({ "title": "请自部署该服务", "desc": "https://github.com/xaoxuu/netlify-site-info-api/" }),
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
        let elIcon = document.querySelector('head link[rel="apple-touch-icon"]');
        if (!elIcon) {
            elIcon = document.querySelector('head link[rel="icon"]')
        }
        if (elIcon) {
            icon = elIcon && elIcon.getAttribute('href');
        } else {
            elIcon = document.querySelector('head meta[property="og:image"]');
            if (!elIcon) {
                elIcon = document.querySelector('head meta[property="twitter:image"]');
            }
            if (elIcon) {
                icon = elIcon.content;
            }
        }

        if (/^data:image/.test(icon)) {
            icon = '';
        }

        // If there is no src then get the site icon
        if (!icon) {
            const links = [].slice.call(document.querySelectorAll('link[rel][href]'))
            elIcon = links.find((_el) => _el.rel.includes('icon'))
            icon = elIcon && elIcon.getAttribute('href')
        }

        // If `icon` is not the ['https://', 'http://', '//'] protocol, splice on the `origin` of the a tag
        if (icon && !isHttp(icon)) {
            icon = new URL(url).origin + icon;
        }
        if (icon) {
            data.icon = icon;
        }

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



    function isHttp(url) {
        return /^(https?:)?\/\//g.test(url)
    }
};