/*
 * @Author: your name
 * @Date: 2021-06-15 22:46:07
 * @LastEditTime: 2021-06-24 00:48:27
 * @LastEditors: Please set LastEditors
 * @Description: 爬虫主体类
 * @FilePath: \正方教务系统爬虫\reptiles\index.js
 */
const cheerio = require('cheerio')
const request = require('../request')
const {readFileContent} = require('../utils/func-public')
const requestConfig = require('../config/request-config')
const systemConfig = JSON.parse(readFileContent('../config/system-config.json'))
const RSAKey = require('../rsa/rsa')

class Reptiles{

    csrftoken = ''
    Cookie = ''
    exponent = ''
    modulus = ''
    rsaKey = null

    constructor(){
        this.rsaKey = new RSAKey()        
    }

    /**
     * @description: 获取登陆必要参数Cookie和scrftoken
     * @param {Object} 可自主配置header,超时时间,请求地址
     * @return {Object} {csrftoken,Cookie}
     */    
    get_cookie_scrftoken({
        timeOut = 5000,
        headers=requestConfig,
        url=`${systemConfig.baseURL}/xtgl/login_slogin.html`,
    }={}){
        return new Promise((resolve,rejct)=>{

            //创建一个source用来探测教务系统是否宕机
            let source = request.CancelToken.source()

            setTimeout(() => {
                //若在指定直接内教务系统仍无响应，则默认为宕机，立即取消请求并返回错误
                source.cancel();
            }, timeOut);

            request({
                method:'GET',
                url,
                headers,
                CancelToken:source.token
            }).then(loginHtmlBody=>{
                //将请求到的登陆页面载入并提取两个有效信息
                let $ = cheerio.load(loginHtmlBody.data)
                this.csrftoken = $('#csrftoken').attr('value')
                this.Cookie = `${loginHtmlBody.headers['set-cookie'][0].split(';')[0]}; ${loginHtmlBody.headers['set-cookie'][1].split(';')[0]}`
                resolve({
                    csrftoken:this.csrftoken,
                    Cookie:this.Cookie
                })
            }).catch(err=>{
                console.log(err)  
                rejct({
                    message:'获取Cookie和csrftoken发生请求错误或教务系统宕机',
                    code:'reptiles_errors_001'
                })
            })
        })
    }


    /**
     * @description: 获取公钥和私钥用以加密用户密码
     * @param {Object}可自主配置header,请求地址,Cookie
     * @return {*}
     */    
    get_exponent_modulus({
        url=`${systemConfig.baseURL}/xtgl/login_getPublicKey.html`,
        headers=requestConfig,
        csrftoken = this.csrftoken,
        Cookie = this.Cookie
    }={}){
        return new Promise((resolve,rejct)=>{
            if(csrftoken==''||Cookie==''){
                rejct({
                    message:'csrftoken与Cookie参数不能为空',
                    code:'reptiles_errors_002'
                })
            }else{
                request({
                    url,
                    method:'GET',
                    headers:{...headers,Cookie}
                }).then(publicKey=>{
                    let {exponent,modulus} = publicKey.data
                    this.exponent = exponent
                    this.modulus = modulus
                    resolve(publicKey.data)
                }).catch(err=>{
                    rejct({
                        message:'获取公钥与私钥时发生错误，请求失败。',
                        code:'reptiles_errors_003'
                    })
                })
            }
        })
    }
    

