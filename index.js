const cheerio = require('cheerio')
const fs = require('fs')
const moment = require('moment')
const schedule = require('node-schedule')
const mailer = require('nodemailer')
const rp = require('request-promise-native')
const config = require('./config')

const logger = console

async function fetch() {
    const res = await rp(
        {
            form:
            {
                __VIEWSTATE: '/wEPDwUKMTE4NDE4MTUzMQ9kFgICAw9kFgZmDxAPFgYeDURhdGFUZXh0RmllbGQFB2xvdU5hbWUeDkRhdGFWYWx1ZUZpZWxkBQdsb3VOYW1lHgtfIURhdGFCb3VuZGdkEBUEHOWFreWPt+alvO+8iETluqfnlKjmiLfvvIkoMSkc5Zub5Y+35qW877yIQuW6p+eUqOaIt++8iSgzKRzkuInlj7fmpbzvvIhB5bqn55So5oi377yJKDQpHOS6lOWPt+alvO+8iEPluqfnlKjmiLfvvIkoMikVBBzlha3lj7fmpbzvvIhE5bqn55So5oi377yJKDEpHOWbm+WPt+alvO+8iELluqfnlKjmiLfvvIkoMykc5LiJ5Y+35qW877yIQeW6p+eUqOaIt++8iSg0KRzkupTlj7fmpbzvvIhD5bqn55So5oi377yJKDIpFCsDBGdnZ2dkZAIDDzwrAAoBAA8WBB8CZx4LXyFJdGVtQ291bnQCAWQWAmYPZBYGZg8PFgIeB1Zpc2libGVoZGQCAQ9kFgJmD2QWBGYPFQkKMTA1OTA1MDAwMQo2LTE5OS0xMDExCTEwMjYuNzgwMAczNi4yOTAwBjAuMDAwMAbpooToraYD6YCaBuaIkOWKnxIyMDE5LzEvMTUgMjI6MDc6MzhkAgEPDxYCHg9Db21tYW5kQXJndW1lbnQFFjYtMTk5LTEwMTEoMTA1OTA1MDAwMSlkZAICDw8WAh8EaGRkAgQPPCsAEQIADxYEHwJnHwMCAWQBEBYAFgAWABYCZg9kFgYCAQ9kFghmDw8WAh4EVGV4dAUKMTA1OTA1MDAwMWRkAgEPDxYCHwYFHOWFreWPt+alvO+8iETluqfnlKjmiLfvvIkoMSlkZAICDw8WAh8GBQo2LTE5OS0xMDExZGQCAw9kFgICAQ8PFgIfBQUWNi0xOTktMTAxMSgxMDU5MDUwMDAxKWRkAgIPDxYCHwRoZGQCAw8PFgIfBGhkZBgCBQ55b25naHVHcmlkVmlldw88KwAMAwYVAQhZb25naHVJRAcUKwABFCsAAQUKMTA1OTA1MDAwMQgCAWQFEHlvbmdkaWFuRm9ybVZpZXcPFCsAB2RkZGRkFgACAWTmpmBmReZrxQL7rV9VnfX6SnOJcNHT0I/ZXmxz1fLDZg==',
                __EVENTVALIDATION: '/wEWCQLY6+DmBALaw9njDwL0+uLdCwK09Nn7DAKL9pz7AQLJmvnDBALtzraVAQLpieLNDQKczaScDX6PKUJ1t4C6CUTsicoR52r/9h3Ws1aJXlE3AGxEHxzm',
                lou: config.lou,
                yonghu: config.yonghu,
                chaxun: '查询'
            },
            method: 'post',
            url: 'http://wxhs.chenggaohua.cc/Default.aspx'
        }
    )

    // logger.info(res)
    fs.writeFileSync(`${__dirname}/result.html`, res)
}

async function parse() {
    const html = fs.readFileSync(`${__dirname}/result.html`)
    const $ = cheerio.load(html)
    const table = $('#yongdianFormView table tbody')
    const trs = table.children('tr')

    const data = {}
    data[trs.eq(0).children('td').eq(0).text()] = trs.eq(0).children('td').eq(1).text()
    data[trs.eq(0).children('td').eq(2).text()] = trs.eq(0).children('td').eq(3).text()

    data[trs.eq(1).children('td').eq(0).text()] = trs.eq(1).children('td').eq(1).text()
    data[trs.eq(1).children('td').eq(2).text()] = trs.eq(1).children('td').eq(3).text()

    data[trs.eq(2).children('td').eq(0).text()] = trs.eq(2).children('td').eq(1).text()
    data[trs.eq(2).children('td').eq(2).text()] = trs.eq(2).children('td').eq(3).text()

    data[trs.eq(3).children('td').eq(0).text()] = trs.eq(3).children('td').eq(1).text()
    data[trs.eq(3).children('td').eq(2).text()] = trs.eq(3).children('td').eq(3).text()

    data[trs.eq(4).children('td').eq(0).text()] = trs.eq(4).children('td').eq(1).text()

    fs.appendFileSync(`${__dirname}/data.txt`, `抓取于${moment().format('YYYY年MM月DD日 HH时mm分ss秒')}：\n`)
    fs.appendFileSync(`${__dirname}/data.txt`, JSON.stringify(data, null, 2) + '\n')

    return data
}

async function monitor(data) {
    const balance = parseFloat(data['购电剩余'])
    if (!isNaN(balance) && balance < config.threshold) {
        await notify(data)
    }
}

/**
 * 发送提醒
 * @param {*} data 
 */
async function notify(data) {
    //邮件服务
    if (config.email.sender.smtp && config.email.receiver) {
        const transporter = nodemailer.createTransport(
            {
                host: config.email.sender.smtp,
                port: config.email.sender.port,
                secure: false, // true for 465, false for other ports
                auth:
                {
                    user: config.email.sender.account, // generated ethereal user
                    pass: config.email.sender.password // generated ethereal password
                }
            }
        )

        const mailOptions =
        {
            from: config.email.sender.name, // sender address
            to: config.email.sender.receiver, // list of receivers
            subject: '无锡惠山用电查询', // Subject line
            text: JSON.stringify(data, null, 2) // plain text body
        }

        const info = await transporter.sendMail(mailOptions)

        logger.info('已发送邮件: %s', info.messageId)
    }

    //Server酱
    let errMsg = null;
    if (!config || !config.ServerChan) {
        errMsg = 'FATAL: no scKey found in configs';
    }
    if (errMsg) {
        logger.info(errMsg);
        return new Error(errMsg);
    }
    const title = '无锡惠山用电查询';
    const content = JSON.stringify(data, null, 2);
    return rp({
        url: `https://sc.ftqq.com/${config.scKey}.send?text=${encodeURIComponent(title)}&desp=${encodeURIComponent(content)}`,
    });
}

async function main() {
    await fetch()
    const data = await parse()
    await monitor(data)
}

const job = schedule.scheduleJob(
    config.duration, (fireDate) => {
        main()
    }
)

main()

logger.info('运行中...')