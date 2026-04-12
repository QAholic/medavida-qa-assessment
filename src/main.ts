import { PlaywrightCrawler, Dataset } from 'crawlee';

const crawler = new PlaywrightCrawler({
    // ADDED THIS BLOCK: Pointing Playwright to the container's browser
    launchContext: {
        launchOptions: {
            executablePath: process.env.APIFY_CHROME_EXECUTABLE_PATH || undefined,
            headless: true,
        },
    },
    async requestHandler({ page, request, log }) {
        log.info(`Processing ${request.url}`);

        if (request.label === 'DETAIL') {
            await page.waitForSelector('h1');
            const articleTitle = await page.locator('h1').textContent();
            
            const expectedLabel = request.userData.menuLabel;
            const isMatch = articleTitle?.trim() === expectedLabel?.trim();

            await Dataset.pushData({
                url: request.url,
                menuLabel: expectedLabel,
                articleTitle: articleTitle?.trim(),
                isMatch: isMatch,
                status: isMatch ? 'PASSED' : 'FAILED',
            });
            log.info(`Result: ${isMatch ? 'Match' : 'Mismatch'} for ${expectedLabel}`);
        } else {
            const menuLinks = page.locator('header h2 a, a.blog-post-card'); 
            
            const count = await menuLinks.count();
            const linksToFollow = [];

            for (let i = 0; i < count; i++) {
                const link = menuLinks.nth(i);
                const label = await link.textContent();
                const href = await link.getAttribute('href');

                if (href) {
                    linksToFollow.push({
                        url: new URL(href, request.url).href,
                        label: 'DETAIL',
                        userData: { menuLabel: label?.trim() },
                    });
                }
            }
            await crawler.addRequests(linksToFollow);
        }
    },
});

await crawler.run(['https://crawlee.dev/blog']);