    /**
     * @description: 请求图片并以base64格式保存,默认为请求验证码图片
     *               读取滑块背景图片地址：`https://jwxt.xcc.edu.cn/zfcaptchaLogin?type=image&id=${image_info.si}&imtk=${image_info.imtk}&t=${image_info.t}7&instanceId=zfcaptchaLogin`
     *               读取滑块按钮图片地址：`https://jwxt.xcc.edu.cn/zfcaptchaLogin?type=image&id=${image_info.mi}&imtk=${image_info.imtk}&t=${image_info.t}7&instanceId=zfcaptchaLogin`
     * @param {*}
     * @return {*}
     */    
    get_image_base64({
        url=`${systemConfig.baseURL}/kaptcha`,
        headers=requestConfig,
        Cookie = this.Cookie,
        className = 'code-img'
    }={}){
        return new Promise((resolve,rejct)=>{
            request({
                method:'GET',
                url,
                headers:{...headers,Cookie},
                responseType:'arraybuffer'
            }).then(imageBuffer=>{
                return Buffer.from(imageBuffer.data, 'binary').toString('base64')
            }).then(imageData=>{
                resolve({
                    codeImage:`<img src="data:image/png;base64,${imageData}" class="${className}">`
                })
            }).catch(err=>{
                rejct({
                    message:'获取图片数据时发生错误，请求失败',
                    code:'reptiles_errors_004'
                })
            })
        })
    }

