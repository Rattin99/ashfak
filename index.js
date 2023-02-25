const puppeteer = require('puppeteer')
const fs = require('fs')
// const {output} = require('./output')

const processedData = []


const output = (data,date) => {

    data.map((value,index) => {
        if(value[0].includes('পেঁয়াজ - দেশী')){
            processedData.push([date, convertBanglaToEnglishNumber(value[1])].join(','))
        }
    })
    
}

const writer = (start_date,end_date) => {

    const d = processedData.join('\n')
    const filename = `dhaka_sadar/dhaka${start_date}-${end_date}.csv`;
    fs.writeFile(filename,d,()=>{
        console.log("done")
    })

}

const scraper = async (startDate,endDate) => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();

    await page.goto('http://dam.gov.bd/market_daily_price_report?L=B',{
        waitUntil: ['load','domcontentloaded','networkidle2'],
        timeout:0
    });

    const start_date = new Date(startDate);
    const end_date = new Date(endDate);
 
    const nextDate = new Date(start_date)
    nextDate.setDate(start_date.getDate()+1)

    while(nextDate <= end_date){
        const Year = nextDate.getFullYear();
        const Month = nextDate.getMonth();
        const day = nextDate.getDate();
 
        const date = Year + "-" + (Month+1) + "-" + day;

        await page.click("#frm_filter > div > div:nth-child(1) > div.btn-group.bootstrap-select.show-tick > button");
        await Promise.all([
        page.click("#frm_filter > div > div:nth-child(1) > div.btn-group.bootstrap-select.show-tick.open > div > ul > li:nth-child(1) > a"),
        page.waitForNetworkIdle()])
 
        await page.click("#frm_filter > div > div:nth-child(3) > div.btn-group.bootstrap-select.show-tick > button");
        await Promise.all([
            page.click("#frm_filter > div > div:nth-child(3) > div.btn-group.bootstrap-select.show-tick.open > div.dropdown-menu.open > ul > li:nth-child(1) > a"),
    
        page.waitForNetworkIdle()
        ])
 
 
        await page.click("#frm_filter > div > div:nth-child(5) > div.btn-group.bootstrap-select.show-tick > button")
        await Promise.all([
            page.click("#frm_filter > div > div:nth-child(5) > div.btn-group.bootstrap-select.show-tick.open > div.dropdown-menu.open > ul > li:nth-child(1) > a"),
    
        page.waitForNetworkIdle()
        ])
 
 
        await page.click("#frm_filter > div > div:nth-child(7) > div.btn-group.bootstrap-select.show-tick > button")
        await Promise.all([
            page.click("#frm_filter > div > div:nth-child(7) > div.btn-group.bootstrap-select.show-tick.open > div.dropdown-menu.open > ul > li:nth-child(1) > a"),
    
            page.waitForNetworkIdle()
        ])
        //ei porjontoi

        await page.click("#frm_filter > div > div:nth-child(7) > div.btn-group.bootstrap-select.show-tick.dropup.open > div.dropdown-menu.open > div > div > button.actions-btn.bs-select-all.btn.btn-default")
        await page.click('#frm_filter > div > div:nth-child(9) > div:nth-child(2) > div > button')
        await page.click("#frm_filter > div > div:nth-child(9) > div:nth-child(2) > div > div > div > div > button.actions-btn.bs-select-all.btn.btn-default")
    
        await page.$eval('#date',( e )=> e.removeAttribute("readonly"))
        await page.focus("#date");
        await page.keyboard.type(date)
        await page.keyboard.press('Enter');
        const element = await page.$('#frm_filter > input.btn.btn-danger');
        await page.evaluate(element => element.click(),element)
        await page.waitForNavigation({waitUntil: 'networkidle2'});

        const data = await page.evaluate(() => {
            let data = [];
            const table =  document.querySelector('table')
     
            for(let i = 2; i< table.rows.length; i++){
                const objcelss = table.rows.item(i).cells;
     
                let values = [];
     
                for(let j = 0; j<objcelss.length;j++){
                    const text = objcelss.item(j).innerHTML;
                    values.push(text)
                }
     
                if(values.length > 5) values.splice(0,1);
     
                if(values.length > 0){
                    const p = values[2];
                    const upperbound = p.split('-')[1]
     
                    data.push([values[0],upperbound])
     
     
                }
     
     
            }
     
            return data;
        })

        output(data,date)

        nextDate.setDate(nextDate.getDate() +1)

        
    }

await browser.close()

writer(startDate,endDate)
    
    
}


const convertBanglaToEnglishNumber=(str)=>{

    if(!str) return;

        const numbers = {
            "\u09E6" : 0,
            "\u09E7" : 1,
            "\u09E8" : 2,
            "\u09E9" : 3,
            "\u09EA" : 4,
            "\u09EB" : 5,
            "\u09EC" : 6,
            "\u09ED" : 7,
            "\u09EE" : 8,
            "\u09EF" : 9
        }

       
        for (var x in numbers) {
            str = str.replace(new RegExp(x, 'g'), numbers[x]);
        }
        return str;
    
}


scraper('2013-01-01','2013-01-03')

// console.log(convertBanglaToEnglishNumber('১১'));

// console.log(output)