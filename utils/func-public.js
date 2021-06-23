/*
 * @Author: your name
 * @Date: 2021-06-15 22:41:07
 * @LastEditTime: 2021-06-15 22:43:52
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \正方教务系统爬虫\utils\func-public.js
 */


const path = require('path')
const fs = require('fs')

/**
 * @description: 读取指定文件内容
 * @param {String} pathname 指定路径(可为相对路径)
 * @return {String} 文件内容
 */
function readFileContent(pathname) {
    var bin = fs.readFileSync(path.join(__dirname, pathname));
    if (bin[0] === 0xEF && bin[1] === 0xBB && bin[2] === 0xBF) {
        bin = bin.slice(3);
    }
    return bin.toString('utf-8');
}

module.exports = {
    readFileContent
}