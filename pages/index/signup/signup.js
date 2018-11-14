Page({

  /**
   * 页面的初始数据
   */
  data: {
    to: "",
    phone: null,
    code: null,
    dbCode: null,
    sendCodeButton: {
      text: "发送验证码",
      disabled: false,
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.to = options.to;
  },
  /**
   * 发送验证码
   */
  send: function(){
    if (this.data.phone == null || this.data.phone == "") {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none'
      });
    } else if (!(/^1[34578]\d{9}$/.test(this.data.phone))){
      wx.showToast({
        title: '请输入正确手机号格式',
        icon: 'none'
      });
    } else {
      /**
       * 发送验证码
       */
      let that = this;

      //改变按钮状态
      let InterValObj = null; //timer变量，控制时间
      let curCount = 59;//当前剩余秒数
      this.setData({
        sendCodeButton: {
          disabled: true,
          text: "重新发送(" + curCount + ")"
        }
      });
      InterValObj = setInterval(function () {
        if (curCount == 0) {
          clearInterval(InterValObj);
          that.setData({
            sendCodeButton: {
              disabled: false,
              text: "发送验证码"
            }
          });
        }
        else {
          curCount--;
          that.setData({
            sendCodeButton: {
              disabled: true,
              text: "重新发送(" + curCount + ")"
            }
          });
        }
      }, 1000);//启动计时器，1秒执行一次
      wx.showLoading({
        title: '正在发送验证码',
      });
      wx.request({
        url: getApp().data.serve + 'wxMiNiCustomer/GetCode',
        data: {
          phone: this.data.phone,
          openId: getApp().data.login.openid
        },
        success: function(res){
          wx.hideLoading();
          if (res.data.Code == 200) {
            
          } else {
            wx.showToast({
              title: res.data.Message,
              icon: 'none'
            });
          }
        }
      })
    }
    // wx.showToast({
    //   title: '手机号有误',
    //   icon: 'success',
    //   duration: 2000
    // });
  },
  /**
   * 注册this.data.dbCode == null || this.data.code == null || this.data.code == "" || this.data.dbCode == "" || this.data.dbCode != this.data.code
   */
  signup: function(){
    let that = this;
    if (this.data.code == null || this.data.code == ""){
      wx.showToast({
        title: '验证码不能为空',
        icon: 'none'
      });
    } else if (this.data.code.length != 4){

    } else {
      wx.showLoading({
        title: '正在注册',
      });
      wx.request({
        url: getApp().data.serve + 'wxMiNiCustomer/RegisterCustomer',
        method: "POST",
        data: {
          Phone: this.data.phone,
          OpenId: getApp().data.login.openid,
          code: this.data.code
        },
        success: function (res) {
          wx.hideLoading();
          if (res.data.Code == 200) {
            console.log(res.data);
            getApp().data.dataBaseUserInfo = res.data.DataList.Table[0];
            wx.reLaunch({
              url: "/pages/index/index"
            });
          } else {
            wx.showToast({
              title: res.data.Message,
              icon: 'none'
            });
          }
        }
      })
    }
  },
  setPhone: function (e) {
    this.data.phone = e.detail.value
  },
  setCode: function (e) {
    this.data.code = e.detail.value
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
})