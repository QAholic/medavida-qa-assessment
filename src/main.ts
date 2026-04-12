import { PlaywrightCrawler, Dataset, log } from 'crawlee';

async function run() {
    // 1. Open a named dataset so it's easy to find in the Apify Storage tab
    const dataset = await Dataset.open('articles-report');

    const crawler = new PlaywrightCrawler({
        launchContext: {
            launchOptions: {
                // Ensure we use the container's pre-installed browser
                executablePath: process.env.APIFY_CHROME_EXECUTABLE_PATH || undefined,
                headless: true,
            },
        },
        // Limit concurrency to save memory on the free tier
        maxConcurrency: 1, 
        async requestHandler({ page, request, log }) {
            log.info(`Processing ${request.url}`);

            if (request.label === 'DETAIL') {
                await page.waitForSelector('h1');
                const articleTitle = await page.locator('h1').textContent();
                
                const expectedLabel = request.userData.menuLabel;
                const isMatch = articleTitle?.trim() === expectedLabel?.trim();

                // 2. Push data directly to our named dataset
                await dataset.pushData({
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

    // 3. Final log to confirm the count before the actor stops
    const info = await dataset.getInfo();
    log.info(`CRAWLER FINISHED. Successfully saved ${info?.itemCount} items to 'articles-report'.`);
}

run();