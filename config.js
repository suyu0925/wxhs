module.exports = {
    duration: '* 0 * * *', // cron格式的时间，只用修改第2个数字，0为每天凌晨0点
    lou: '六号楼（D座用户）(1)', // 楼房
    yonghu: 1012, // 用户信息
    threshold: 50, // 购电剩余的阈值，低于这个值就会发送提醒
    email: {
        sender: {
            name: '', // 用来发送提醒邮件的邮箱地址
            account: '', // 用来发送提醒邮件的账号
            password: '', // 用来发送提醒邮件的密码
            smtp: '', // 使用的邮件smtp服务器的地址
            port: 0 // 使用的邮箱smtp服务器的端口
        },
        receiver: '' // 用来接收提醒邮件的账号
    },
    ServerChan: 'qweasdzczasdasdzc'//Server酱的SCKEY
}