<template>
    <div class="drag-verify-container">
        <div class="icon">
            <svg aria-hidden="true"> 
                <use xlink:href="#oc-yanzheng"></use>
            </svg>
        </div>
        <div class="title" @click="dragOpen">
            <span>点击此按钮进行验证</span>
        </div>
        <transition appear name="drag">
            <div class="drag-verify" v-show="dragShow" style="width:320px;height:320px;padding: 8px;">
                <div class="drag-verify-img" v-html="initData.img1+initData.img2" style="width:304px;height:200px;">
                    <!-- <img src="../../../test/zfcaptchaLogin (1).png" class="drag-verify-img-bg" />
                    <img src="../../../test/zfcaptchaLogin.png" class="drag-verify-img-value" ref="verifyImg"/> -->
                </div>
                <div class="drag_verify-box" ref="dragVerify" 
                    @mousemove="dragMoving"
                    @touchmove="dragMoving"
                    @mouseup="dragFinish"
                    @mouseleave="dragFinish"
                    @touchend="dragFinish"
                    style="width:304px;height:40px;margin: 8px 0px;line-height: 40px;border-radius: 50px;"
                >
                    <span>拖动滑块完成上方拼图</span>
                    <div class="dv_handler" ref="handler"
                        @mousedown="dragStart"
                        @touchstart="dragStart"
                        style="width:60px;height:40px;"
                    >
                        <i class="el-icon-d-arrow-right"></i>
                    </div>
                    <div class="dv_progress_bar" ref="progressBar" style="height:40px;"></div>
                </div>
                <div class="drag_oper-box" style="wdith:304px;height:48px;border-top:1px solid #f4f4f4;">
                    <div class="drag_oper-btn-box" style="width:120px;">
                        <div class="drag_oper-btn-item" @click="dragClose" style="width:40px;">
                            <i class="el-icon-circle-close" style="font-size:24px;"></i>
                        </div>
                        <div class="drag_oper-btn-item" style="width:40px;">
                            <i class="el-icon-refresh" style="font-size:24px;"></i>
                        </div>
                        
                    </div>
                    <div class="drag_oper-title" style="width:180px;">
                        <span style="font-size: 14px;">fstack提供技术支持</span>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>
<script>

/**
 * @description: 此处引入验证器相关接口
 */
import {
    init,checkVerify
} from "xxxx";
import {
    ef,rrh
} from './ef.js'


