import { PlaywrightCrawler, log } from 'crawlee';

// AWS Lambda entry point
export const handler = async (event: any) => {
    const results: any[] = [];

    const crawler = new PlaywrightCrawler({
        launchContext: {
            launchOptions: {
                // Required for running inside AWS Linux containers
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
                headless: true,
            },
        },
        maxConcurrency: 1, // Keeps memory usage low to avoid AWS crashes
        async requestHandler({ page, request, log }) {
            if (request.label === 'DETAIL') {
                await page.waitForSelector('h1');
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

    await crawler.run(['https://crawlee.dev/blog']);
    
    // This prints a beautiful table in AWS CloudWatch logs
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