    /**
     * @description: 无任何验证措施的登陆方式
     * @param {*}
     * @return {*}
     */    
    login_normal_type({
        url=`${systemConfig.baseURL}/xtgl/login_slogin.html`,
        headers=requestConfig,
        Cookie=this.Cookie,
        modulus=this.modulus,
        exponent=this.exponent,
        csrftoken=this.csrftoken,
        language='zh_CN',
        yhm='',
        mm='',
    }){
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
                        code:'reptiles_warning_003',
                        message:'账号，密码，或验证码错误，请重新验证'
                    })
                }
            }).catch(err=>{
                console.log(err)
                rejct({
                    code:'reptiles_errors_008',
                    message:'登陆错误！'
                })
            })
        })
    }

    /**
     * @description: 获取教务系统学生信息
     * @param {*}
     * @return {*}
     */    
    get_student_info({
        url = `${systemConfig.baseURL}/xsxxxggl/xsxxwh_cxCkDgxsxx.html?gnmkdm=N100801`,
        headers=requestConfig,
        session = ''
    }={}){
        return new Promise((resolve,rejct)=>{
            request({
                method:'GET',
                url,
                headers:{
                    ...headers,
                    'Cookie':session
                }
            }).then(res=>{
                if(res.data&&res.data.xm){
                    resolve(res.data)
                }else{
                    rejct({
                        code:'reptiles_errors_010',
                        message:'获取学生信息异常'
                    })
                }
            }).catch(err=>{
                rejct({
                    code:'reptiles_errors_009',
                    message:'获取学生信息失败'
                })
            })
        })
    }

    /**
     * @description: 获取学生课程表成绩信息
     * @param {*}
     * @return {*}
     */    
    get_student_schedule({
        session = '',
        semester = 3,
        year = 2018,
        url = `${systemConfig.baseURL}/kbcx/xskbcx_cxXsKb.html?gnmkdm=N2151`,
        headers=requestConfig,
    }={}){
        return new Promise((resolve,rejct)=>{
            request({
                method:'POST',
                url,
                headers:{
                    ...headers,
                    'Cookie':session
                },
                data:{
                    xnm: year,
                    xqm: semester
                }
            }).then(res=>{
                if(res.data){
                    resolve(res.data.kbList)
                }else{
                    rejct({
                        code:'reptiles_errors_011',
                        message:'获取学生课表异常'
                    })
                }
            }).catch(err=>{
                rejct({
                    code:'reptiles_errors_010',
                    message:'获取学生课表失败'
                })
            })
        })
    }

    /**
     * @description: 获取学生成绩
     * @param {*}
     * @return {*}
     */    
    get_student_achievement({
        session = '',
        semester = null,
        year = null,
        page_size = 800,
        current_page = 1, 
        url = `${systemConfig.baseURL}/cjcx/cjcx_cxDgXscj.html?doType=query&gnmkdm=N100801`,
        headers=requestConfig,
    }={}){
        return new Promise((resolve,rejct)=>{
            request({
                method:'POST',
                url,
                headers:{
                    ...headers,
                    'Cookie':session
                },
                data:{
                    xnm:year,
                    xqm:semester,
                    _search:false,
                    nd:new Date().getTime(),
                    'queryModel.showCount':page_size,
                    'queryModel.sortName':'',
                    'queryModel.sortOrder':'asc',
                    'queryModel.currentPage':current_page,
                    time:0
                }
            }).then(res=>{
                if(res.data){
                    let {currentPage,items,totalPage,totalCount} = res.data
                    resolve({
                        currentPage,items,totalCount,totalPage
                    })
                }else{
                    rejct({
                        code:'reptiles_errors_011',
                        message:'获取学生成绩异常'
                    })
                }
            }).catch(err=>{
                rejct({
                    code:'reptiles_errors_010',
                    message:'获取学生成绩失败'
                })
            })
        })
    }

    /**
     * @description: 获取学生学业情况基础部分
     * @param {*}
     * @return {*}
     */    
    get_student_academic_base({
        session = '',
        url = `${systemConfig.baseURL}/xsxy/xsxyqk_cxXsxyqkIndex.html?gnmkdm=N105515`,
        headers=requestConfig,
    }={}){
        return new Promise((resolve,rejct)=>{
            request({
                method:'GET',
                url,
                headers:{
                    ...headers,
                    'Cookie':session
                },
                params:{
                    layout: 'default'
                }
            }).then(res=>{
                let $ = cheerio.load(res.data);
                let info_obj = $('#alertBox').children('font')
                let info = {}
                info.title = info_obj.eq(0).text()
                info.average_gpa = parseFloat(info_obj.eq(1).children('font').eq(0).text())
                info.plan_inside_sum = info_obj.eq(2).text().split('门')[0].replace(' 计划总课程','')
                info.plan_inside_success = info_obj.eq(2).text().split('门')[1].replace('      通过','')
                info.plan_inside_danger = info_obj.eq(2).text().split('门')[2].replace('，未通过','')
                info.plan_inside_wait = info_obj.eq(2).text().split('门')[3].replace('；未修','')
                info.plan_inside_now = info_obj.eq(3).text().replace(' 在读','').replace('门！','')
                info.plan_outside_success = info_obj.eq(4).text().replace(' 计划外：      通过','').replace('门，','')
                info.plan_outside_danger = info_obj.eq(5).text().replace('未通过 ','').replace('门','')
                resolve(info)
            }).catch(err=>{
                rejct({
                    code:'reptiles_errors_010',
                    message:'获取学业情况主体信息失败'
                })
            })
        })
    }

    /**
     * @description: 获取学生学业情况详细信息
     * @param {*}
     * @return {*}
     */    
    get_student_academic_content({
        session = '',
        url = `${systemConfig.baseURL}/xsxy/xsxyqk_cxJxzxjhxfyqKcxx.html?gnmkdm=N105515`,
        headers=requestConfig,
        type = '',
        semester = '',
        year = ''
    }){
        return new Promise((resolve,rejct)=>{
            request({
                method:'POST',
                url,
                headers:{
                    ...headers,
                    'Cookie':session
                },
                data:{
                    xfyqjd_id: type,
                    cjlrxn:year,
                    cjlrxq:semester,
                    bkcjlrxn:year,
                    bkcjlrxq:semester,
                    xscjcxkz:0,
                    cjcxkzzt:0,
                    cjztkz:0,
                    cjzt:null
                }
            }).then(res=>{
                if(res.data){
                    resolve(res.data)
                }else{
                    rejct({
                        code:'reptiles_errors_011',
                        message:'获取学生学业情况详细信息异常'
                    })
                }
            }).catch(err=>{
                rejct({
                    code:'reptiles_errors_010',
                    message:'获取学业情况详细信息失败'
                })
            })
        })
    }
}

module.exports = Reptiles