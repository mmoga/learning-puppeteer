const puppeteer = require('puppeteer');

// const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    const URL = 'https://catalog.ufl.edu/UGRD';

    const regLinkFinder = async () => {
        allLinks.push(
            await page.evaluate(() =>
                Array.from(document.querySelectorAll('a[href*="registrar.ufl"]'), link => link.href)
            )
        );
    };

    try {
        await page.goto(URL);
        console.log(`Opened the page: ${URL}`);
    } catch (error) {
        console.log(`Failed to open the page: ${URL} with the error: ${error}`);
    }

    // Get all the internal links
    await page.waitFor('*');
    const internalLinks = await page.$$eval('a[href^="/"]', internalLink => internalLink.map(link => link.href));

    // Let's go inside of each page. Why not?
    const allLinks = [];
    for (const internalLink of internalLinks) {
        try {
            await page.goto(internalLink, {
                waitUntil: ['domcontentloaded', 'networkidle0'],
            });
            console.log(`Opened: ${internalLink}`);
            // Get the href values of Registrar links
            regLinkFinder();
        } catch (error) {
            console.log(error);
            console.log(`Failed to open the page: ${internalLink}`);
        }
    }

    const regLinks = () => {
        const l = [];
        for (let i = 0; i < allLinks.length; i += 1) {
            l.push(...allLinks[1]);
        }
        return [...new Set(l)];
    };

    console.log(regLinks());
    process.exit();
})();
