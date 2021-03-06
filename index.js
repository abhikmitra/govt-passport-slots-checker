const cheerio = require('cheerio');
const request = require('request');
const puppeteer = require('puppeteer');
var beep = require('beepbeep')
const notifier = require('node-notifier');
const path = require('path');
const ChromeLauncher = require('chrome-launcher');
// request({
//     method: 'GET',
//     url: 'https://www.hcilondon.gov.in/appointment.php?month=04&year=2021&apttype=Submission&locationid=4&serviceid=10#dw',
//     headers: {
//         'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.192 Safari/537.36'
//     }
// }, (err, res, body) => {
//     console.log(res);
// });
var isChromeOpen = false;
function openChrome() {
    if (isChromeOpen) {
        return;
    }
    ChromeLauncher.launch({
        startingUrl: 'https://www.hcilondon.gov.in/appointment.php?month=04&year=2021&apttype=Submission&locationid=4&serviceid=10#dw'
    })
    isChromeOpen = true;
}
function checkTheWebsite() {
    let browserLink = null;
    puppeteer.launch({ headless: true }).then((browser) => {
        browserLink = browser;
        return browser.newPage();
    }).then((page) => {
        
        return page.goto('https://www.hcilondon.gov.in/appointment.php?month=04&year=2021&apttype=Submission&locationid=4&serviceid=10#dw', {
            waitUntil: 'networkidle2',
        	})
         .then(() => {
            return page.setViewport({
                width: 1920,
                height: 1080,
                deviceScaleFactor: 1,
            });
        }).then(() => {
            // return page.pdf({ path: 'hn.pdf', format: 'a4' });
            return page.screenshot({ path: 'screenshot.png' });
        }).then(() => {
            return page.evaluate(() => {
                return document.querySelector('*').outerHTML
            })
        }).then((data) => {
            let $ = cheerio.load(data);
            let disabled_dates = $(".a_disable");
            let enabled_dates = $(".a_enable");
            console.log(disabled_dates.length);
            console.log(enabled_dates.length);
            if (disabled_dates.length !== 17) {
                notifier.notify({
                    title: 'Urgent : Disabled dates less than 35',
                    message: 'Book passport date Right now!',
                    sound: true, // Only Notification Center or Windows Toasters
                    wait: true // Wait with callback, until user action is taken against notification, does not apply to Windows Toasters as they always wait or notify-send as it does not support the wait option
                });
                beep(5, 1000);
                setInterval(checkTheWebsite, 10000)
                openChrome();
            }
            if (enabled_dates.length !== 0) {
                notifier.notify({
                    title: 'Urgent: Enabled dates > 0',
                    message: 'Book passport date Right now!',
                    sound: true, // Only Notification Center or Windows Toasters
                    wait: true // Wait with callback, until user action is taken against notification, does not apply to Windows Toasters as they always wait or notify-send as it does not support the wait option
                });
                setInterval(checkTheWebsite, 20000);
                openChrome();
            }
        })
    }).then(() => {
        browserLink.close();
    }).catch((e) => {
        console.log("Errror", e);
        setTimeout(() => {
        	checkTheWebsite();
        }, 0)

        // setInterval(() => {
        //     notifier.notify({
        //         title: 'Urgent : Restart the script',
        //         message: 'Restart the script!',
        //         sound: true, // Only Notification Center or Windows Toasters
        //         wait: true // Wait with callback, until user action is taken against notification, does not apply to Windows Toasters as they always wait or notify-send as it does not support the wait option
        //     });
        // }, 2000);
    });
}
checkTheWebsite();
setInterval(checkTheWebsite, 1 * 60 * 1000)