export default {
    name: "dragVerifyImgChip",
    mounted: function () {
    },
    data() {
        return {
            isPassing: false,
            isMoving: false,
            x: 0,
            isOk: false,
            isKeep: false,
            showErrorTip: false,
            maxDistance:0,
            dragShow:false,

            mt:[],
            initData:{},
        };
    },
    methods: {
        dragStart: function (e) {
            if (!this.isPassing) {
                this.isMoving = true;
                this.x = e.pageX || e.originalEvent.targetTouches[0].pageX;
                console.log(this.x)
                this.pushMt(e)
            }
            this.showErrorTip = false;
            this.$emit("handlerMove");
        },
        dragMoving: function (e) {
            if (this.isMoving && !this.isPassing) {
                let _x = (e.pageX || e.originalEvent.targetTouches[0].pageX) - this.x;
                if(this.x && _x >= 0 && _x <= this.maxDistance){
                    //document.getElementsByClassName('.drag-verify-img-value')
                    document.getElementsByClassName('drag-verify-img-value')[0].style.left = _x+"px"
					//this.$refs.verifyImg.style.left = _x+"px"
                    this.$refs.handler.style.left = _x + "px";
                    this.$refs.progressBar.style.width = this.$refs.handler.style.left
                    
                    this.pushMt(e)
				}
            }
        },
        dragFinish: function (e) {
            if (this.isMoving && !this.isPassing) {
                this.pushMt(e)
                console.log(this.mt)
                let mt = JSON.stringify(this.mt)
                let mtt = ef(mt)
                let rdata = {
					type:"verify",
					rtk:this.initData.rtk,
					time:new Date().getTime(),
					mt:mtt,
					instanceId:'zfcaptchaLogin'
			    };
                let mock = Object.assign({},rdata)
                let extend = rrh('',mock)
                rdata = Object.assign({},rdata,extend)
                this.isPassing = true
                this.checkVerifyState()
                
            }
        },
        passVerify: function () {
            this.isPassing = true;
            this.isMoving = false;
            let handler = this.$refs.handler;
            handler.children[0].className = "el-icon-circle-check";
            this.$refs.progressBar.style.background = "#76c61d";
            this.$refs.progressBar.style.color = "#fff";
            this.$refs.progressBar.style.fontSize = "14px";
            this.isKeep = true;
            this.$emit("passcallback");
        },
        reset: function () {
            this.reImg();
        },
        reImg: function () {
            this.$emit("update:isPassing", false);
            const oriData = this.$options.data();
            for (const key in oriData) {
                if (oriData.hasOwnProperty(key)) {
                    this.$set(this, key, oriData[key]);
                }
            }
            let handler = this.$refs.handler;
            handler.style.left = "0";
            this.$refs.progressBar.style.width = "0";
            handler.children[0].className = "el-icon-d-arrow-right";
            this.$refs.movecanvas.style.left = "0px";
        },
        refreshimg: function () {
            this.$emit("refresh");
        },


        dragOpen(){
            //若验证未通过
            if(!this.isPassing){
                this.dragShow = true
                this.$nextTick(()=>{
                    this.maxDistance = this.$refs.dragVerify.offsetWidth-this.$refs.handler.offsetWidth
                })
            }
        },
        dragClose(){
            console.log('关闭了')
            this.dragShow = false
        },
        pushMt(e){        			
            var x = null; 
            if(e.clientX){         
                x = e.clientX;     
            }else{
                if(e.originalEvent.targetTouches.length > 0){
                    x = e.originalEvent.targetTouches[0].clientX;	 														
                }else{
                    x = e.originalEvent.changedTouches[0].clientX;
                }
            }
            var y = null;
            if(e.clientY){        
                y = e.clientY;
            }else{
                if(e.originalEvent.targetTouches.length > 0){
                    y = e.originalEvent.targetTouches[0].clientY;							
                }else{
                    y = e.originalEvent.changedTouches[0].clientY;
                }
            }
            this.mt.push({x:x,y:y,t:new Date().getTime()})
        },
        checkVerifyState(){
            this.$loading.show('验证中')
            checkVerify({
                    Cookie:this.initData.Cookie,
                    rdata
                }).then(res=>{
                    this.$loading.hidden()
                    if(res.status=='success'){
                        this.$message.success('验证成功')
                    }else{
                        this.$message.error('验证失败')
                    }
                }).catch(err=>{
                    this.$message.error('系统错误，请刷新页面')
                    this.$loading.hidden()
                })
                this.isMoving = false;
        }
    },
    watch: {
        imgsrc: {
            immediate: false,
            handler: function () {
                this.reImg();
            },
        },
    },
    created(){
        // this.$loading.show('初始化中')
        // init().then(initData=>{
        //     this.initData = initData
        //     this.$loading.hidden()
        // }).catch(err=>{
        //     this.$loading.hidden()
        // })
    },
};
</script>
<style scoped lang="less">
.drag-verify-container {
    width: 100%;
    height: 50px;
    position: relative;
    box-sizing: border-box;
    border: 1px solid #ccc;
    background: #FAFAFA;
    border-radius: 5px;
    cursor: pointer;
    > .icon{
        width: 48px;
        height: 48px;
        float: left;
        display: flex;
        align-items:center ;
        justify-content: center;
        svg{
            width: 30px;
            height: 30px;
        }
    }
    > .title{
        width: calc(100% - 50px);
        height: 48px;
        float: right;
        display: flex;
        align-items: center;
        > span{
            font-size: 14px;
        }
    }
    > .drag-verify{
        background: white;
        position: absolute;
        top: -200px;
        left: -100px;
        z-index: 200;
        border-radius: 15px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        padding: 8px;
        box-sizing: border-box;
        > .drag-verify-img{
            width: 100%;
            height: 200px;
            position: relative;
        }
        > .drag_verify-box {
            background: #e8e8e8;
            position: relative;
            text-align: center;
            > span{
                font-size: 12px;
            }
            > .dv_handler{
                background: white;
                position: absolute;
                top: 0;
                left: 0;
                box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
                border-top-right-radius: 40px;
                border-bottom-right-radius: 40px;
                cursor: move;
                > i{
                    font-size: 18px;
                    font-weight: bold;
                }
            }
            > .dv_progress_bar{
                width: 0;
                position: absolute;
                top: 0;
                left: 0;
                background: chartreuse;
                border-top-left-radius: 40px;
                border-bottom-left-radius: 40px;
            }
        }
        > .drag_oper-box{
            border-top: 1px solid #F4F4F4;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: space-between;
            > .drag_oper-btn-box{
                height: 100%;
                display: flex;
                align-items: center;
                > .drag_oper-btn-item{
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    > i{
                        font-weight: bold;
                        color: #7F7F7F;
                    }
                }
            }
            > .drag_oper-title{
                height: 100%;
                display: flex;
                align-items: center;
                flex-direction: row-reverse;
            }
        }
    }
}
.drag-enter{
    transform: translateX(-100%);
    opacity: 0;
}
.drag-leave-to{
    transform: translateX(100%);
    opacity: 0;
}

.drag-enter-to,.drag-leave{
    transform: translateX(0);
    opacity: 1;
}
.drag-enter-active,.drag-leave-active{
    transition: all .6s;
}
</style>

<style>
    .drag-verify-img-bg{
        width: 100%;
        position: absolute;
        top: 0;
        left: 0;
    }
    .drag-verify-img-value{
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
    }
</style>