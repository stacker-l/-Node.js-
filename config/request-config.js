/*
 * @Author: your name
 * @Date: 2021-06-15 22:28:55
 * @LastEditTime: 2021-06-16 00:14:41
 * @LastEditors: Please set LastEditors
 * @Description: 请求头默认配置文件，若在请求时未主动设置，则将读取此文件作为请求头默认设置
 * @FilePath: \正方教务系统爬虫\config\request-config.js
 */

const {readFileContent} = require('../utils/func-public')
const systemConfig = JSON.parse(readFileContent('../config/system-config.json'))


module.exports = {
    UserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
    Referer: `${systemConfig.baseURL}/xtgl/login_slogin.html`
}