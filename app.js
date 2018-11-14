App({
  data: {
    serve: "https://cs.5i4s.com/api/v1/",//https://cs.5i4s.com/api/v1/ http://180.76.99.113:8091/api/v1/
    login: { 
      openid: "",
      session_key: "",
      unionid: "" 
    },
    userInfo: {

    },
    dataBaseUserInfo: null,
    iv: "",
    productObject: null,
    godsTipObject: null,
    activeObject: null,
    params: null,
    isHasHB: 0,
    isUseHB: 0,
  },
  /**
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch: function () {
  },

  /**
   * 当小程序启动，或从后台进入前台显示，会触发 onShow
   */
  onShow: function (options) {
  },

  /**
   * 当小程序从前台进入后台，会触发 onHide
   */
  onHide: function () {
    
  },

  /**
   * 当小程序发生脚本错误，或者 api 调用失败时，会触发 onError 并带上错误信息
   */
  onError: function (msg) {
    
  },
  
})
