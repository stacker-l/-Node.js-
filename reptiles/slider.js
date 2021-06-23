/*
 * @Author: your name
 * @Date: 2021-06-16 00:01:45
 * @LastEditTime: 2021-06-24 00:00:09
 * @LastEditors: Please set LastEditors
 * @Description: 滑块验证方式类
 * @FilePath: \正方教务系统爬虫\reptiles\slider.js
 */

const Reptiles = require('./main')
const request = require('../request')
const {readFileContent} = require('../utils/func-public')
const requestConfig = require('../config/request-config')
const systemConfig = JSON.parse(readFileContent('../config/system-config.json'))

class Slider extends Reptiles{
    rtk = ''
    image_info = null

    constructor(){
        super()
    }

    /**
     * @description: 滑块验证下获取必要参数rtk
     * @param {*}
     * @return {*}
     */    
    get_rtk({
        url=`${systemConfig.baseURL}/zfcaptchaLogin?type=resource&instanceId=zfcaptchaLogin&name=zfdun_captcha.js`,
        headers=requestConfig,
        Cookie = this.Cookie,
    }={}){
        return new Promise((resolve,rejct)=>{
            request({
                method:"GET",
                url,
                headers:{...headers,Cookie}
            }).then(rtkContent=>{
                this.rtk = rtkContent.data.match(/rtk\:\'(\S*)\'/)[1]
                resolve({
                    rtk:this.rtk
                })
            }).catch(err=>{
                rejct({
                    message:'获取必要验证参数时发生请求错误，发生错误',
                    code:'reptiles_errors_005'
                })
            })
        })
    }


    /**
     * @description: 通过获取到的rtk获取到滑块验证背景图片和滑块图片的地址信息(注意，该地址图片仅能访问一次)
     * @param {*}
     * @return {*}
     */    
    get_image_info({
        headers=requestConfig,
        Cookie = this.Cookie,
        rtk = this.rtk
    }={}){
        return new Promise((resolve,rejct)=>{
            request({
                method:"GET",
                url:`${systemConfig.baseURL}/zfcaptchaLogin?type=refresh&rtk=${rtk}&time=${new Date().getTime()}&instanceId=zfcaptchaLogin`,
                headers:{...headers,Cookie}
            }).then(imageInfo=>{
                this.image_info = imageInfo.data
                resolve({
                    imageInfo:this.image_info
                })
            }).catch(err=>{
                rejct({
                    message:'获取必要验证参数时发生请求错误，发生错误',
                    code:'reptiles_errors_006'
                })
            })
        })
    }
    

    /**
     * @description: 进行滑块验证
     * @param {*}
     * @return {*}
     */    
    get_check({
        url=`${systemConfig.baseURL}/zfcaptchaLogin`,
        headers=requestConfig,
        Cookie = this.Cookie,
        data='',
    }={}){
        headers['Accept'] = '*/*'
        headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8'
        headers['X-Requested-With'] = 'XMLHttpRequest'
        return new Promise((resolve,rejct)=>{
            request({
                method:"POST",
                url,
                headers:{...headers,Cookie},
                data
            }).then(checkResult=>{
                if(checkResult.data.status=="success"){
                    resolve({
                        msg:"验证成功"
                    })
                }else{
                    reject({
                        code:"reptiles_errors_006",
                        msg:"验证失败"
                    })
                }
            }).catch(err=>{
                rejct({
                    message:'进行滑块验证时发生错误，请求错误',
                    code:'reptiles_errors_006'
                })
            })
        })
    }

    
    
}

module.exports = Slider