Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    beforArray: [],
    afterArray: [],
    dataBaseUserInfo: null,
    hasSign: false,
    productObject: null,
    godsTipObject: null,
    activeObject: null,
    params: null,
    imgUrls: [
      'https://cs.5i4s.com/img/b1.jpg',
      'https://cs.5i4s.com/img/b2.jpg',
      'https://cs.5i4s.com/img/b3.jpg',
    ],
    indicatorDots: false,
    autoplay: false,
    interval: 5000,
    duration: 1000,
    afterTag: false,
    cityArray: [],
    cityIndex: 0,
    loglng: "",
    productDes: [],
    cityChange: false,
    light: false,
    thatCity: "",
    prevCity: "",
    hb: false,
    dark: false,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    //获取分享参数
    this.setData({
      params: options
    });
    getApp().data.params = this.data.params;
    //查询本地缓存红包标记
    wx.getStorage({
      key: 'user_hb',
      success: function(res) {
        getApp().data.isHasHB = 1;
      },
      fail: function (res) {
        that.setData({
          hb: true,
          dark: true,
        });
      }
    })
    //初始化用户登录
    this.login();
  },
  login: function () {
    var that = this;
    wx.login({
      success: function (res) {
        if (res.code) {
          // wx.showLoading({
          //   title: '加载中...',
          // });
          //发起网络请求
          wx.request({
            url: getApp().data.serve + 'wxMiniOAuth/GetMiNiProcedureOpenId',
            data: {
              code: res.code
            },
            success: function (res) {
              if (res.data.Code == 200) {
                getApp().data.login = res.data.DataList.WxUserMsg[0];
                /**
                 * 如果此openid 在数据库中有数据 则拿下来
                 */
                if (res.data.DataList.CustomerTable.length != 0) {
                  that.data.dataBaseUserInfo = res.data.DataList.CustomerTable[0];
                  getApp().data.dataBaseUserInfo = that.data.dataBaseUserInfo;
                }
                if (that.data.dataBaseUserInfo == null) {
                  that.setData({
                    hasSign: true
                  });
                }
                //获取用户城市，先查本地缓存
                let userCity = wx.getStorageSync('user_city');
                console.log("缓存中的城市：" + userCity);
                if (!userCity) {
                  wx.getLocation({
                    type: 'wgs84',
                    success: function (res) {
                      //调用高德 获取城市名121.790948,39.051567   + res.longitude + "," + res.latitude
                      wx.request({
                        url: 'https://restapi.amap.com/v3/geocode/regeo?key=64942398e96adf7934611ebabd2f5c04&location=' + res.longitude + "," + res.latitude,
                        success: function (res) {
                          if (res.data.infocode == "10000") {
                            let obj = res.data.regeocode.addressComponent;
                            console.log("当前用户所在城市：" + obj.province + "-" + obj.city);
                            wx.setStorageSync('user_city', obj.city.length == 0 ? obj.province : obj.city);
                            that.getProduct(obj.city.length == 0 ? obj.province : obj.city, "");
                          } else {
                            that.getProduct("", "");
                          }
                        }
                      })
                    },
                    fail: function (res) {
                      that.getProduct("", "");
                    }
                  })
                } else {
                  //测试坐标 上海 121.481923,31.241243
                  let tmp = res.longitude + "," + res.latitude;
                  //异步-查询是否为上次城市
                  wx.request({
                    url: 'https://restapi.amap.com/v3/geocode/regeo?key=64942398e96adf7934611ebabd2f5c04&location=' + tmp,
                    success: function (res) {
                      if (res.data.infocode == "10000") {
                        let obj = res.data.regeocode.addressComponent;
                        let thatCity = obj.city.length == 0 ? obj.province : obj.city;
                        if (thatCity != userCity){
                          console.log("城市发生变动! 上次登录城市:" + userCity + ";本次登录城市:" + thatCity);
                          that.setData({
                            light: true,
                            cityChange: true,
                            thatCity: thatCity,
                            prevCity: userCity
                          });
                        }
                      } 
                    }
                  })
                  //获取商品
                  that.getProduct(userCity, "");
                }
              } else {
                wx.showModal({
                  title: '登录信息',
                  content: '登录出错，请重试',
                  showCancel: false
                })
              }
            },
            error: function (error) {
              alert(erro);
            }
          })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    });
  },
  /**
   * 查询产品
   */
  getProduct: function(city, loglng){
    console.log(loglng || "没有");
    let that = this;
    wx.request({
      url: getApp().data.serve + 'wxProduct/GetActiveProducts',
      data: {
        ActiveId: that.data.params.activeid || "",
        Coordinate: loglng || "",
        CurrentCity: city
      },
      success: function (res) {
        // wx.hideLoading();
        if (res.data.Code == 200) {
          that.setData({
            productObject: res.data.DataList.Product[0],
            activeObject: res.data.DataList.Active[0],
            godsTipObject: res.data.DataList.GodsTip
          });
          getApp().data.productObject = that.data.productObject;
          getApp().data.activeObject = that.data.activeObject;
          getApp().data.godsTipObject = that.data.godsTipObject;
          console.log(getApp().data.productObject);
          /**
           * 设置默认城市-数组
           */
          let defaultCity = getApp().data.productObject.PRODUCT021 || '';
          let cArray = [];
          //默认下标 0
          cArray = cArray.concat(defaultCity);
          if ("北京市" != defaultCity) { cArray = cArray.concat("北京市"); }
          if ("上海市" != defaultCity) { cArray = cArray.concat("上海市"); }
          if ("深圳市" != defaultCity) { cArray = cArray.concat("深圳市"); }
          if ("长春市" != defaultCity) { cArray = cArray.concat("长春市"); }
          if ("大连市" != defaultCity) { cArray = cArray.concat("大连市"); }
          if ("哈尔滨市" != defaultCity) { cArray = cArray.concat("哈尔滨市"); }
          that.setData({
            cityArray: cArray,
            cityIndex: 0
          });
          /* --- */
          that.setData({
            productDes: that.data.productObject.FWTK003.split('*#*')
          });
          /**
           * 调用统计
           */
          that.setStatistics();
          /**
           * 看看都谁购买了
           */
          // wx.showLoading({
          //   title: '加载中...',
          // });
          wx.request({
            url: getApp().data.serve + 'wxMiniYanBaoOrder/GetSubCustomerOrderProduct',
            data: {
              activeId: that.data.activeObject.ACTIVITYPRODUCT001,
              productId: that.data.productObject.PRODUCT001,
              openId: getApp().data.login.openid,
            },
            success: function (res) {
              // wx.hideLoading();
              if (res.data.Code == 200) {
                let r = res.data.DataList.Table;
                if(r == null){
                  r = [];
                }
                let befor = [];
                let after = [];
                if (r.length < 11) {
                  that.setData({
                    beforArray: r || []
                  });
                } else {
                  for (let i = 0; i < r.length; i++) {
                    if (i < 10) {
                      befor = befor.concat(r[i]);
                    } else {
                      after = after.concat(r[i]);
                    }
                  }
                  that.setData({
                    beforArray: befor || [],
                    afterArray: after
                  });
                }
              } else {
                wx.showModal({
                  title: '提示',
                  content: res.data.Message,
                  showCancel: false
                })
              }
            }
          });
        } else {
          wx.showModal({
            title: '提示',
            content: "暂无该城市商品。",
            showCancel: false
          })
        }
      }
    })
  },
  /**
   * 注册
   */
  sign(params) {
    wx.navigateTo({
      url: 'signup/signup?to=' + params,
    })
  },
  /**
   * 立即购买
   */
  buy() {
    if (this.data.dataBaseUserInfo == null) {
      this.sign("buy");
    } else {
      wx.navigateTo({
        url: 'buy/buy',
      })
    }
  },
  /**
   * 切换城市
   */
  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    //if (e.detail.value == 0){
    //this.getProduct("", this.data.loglng);
    //} else {
    this.getProduct(this.data.cityArray[e.detail.value], "");
    //}
  },
  /**
   * 查看全部
   */
  showAfter: function () {
    this.setData({
      afterTag: true
    });
  },
  /**
   * 统计
   */
  setStatistics: function(){
    if (this.data.params.openid == null){
      return false;
    } else {
      wx.request({
        url: getApp().data.serve + 'customer/AddKHYWYInfo',
        method: "POST",
        data: {
          KHYWY002: getApp().data.login.openid,
          KHYWY007: this.data.params.activeid,
          KHYWY004: this.data.params.openid,
        },
        success: function(res){
          console.log(res.data.Message);
        }
      })
    }
  },

  /**
   * 分享
   */
  onShareAppMessage: function (options) {
    var that = this;
    console.log(that.data.productObject.ACTIVITYPRODUCT001);
    // 设置菜单中的转发按钮触发转发事件时的转发内容
    var shareObj = {
      title: that.data.productObject.ACTIVITYPRODUCT002,        // 默认是小程序的名称(可以写slogan等)
      path: '/pages/index/index?openid=' + getApp().data.login.openid + "&activeid=" + that.data.activeObject.ACTIVITYPRODUCT001,
      imgUrl: '',//自定义图片路径，可以是本地文件路径、代码包文件路径或者网络图片路径，支持PNG及JPG，不传入 imageUrl 则使用默认截图。显示图片长宽比是 5:4
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
  /**
   * 拨打电话
   */
  call: function () {
    wx.makePhoneCall({
      phoneNumber: '4000505345', //此号码并非真实电话号码，仅用于测试  
      success: function () {
        console.log("拨打电话成功！")
      },
      fail: function () {
        console.log("拨打电话失败！")
      }
    })
  },
  /**
   * 立即购买
   */
  getPhoneNumber: function (e) {
    // console.log(e.detail.encryptedData)
    // console.log(getApp().data.login.session_key)
    // console.log(e.detail.iv)
    if (e.detail.encryptedData != null) {
      let that = this;
      // wx.showLoading({
      //   title: '加载中...',
      // });
      /**
       * 解密手机号信息
       */
      wx.request({
        url: getApp().data.serve + 'wxMiniOAuth/AES_decrypt',
        data: {
          encryptedDataStr: e.detail.encryptedData,
          key: getApp().data.login.session_key,
          iv: e.detail.iv
        },
        method: "POST",
        success: function (res) {
          // let url = "buy/buy";
          // if (res.statusCode == 200) {
          //   url = url + "?phoneNumber=" + res.data.phoneNumber;
          // } else {
          //   url = url + "?phoneNumber=" + null;
          // }
          // wx.navigateTo({
          //   url: url
          // })
          alert(res.data.phoneNumber)
        }
      });
    } else {
    }
  },
  /**
   * 红包遮罩
   */
  darkTip: function (e) {
    this.setData({
      dark: false,
      hb: false,
    });
  },
  /**
   * 切换城市遮罩
   */
  lightTip: function (e){
    this.setData({
      light: false,
      cityChange: false,
    });
  },
  /**
   * 确认切换城市
   */
  changeCity: function (e) {
    this.lightTip();
    wx.setStorageSync("user_city", this.data.thatCity);
    this.getProduct(this.data.thatCity, "");
  },
  /**
   * 领取红包
   * 1 = 有
   * 0 = 没有
   */
  setHB: function (e){
    console.log(1);
    wx.showLoading({
      title: '领取中,请稍后',
    });
    wx.setStorage({
      key: 'user_hb',
      data: 1,
    });
    getApp().data.isHasHB = 1;
    this.darkTip();
    wx.hideLoading();
    wx.showToast({
      title: '领取成功',
    })
  },
  clear: function (){
    wx.clearStorage("user_hb");
  }
})