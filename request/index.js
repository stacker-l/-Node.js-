/*
 * @Author: your name
 * @Date: 2021-06-15 22:30:56
 * @LastEditTime: 2021-06-15 23:32:16
 * @LastEditors: Please set LastEditors
 * @Description: 使用axios.js作为请求工具，对拦截器做一些处理
 * @FilePath: \正方教务系统爬虫\request\index.js
 */

const qs = require('qs')
const axios = require('axios')


//允许跨域携带cookie信息
axios.defaults.withCredentials = true

/**
 * @description: 请求拦截器，由于正方教务系统POST方式的请求接口使用form-data作为参数格式，所以使用qs对参数格式进行处理
 */
 axios.interceptors.request.use(
    config => {
        if (config.method  === 'post') {
            config.data = qs.stringify(config.data);
        }
        return config;
    },
    error =>{
        return Promise.reject(error);
    }
);

/**
 * @description: 响应拦截器，由于登陆成功之后，正方教务系统会进行302重定向，需要在这个未知配置拦截阻止跳转，获取最终需要的session
 */
axios.interceptors.response.use(
    response => {
        if (response.status === 200) {
          return Promise.resolve(response);
        } else {
          return Promise.reject(response);
        }
    },
    error => {
        //探测状态码是否为302重定向
        if(error.response.status===302){
            return Promise.resolve(error.response);
        }
        return Promise.reject(error.response);
    }
)

module.exports = axios