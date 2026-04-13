import { PlaywrightCrawler } from 'crawlee';

// AWS Lambda entry point
export const handler = async (event: any) => {
    const results: any[] = [];

    const crawler = new PlaywrightCrawler({
        launchContext: {
            launchOptions: {
                // Critical flags for running Chromium in a container
                args: [
                    '--no-sandbox', 
                    '--disable-setuid-sandbox', 
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--single-process'
                ],
                headless: true,
            },
        },
        // Low concurrency is safer for Lambda's memory limits
        maxConcurrency: 1, 
        async requestHandler({ page, request, log }) {
            if (request.label === 'DETAIL') {
                await page.waitForSelector('h1', { timeout: 15000 });
                const articleTitle = await page.locator('h1').textContent();
                const expectedLabel = request.userData.menuLabel;
                const isMatch = articleTitle?.trim() === expectedLabel?.trim();

                results.push({
                    url: request.url,
                    expected: expectedLabel,
                    actual: articleTitle?.trim(),
                    status: isMatch ? 'PASSED' : 'FAILED',
                });
                
                log.info(`Processed: ${expectedLabel} -> ${isMatch ? 'PASSED' : 'FAILED'}`);
            } else {
                // Scrape the main blog page for links
                const menuLinks = page.locator('header h2 a, a.blog-post-card'); 
                const count = await menuLinks.count();
                for (let i = 0; i < count; i++) {
                    const link = menuLinks.nth(i);
                    const label = await link.textContent();
                    const href = await link.getAttribute('href');
                    if (href) {
                        await crawler.addRequests([{
                            url: new URL(href, request.url).href,
                            label: 'DETAIL',
                            userData: { menuLabel: label?.trim() },
                        }]);
                    }
                }
            }
        },
    });

    // Run the crawler
    await crawler.run(['https://crawlee.dev/blog']);
    
    // Log results for CloudWatch
    console.table(results);
    
    return {
        statusCode: 200,
        body: JSON.stringify({ 
            message: "Validation Complete", 
            total: results.length,
            data: results 
        }),
    };
};