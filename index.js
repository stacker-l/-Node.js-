/*
 * @Author: your name
 * @Date: 2021-06-23 13:23:25
 * @LastEditTime: 2021-06-24 00:13:46
 * @LastEditors: Please set LastEditors
 * @Description: 主要业务逻辑文件
 * @FilePath: \正方教务系统爬虫\index.js
 */


const {Main,Code,Slider} = require('./reptiles')
const {readFileContent} = require('./utils/func-public')
const systemConfig = JSON.parse(readFileContent('../config/system-config.json'))


/**
 * @description: 更多接口请查看/reptiles/Main.js
 * @param {*}
 * @return {*}
 */
class StackerReptile{
    type = 0
    constructor({type=0}={}){
        this.type = type
    }

    /**
     * @description:登陆初始化 
     * @param {*}
     * @return {*}
     */    
    login_init({
        type = this.type,//0无验证,1验证码模式,2滑块验证模式
    }={}){
        return new Promise((resolve,reject)=>{
            if(type==0){
                let code = new Code
                code.get_cookie_scrftoken().then(res=>{
                    return code.get_exponent_modulus()
                }).then(res=>{
                    resolve({
                        Cookie:code.Cookie,
                        csrftoken:code.csrftoken,
                        modulus:code.modulus,
                        exponent:code.exponent
                    })
                }).catch(err=>{
                    reject({
                        code:'reptiles_errors_007',
                        message:'对接初始化失败'
                    })
                })
            }else if(type==1){
                let code = new Code
                code.get_cookie_scrftoken().then(res=>{
                    return code.get_exponent_modulus()
                }).then(res=>{
                    return code.get_image_base64()
                }).then(res=>{
                    resolve({
                        Cookie:code.Cookie,
                        csrftoken:code.csrftoken,
                        modulus:code.modulus,
                        exponent:code.exponent,
                        codeImage:res.codeImage
                    })
                }).catch(err=>{
                    reject({
                        code:'reptiles_errors_008',
                        message:'对接初始化失败'
                    })
                })
            }else if(type==2){
                let slider = new Slider()
                let imageInfo = {}
                let backgroundImage = ''
                let sliderImage = ''
                slider.get_cookie_scrftoken().then(res=>{
                    return slider.get_exponent_modulus()
                }).then(res=>{
                    return slider.get_rtk()
                }).then(res=>{
                    return slider.get_image_info()
                }).then(res=>{
                    imageInfo = res.imageInfo
                    return slider.get_image_base64({
                        url:`${systemConfig.baseURL}/zfcaptchaLogin?type=image&id=${imageInfo.si}&imtk=${imageInfo.imtk}&t=${imageInfo.t}7&instanceId=zfcaptchaLogin`
                    })
                }).then(res=>{
                    backgroundImage = res.codeImage
                    return slider.get_image_base64({
                        url:`${systemConfig.baseURL}/zfcaptchaLogin?type=image&id=${imageInfo.mi}&imtk=${imageInfo.imtk}&t=${imageInfo.t}7&instanceId=zfcaptchaLogin`
                    })
                }).then(res=>{
                    sliderImage = res.codeImage
                    resolve({
                        csrftoken:slider.csrftoken,
                        Cookie:slider.Cookie,
                        modulus:slider.modulus,
                        exponent:slider.exponent,
                        rtk:slider.rtk,
                        backgroundImage,
                        sliderImage
                    })
                }).catch(err=>{
                    reject({
                        code:'reptiles_errors_007',
                        message:'请求故障'
                    })
                })
            }else{
                reject({
                    code:'reptiles_warning_002',
                    message:'type参数错误！'
                })
            }
        })
    }

    /**
     * @description: 登陆
     * @param {*}
     * @return {*}
     */    
    login({
        type=this.type,
        Cookie = '',
        modulus = '',
        exponent = '',
        csrftoken = '',
        yhm= '',
        mm = '',
        yzm=''
    }={}){
        return new Promise((resolve,reject)=>{
            if(type==0){
                let main = new Main
                main.login_normal_type({Cookie,modulus,exponent,csrftoken,yhm,mm}).then(session=>{
                    resolve(session)
                }).catch(err=>{
                    reject(err)
                })
            }else if(type==1){
                let code = new Code
                code.login_code_type({Cookie,modulus,exponent,csrftoken,yhm,mm,yzm}).then(session=>{
                    resolve(session)
                }).catch(err=>{
                    reject(err)
                })
            }else if(type==2){
                let main = new Main
                main.login_normal_type({Cookie,modulus,exponent,csrftoken,yhm,mm}).then(session=>{
                    resolve(session)
                }).catch(err=>{
                    reject(err)
                })
            }else{
                reject({
                    code:'reptiles_warning_003',
                    message:'type参数错误！'
                })
            }
        })
    }

    /**
     * @description: 获取新的验证码图片
     * @param {*}
     * @return {*}
     */    
    resume_code({
        Cookie = ''
    }={}){
        return new Promise((resolve,reject)=>{
            if(!Cookie||Cookie==''){
                reject({
                    code:'reptiles_warning_003',
                    message:'必须传入Cookie值'
                })
            }else{
                let main = new Main
                main.get_image_base64({
                    Cookie
                }).then(res=>{
                    resolve(res.codeImage)
                }).catch(err=>{
                    reject({
                        code:'reptiles_errors_009',
                        message:'获取新的验证码图片失败'
                    })
                })
            }
        })
    }

    /**
     * @description: 重新获取滑块验证图片
     * @param {*}
     * @return {*}
     */    
    resume_slider({
        Cookie = '',
        rtk = ''
    }={}){
        return new Promise((resolve,reject)=>{
            let slider = new Slider
            let imageInfo = {}
            let backgroundImage = ''
            let sliderImage = ''
            slider.get_image_info({Cookie,rtk}).then(res=>{
                imageInfo = res.imageInfo
                return slider.get_image_base64({
                    url:`${systemConfig.baseURL}/zfcaptchaLogin?type=image&id=${imageInfo.si}&imtk=${imageInfo.imtk}&t=${imageInfo.t}7&instanceId=zfcaptchaLogin`
                })
            }).then(res=>{
                backgroundImage = res.codeImage
                return slider.get_image_base64({
                    url:`${systemConfig.baseURL}/zfcaptchaLogin?type=image&id=${imageInfo.mi}&imtk=${imageInfo.imtk}&t=${imageInfo.t}7&instanceId=zfcaptchaLogin`
                }) 
            }).then(res=>{
                sliderImage = res.codeImage
                resolve({
                    sliderImage,
                    backgroundImage
                })
            }).catch(err=>{
                reject(err)                
            })
        })
    }
}


module.exports = StackerReptile