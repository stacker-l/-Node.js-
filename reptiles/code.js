/*
 * @Author: your name
 * @Date: 2021-06-15 23:57:23
 * @LastEditTime: 2021-06-24 00:05:59
 * @LastEditors: Please set LastEditors
 * @Description: 验证码类
 * @FilePath: \正方教务系统爬虫\reptiles\code.js
 */
const {readFileContent} = require('../utils/func-public')

const Reptiles = require('./main')
const request = require('../request')
const requestConfig = require('../config/request-config')
const systemConfig = JSON.parse(readFileContent('../config/system-config.json'))
const {b64tohex,hex2b64} = require('../rsa/base64')

class Code extends Reptiles{
    
    constructor(){
        super()
    }

    /**
     * @description: 验证码模式下的登陆请求
     * @param {*}
     * @return {*}
     */    
    login_code_type({
        url=`${systemConfig.baseURL}/xtgl/login_slogin.html`,
        headers=requestConfig,
        Cookie=this.Cookie,
        modulus=this.modulus,
        exponent=this.exponent,
        csrftoken=this.csrftoken,
        yzm='123456',
        language='zh_CN',
        yhm='',
        mm='',
    }={}){
        return new Promise((resolve,rejct)=>{
            this.rsaKey.setPublic(b64tohex(modulus),b64tohex(exponent))
            mm = hex2b64(this.rsaKey.encrypt(mm))
            request({
                method:'POST',
                url,
                headers:{...headers,Cookie},
                data:{
                    csrftoken,
                    yzm,
                    language,
                    yhm,
                    mm,
                    mm
                },
                //阻止重定向
                maxRedirects:0
            }).then(loginResult=>{
                if(loginResult.headers['set-cookie']&&loginResult.headers['set-cookie'].length==2){
                    resolve(`${Cookie.split(';')[0]}; ${loginResult.headers['set-cookie'][1].split(';')[0]}`)
                }else{
                    rejct({
                        code:'reptiles_warning_001',
                        message:'账号，密码，或验证码错误，请重新验证'
                    })
                }
            }).catch(err=>{
                console.log(err)
                rejct({
                    code:'reptiles_errors_006',
                    message:'登陆错误！'
                })
            })
        }) 
    }
}

module.exports = Code