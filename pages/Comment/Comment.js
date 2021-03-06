// pages/Comment/Comment.js
const server = require('../../services/server.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    holder: "",
    inputValue: "",
    // 判断申请或者反馈
    isFeedback: false,
    id: "",
    score:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    if(options.feedback == 'true'){
      this.setData({holder: "请输入您的反馈"});
      this.setData({ isFeedback: true });
      const res = await server.request('GET', 'tasks/' + options.id + '/player/me')
      if(res.statusCode === 200){
        this.setData({
          inputValue: res.data.data.feedback,
          score: res.data.data.score
        })
      } else{
        wx.showToast({
          title: '网络错误~',
          image: '/images/icons/error.png'
        })
        setTimeout(function () {
          // 返回
          wx.navigateBack({})
        }, 1000)
        return
      }
    } else{
      this.setData({holder: "请输入您的申请备注"});
      this.data.isFeedback = false;
      this.setData({ isFeedback: false });
    }
    this.data.id = options.id;
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  // 评分
  onChangeScore: function (e) {
    this.setData({
      score: e.detail.value
    })
  },
  inputProcess: function(e){
    this.setData({inputValue: e.detail.value});
  },
  submit: async function(e){
    // 评论为空
    if (!/[^\s]+/.test(this.data.inputValue)) {
      wx.showToast({
        title: '输入为空！',
        image: '/images/icons/error.png',
      })
      return;
    }
    if(this.data.isFeedback){
      const res = await server.request('PUT', 'tasks/' + this.data.id + '/player/me',{
        feedback: this.data.inputValue,
        score: this.data.score
      })
      if(res.statusCode === 200){
        wx.showToast({
          title: '反馈成功',
          success: function () {
            setTimeout(function () {
              // 返回
              wx.navigateBack({})
            }, 1000)
          }
        })
      }else{
        var content = '反馈失败'
        // not_allow_status - 任务还没发布
        // permission_deny - 权限不足
        // faked_task - 任务不存在
        // faked_user - 用户不存在
        // not_allow_status - 该状态下不允许修改
        if (res.data.message ==='not_allow_status'){
          content = '任务还没发布'
        } else if (res.data.message ==='permission_deny'){
          content = '权限不足'
        } else if (res.data.message ==='faked_task') {
          content = '任务不存在'
        } else if (res.data.message ==='faked_user') {
          content = '用户不存在'
        } else if (res.data.message ==='not_allow_status') {
          content = '该状态下不允许修改'
        }
        this.showToast(content, '/images/icons/error.png')
      }
      
    } else{
      const res = await server.request('POST', 'tasks/' + this.data.id + '/player', {
        note: this.data.inputValue
      })
      if (res.statusCode !== 200) {
        var content = '加入失败'
        if (res.data.message ==='not_allow_status') {
          content = '任务还没发布'
        } else if (res.data.message ==='faked_task') {
          content = '任务不存在'
        } else if (res.data.message ==='exist_player') {
          content = '您已经参加任务'
        } else if (res.data.message ==='max_player') {
          content = '参加人数到上限'
        }
        this.showToast(content, '/images/icons/error.png')
        return
      } else {
        wx.showToast({
          title: '申请成功',
          success: function () {
            setTimeout(function () {
              wx.navigateBack({})
            }, 1000);
          }
        })
      }
    }
    
  }
})