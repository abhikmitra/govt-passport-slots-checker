const cheerio = require('cheerio');
const request = require('request');
const puppeteer = require('puppeteer');
var beep = require('beepbeep')
const notifier = require('node-notifier');
const path = require('path');
const ChromeLauncher = require('chrome-launcher');
//https://medium.com/@jaredpotter1/connecting-puppeteer-to-existing-chrome-window-8a10828149e0
// request({
//     method: 'GET',
//     url: 'https://www.hcilondon.gov.in/appointment.php?month=04&year=2021&apttype=Submission&locationid=4&serviceid=10#dw',
//     headers: {
//         'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.192 Safari/537.36'
//     }
// }, (err, res, body) => {
//     console.log(res);
// });
const wsChromeEndpointurl = 'ws://127.0.0.1:9222/devtools/browser/0067335e-b2ad-4769-9e84-2c4877753541';
var isChromeOpen = false;
var browser;
var flag = false;
async function  openChrome() {
    if (isChromeOpen) {
        return;
    }
    browser = await puppeteer.connect({
        browserWSEndpoint: wsChromeEndpointurl,
    });
    isChromeOpen = true;
    const page = await browser.newPage();
    await page.goto('https://visa-fr.tlscontact.com/gb/LON/myapp.php?fg_id=11766708');
    console.log("opened the page");

    page.on('response', async (response) => {
        if(flag) {
            return;
        }
        console.log("checking for correct url in", page.url());
        console.log("condition check", page.url().includes('11766708'));
        if (!page.url().includes('11766708')) {
          console.log('Captcha detected, please solve it in the browser window');
          // Wait for 10 seconds for the user to solve the captcha, then continue
          console.log("starting to wait");
          await page.waitFor(60000);
          console.log("wait over");
          if (page.url().includes('11766708')) {
            console.log(" correct url is loaded")
            const html = await page.evaluate(() => document.body.innerHTML);
            if (html.includes("April 28")) {
                console.log(`The text  was found on the page.`);
                beep(5, 1000);
                notifier.notify({
                    title: 'Urgent: Enabled dates > 0',
                    message: 'Book passport date Right now!',
                    sound: true, // Only Notification Center or Windows Toasters
                    wait: true // Wait with callback, until user action is taken against notification, does not apply to Windows Toasters as they always wait or notify-send as it does not support the wait option
                });
              } else {
                console.log(`The text was not found on the page.`);
                reloadThePage(page);
              }
            }
        } else {

            console.log(" correct url is loaded")
            const html = await page.evaluate(() => document.body.innerHTML);
            if (html.includes("April 29")) {
                console.log(`The text  was found on the page.`);
                beep(5, 1000);
                notifier.notify({
                    title: 'Urgent: Enabled dates > 0',
                    message: 'Book passport date Right now!',
                    sound: true, // Only Notification Center or Windows Toasters
                    wait: true // Wait with callback, until user action is taken against notification, does not apply to Windows Toasters as they always wait or notify-send as it does not support the wait option
                });
              } else {
                console.log(`The text was not found on the page.Reloading`);
                flag = true;
                reloadThePage(page);
              }
            }

      });

}
async function reloadThePage(page){
    console.log("scheduled after 30 minutes");
    setTimeout(async ()=> {
        console.log("starting again");
        await page.reload();
        console.log("reloaded");

        const html = await page.evaluate(() => document.body.innerHTML);
        console.log("checking if the right page is still here", html.includes("April 28"));
        if (html.includes("April 29")) {
            console.log(`BOOK SCHENGEN VISA NOW!!!!`);
            setInterval(()=>{
                beep(5, 1000);
                notifier.notify({
                    title: 'Urgent: Enabled dates > 0',
                    message: 'Book passport date Right now!',
                    sound: true, // Only Notification Center or Windows Toasters
                    wait: true // Wait with callback, until user action is taken against notification, does not apply to Windows Toasters as they always wait or notify-send as it does not support the wait option
                });
            }, 30*60*1000);

          } else {
            console.log(`The text was not found on the page.`);
            reloadThePage(page);
          }
        }, 5*60*1000);
}

(async ()=>{

    await openChrome()
    //await checkTheWebsite()

})();
