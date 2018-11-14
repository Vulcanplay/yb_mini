 Page({

  /**
   * 页面的初始数据
   */
  data: {
    isHasHB: 0,
    isUseHB: 0,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      isHasHB: getApp().data.isHasHB,
      isUseHB: getApp().data.isUseHB,
    });
    
  },
  use: function (){
    getApp().data.isUseHB = 0;
    wx.navigateBack({
      delta: '1'
    })
  },
  no: function () {
    getApp().data.isUseHB = 1;
    wx.navigateBack({
      delta: '1'
    })
  }
})