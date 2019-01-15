# 无锡惠山电力查询

## 下载并安装node

可参考[nodejs官网](https://nodejs.org)或[直接下载安装包](https://nodejs.org/dist/v10.15.0/node-v10.15.0-x64.msi)

## 下载并安装yarn

可参考[yarn官网](https://yarnpkg.com/zh-Hans/)或[直接下载安装包](https://yarnpkg.com/latest.msi)

## 安装node依赖

```
yarn -d
```

## 修改配置

修改config.js

```javascript
{
  duration: '* 0 * * *', // cron格式的时间，只用修改第2个数字，比如4为每天凌晨4点抓取
  lou: '六号楼（D座用户）(1)', // 楼房
  yonghu: 1012, // 用户信息
  threshold: 50, // 购电剩余的阈值，低于这个值就会发送邮件
  email: {
    sender: {
      name: '', // 用来发送提醒邮件的邮箱地址
      account: '', // 用来发送提醒邮件的账号
      password: '', // 用来发送提醒邮件的密码
      smtp: '', // 使用的邮件smtp服务器的地址
      port: 0 // 使用的邮箱smtp服务器的端口
    },
    receiver: '' // 用来接收提醒邮件的账号
  }
}
```

## 运行

```bash
node index
```
