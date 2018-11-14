Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: null,
    sex: null,
    carNo: null,
    phoneNumber: null,
    submitParams: null,
    infoFlag: true,
    shareFlag: true,
    productObject: null,
    godsTipObject: null,
    activeObject: null,
    orderNo: null,
    allPrice: null,
    isHasHB: 0,
    isUseHB: 0,
  },

  setName: function (e) {
    this.setData({
      name: e.detail.value
    })
  },
  setPhoneNumber: function (e) {
    this.setData({
      phoneNumber: e.detail.value
    })
  },
  setCarNo: function (e) {
    this.setData({
      carNo: e.detail.value
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      productObject: getApp().data.productObject || null,
      godsTipObject: getApp().data.godsTipObject || null,
      activeObject: getApp().data.activeObject || null,
      name: getApp().data.dataBaseUserInfo.KHXX002 || null,
      sex: getApp().data.dataBaseUserInfo.KHXX016 || null,
      carNo: getApp().data.dataBaseUserInfo.KHCAR006 || null,
      phoneNumber: getApp().data.dataBaseUserInfo.KHZH002 || null,
      isHasHB: getApp().data.isHasHB,
      isUseHB: getApp().data.isUseHB,
    });
    /**
     * 如果客户档案有姓名 车牌号
     */
    if (this.data.name != null && this.data.carNo != null){
      this.setData({
        submitParams: {
          name: getApp().data.dataBaseUserInfo.KHXX002 || null,
          sex: getApp().data.dataBaseUserInfo.KHXX016 || null,
          carNo: getApp().data.dataBaseUserInfo.KHCAR006 || null,
          phoneNumber: getApp().data.dataBaseUserInfo.KHZH002 || null,
        }
      });
    }
    let qc = null;
    for (let item of this.data.godsTipObject){
      qc += item.GODSTIP016 * item.GODSTIP013;
    }
    this.setData({
      allPrice: qc + this.data.productObject.PRODUCT007
    });
  },
  goBuy: function () {
    if (this.data.submitParams == null) {
      wx.showModal({ title: '提示', content: '请填写资料' }); return false;
    }
    let that = this;
    // 查看是否授权
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function (res) {
              getApp().data.userInfo = res.userInfo;
              console.log(getApp().data.userInfo);
              getApp().data.iv = res.iv;
              wx.showLoading({
                title: '加载中...',
              });
              /**
               * 生成订单
               */
              console.log({
                USERID: '',
                CUSTOMID: getApp().data.dataBaseUserInfo.KHZH001,
                ORDER004: that.data.productObject.PRODUCT004,
                ORDER005: that.data.productObject.PRODUCT006,
                ORDER006: that.data.productObject.PRODUCT007,
                ORDER007: that.data.productObject.PRODUCT010,
                ORDER011: that.data.productObject.BXXM004,
                ORDER012: that.data.productObject.BXGS002,
                ORDER010: '',
                ORDER027: '',
                ACTIVEID: that.data.activeObject.ACTIVITYPRODUCT001,
                PRODUCT001: that.data.productObject.PRODUCT001,
                uploadedUri: "",
                PHONE: that.data.submitParams.phoneNumber,
                WXOPENID: getApp().data.login.openid,
                WXNO: "",
                WXNICKNAME: getApp().data.userInfo.nickName,
                WXIMG: getApp().data.userInfo.avatarUrl,
                CUSTOMNAME: that.data.submitParams.name,
                CUSTOMADDR: "",
                CARNUMBER: that.data.submitParams.carNo || "",
                SEX: that.data.submitParams.sex == null ? "" : that.data.submitParams.sex == 0 ? '男' : '女',
              });
              wx.request({
                url: getApp().data.serve + 'wxMiniYanBaoOrder/AddMiNiYanBaoOrders',
                method: 'POST',
                data: {
                  USERID: getApp().data.params.openid || '',
                  CUSTOMID: getApp().data.dataBaseUserInfo.KHZH001,
                  ORDER004: that.data.productObject.PRODUCT004,
                  ORDER005: that.data.productObject.PRODUCT006,
                  ORDER006: that.data.productObject.PRODUCT007,
                  ORDER007: that.data.productObject.PRODUCT010,
                  ORDER011: that.data.productObject.BXXM004,
                  ORDER012: that.data.productObject.BXGS002,
                  ORDER010: '',
                  ORDER027: '',
                  ACTIVEID: that.data.activeObject.ACTIVITYPRODUCT001,
                  PRODUCT001: that.data.productObject.PRODUCT001,
                  uploadedUri: "",
                  PHONE: that.data.submitParams.phoneNumber,
                  WXOPENID: getApp().data.login.openid,
                  WXNO: "",
                  WXNICKNAME: getApp().data.userInfo.nickName,
                  WXIMG: getApp().data.userInfo.avatarUrl,
                  CUSTOMNAME: that.data.submitParams.name,
                  CUSTOMADDR: "",
                  CARNUMBER: that.data.submitParams.carNo || "",
                  SEX: that.data.submitParams.sex == null ? "" : that.data.submitParams.sex,
                  GODSTYPE015: that.data.productObject.PRODUCT021
                },
                success: function (res) {
                  if (res.data.Code == 200) {
                    wx.hideLoading();
                    getApp().data.dataBaseUserInfo.KHXX002 = that.data.submitParams.name;
                    getApp().data.dataBaseUserInfo.KHXX007 = that.data.submitParams.phoneNumber;
                    getApp().data.dataBaseUserInfo.KHXX016 = that.data.submitParams.sex;
                    getApp().data.dataBaseUserInfo.KHCAR006 = that.data.submitParams.carNo;
                    that.setData({
                      orderNo: res.data.DataList.Table1[0].OrderPayId
                    });
                    that.sendWXPay();
                  } else {
                    wx.hideLoading();
                    wx.showModal({
                      title: '提示',
                      content: res.data.Message,
                      showCancel: false
                    })
                  }
                }
              })
            }
          })
        } else {
          /**
           * 当用户拒绝授权时
           */
          wx.showModal({
            title: '提示',
            content: '是否重新请求获取用户权限？',
            cancelText: '取消',
            confirmText: '重新授权',
            success: function(res){
              if (res.confirm){
                that.goBuy();
              }
            }
          })
        }
      }
    })
  },
  sendWXPay: function () {
    let that = this;
    wx.showLoading({
      title: '加载中...',
    });
    console.log(that.data.orderNo);
    console.log(this.data.activeObject.ACTIVITYPRODUCT001);
    /**
     * 生成微信支付订单
     */
    wx.request({
      url: getApp().data.serve + 'wxMiniOAuth/GetWxPayParamsNew',
      data: {
        openId: getApp().data.login.openid,
        price: this.data.productObject.PRODUCT007,//this.data.productObject.PRODUCT007
        orderPayNo: this.data.orderNo,
        activeId: this.data.activeObject.ACTIVITYPRODUCT001,
        isDiscount: getApp().data.isUseHB
      },
      success: function (res) {
        wx.hideLoading();
        if (res.data.Code == 200) {
          let r = res.data.DataList.Table1[0];
          /**
           * 调用微信支付
          */
          wx.requestPayment({
            'timeStamp': r.timeStamp,
            'nonceStr': r.nonceStr,
            'package': r.package,
            'signType': 'MD5',
            'paySign': r.paySign,
            'success': function (res) {
              that.showShare();
            },
            'fail': function (res) {
              wx.showToast({
                title: '取消支付',
                icon: 'none'
              });
            }
          })
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.Message,
            showCancel: false
          })
        }
      }
    })
  },
  /**
   * 确认个人资料
   */
  submitInfo: function(){
    let txt = "";
    if (this.data.name == null || this.data.nama == "") {
      wx.showModal({title: '提示', content: '联系人姓名不可为空；'}); return false;
    } else if (this.data.phoneNumber == null || this.data.phoneNumber == "") {
      wx.showModal({ title: '提示', content: '手机号码不可为空；且必须为数字' }); return false;
    } else if (!(/^1[34578]\d{9}$/.test(this.data.phoneNumber))) {
      wx.showModal({ title: '提示', content: '手机号码为11位；' }); return false;
    } else if (this.data.carNo == null || this.data.carNo == "") {
      wx.showModal({ title: '提示', content: '车牌号不可为空；' }); return false;
    } else {
      this.setData({
        submitParams: {
          name: this.data.name,
          sex: this.data.sex,
          carNo: this.data.carNo,
          phoneNumber: this.data.phoneNumber,
        }
      });
      this.hideInfo();
    }
  },
  /**
   * 选择性别
   */
  changeSex: function (options){
    this.setData({
      sex: options.currentTarget.dataset.sex
    });
  },
  seletHB: function (){
    wx.navigateTo({
      url: '../hb/hb',
    })
  },
  /**
   * 弹出层函数
   */
  //出现
  showInfo: function () {
    this.setData({ infoFlag: false })
  },
  //消失
  hideInfo: function () {
    this.setData({ infoFlag: true })
  },
  //出现
  showShare: function () {
    this.setData({ shareFlag: false })
  },
  //消失
  hideShare: function () {
    this.setData({ shareFlag: true })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      isHasHB: getApp().data.isHasHB,
      isUseHB: getApp().data.isUseHB,
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },
  onShareAppMessage: function (options) {
    var that = this;
    console.log(that.data.productObject.ACTIVITYPRODUCT001);
    // 设置菜单中的转发按钮触发转发事件时的转发内容
    var shareObj = {
      title: that.data.productObject.ACTIVITYPRODUCT002,        // 默认是小程序的名称(可以写slogan等)
      path: '/pages/index/index?openid=' + getApp().data.login.openid + "&activeid=" + that.data.activeObject.ACTIVITYPRODUCT001,
      imgUrl: '',     //自定义图片路径，可以是本地文件路径、代码包文件路径或者网络图片路径，支持PNG及JPG，不传入 imageUrl 则使用默认截图。显示图片长宽比是 5:4
      success: function (res) {
        // 转发成功之后的回调
        if (res.errMsg == 'shareAppMessage:ok') {
          wx.showToast({
            title: '转发成功',
            icon: 'success'
          });
        }
      },
      fail: function () {
      },
      complete: function () {
        // 转发结束之后的回调（转发成不成功都会执行）
      }
    };
    　　// 来自页面内的按钮的转发
    // 　　if(options.from == 'button') {
    //       var eData = options.target.dataset;
    //       shareObj.path = '/pages/index/index?test=' + 2;
    // 　　}
    　　// 返回shareObj
    　　return shareObj;
  },
})