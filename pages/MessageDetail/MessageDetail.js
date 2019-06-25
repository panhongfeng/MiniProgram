// pages/MessageDetail/MessageDetail.js
const app = getApp()
const moment = require('moment')
const server = require('../../services/server.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sessionData: {},
    testMessageDetail: {
      data: []
    },
    // 对应物品详情
    testSample: {
      data: {}
    },
    //物品详情图片
    isLoading: false,
    noMore: false,
    // 评论和回复内容
    reply_content: "",
    target_user_id: "",
    taskID:"",
    status: "",
    page:1,
    session_id:"",
    top_value: 100,
  },

  // isMore true 用于上拉刷新
  loadMessage: async function(id, str,isMore) {

    // 用于时间显示
    moment.locale('zh-cn', {
      longDateFormat: {
        l: "YYYY-MM-DD",
        L: "YYYY-MM-DD HH:mm"
      }
    })
    if(!this.data.isLoading){
      this.setData({isLoading: true})
    }
    var res = {}
    if(str === 'detail'){
      console.log('detail')
      res = await server.request('GET', 'messages/user/' + id, {
        page: this.data.page,
        size: 10
      })
      console.log(res.data)
    } else if(str === 'message'){
      res = await server.request('GET', 'messages/' + id, {
        page: this.data.page,
        size: 10
      })
    }
    console.log(res.statusCode)
    if (res.statusCode == 200) {
      res.data = res.data.data
      this.setData({
        isLoading: false
      })
      // 没有更多消息
      if(res.data.messages.length === 0 && isMore){
        if (isMore) {
          this.setData({
            isLoading: false,
            noMore: true
          })
          this.data.page = this.data.page - 1
        }
      }
      // 记录会话ID
      this.data.session_id = res.data.id
      this.data.status = 'message'
      this.data.target_user_id = res.data.target_user.id
      for (let i in res.data.messages) {
        if (res.data.messages[i].user_id === res.data.target_user.id) {
          res.data.messages[i].target_user = res.data.target_user
          res.data.messages[i].self = false
        } else {
          res.data.messages[i].target_user = {
            nickname: app.globalData.userInfo.info.nickname,
            avatar: app.globalData.userInfo.info.avatar
          }
          res.data.messages[i].self = true
        }
      }
      if (res.data.type === 'task') {
        const taskRes = await server.request('GET', 'tasks/' + res.data.target_user.id, {
          brief: true
        })
        if (taskRes.data.images.length == 0) {
          taskRes.data.images = [{
            id: 0,
            url: '/images/icon.png'
          }]
        }
        this.data.testSample.data = taskRes.data
      }
      console.log(res.data.messages)
      if(isMore){
        var arr = []
        res.data.messages = res.data.messages.reverse()
        for(var val of res.data.messages){
          arr.push(val)
        }
        for(var val of this.data.testMessageDetail.data){
          arr.push(val)
        }
       if(res.data.type !== 'chat'){
         // 系统消息不进行整点判断
         for (var i = 0; i < arr.length; i = i + 1) {
           arr[i].string_time = moment(arr[i].time * 1000).format('L');
           arr[i].showTime = true;
         }
       } else{
         // 整点判断
         for (var i = 0; i < arr.length - 1; i = i + 1) {
           if ((arr[i + 1].time - arr[i].time) > 60 || i === 0) {
             arr[i].string_time = moment(arr[i].time * 1000).format('L');
             arr[i].showTime = true;
           }
         }
       }
        
        this.setData({
          testMessageDetail: {
            data: arr
          },
        });
      }else{
        // 整点判断
        var arr = res.data.messages.reverse()
        if (res.data.type !== 'chat') {
          // 系统消息不进行整点判断
          for (var i = 0; i < arr.length; i = i + 1) {
            arr[i].string_time = moment(arr[i].time * 1000).format('L');
            arr[i].showTime = true;
          }
        } else {
          // 整点判断
          for (var i = 0; i < arr.length - 1; i = i + 1) {
            if ((arr[i + 1].time - arr[i].time) > 60 || i === 0) {
              arr[i].string_time = moment(arr[i].time * 1000).format('L');
              arr[i].showTime = true;
            }
          }
        }
        this.setData({
          sessionData: res.data,
          testMessageDetail: {
            data: arr
          },
          testSample: this.data.testSample,
          top_value: 100 * arr.length,
        });
      }
    } else if(str === 'detail'){
      console.log('没有消息')
    }else {
      this.showToast("获取信息失败", "/images/icons/error.png")
      return {
        data: []
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function(options) {
    moment.locale('en', {
      longDateFormat: {
        l: "YYYY-MM-DD HH:mm",
        L: "YYYY-MM-DD HH:mm:ss"
      }
    });
    // 判断从哪里穿进来参数
    if(options.status == 'detail'){
      this.data.status = 'detail'
      this.data.target_user_id = options.user_id
      this.data.taskID = options.taskID
      const res = await this.loadMessage(this.data.target_user_id, options.status, false)
    } else if(options.status == 'message'){
      this.data.status = 'message'
      console.log('is message')
      console.log(options.session_id)
      this.session_id = options.session_id
      const res = await this.loadMessage(options.session_id, options.status, false)
    }
    

  },

  onclickTask: function() {
    wx.navigateTo({
      url: '/pages/Detail/Detail?id=' + this.data.sessionData.target_user.id,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },
  onMsgRefresh: function(){
    if (!this.data.isLoading && !this.data.noMore){
      this.data.page = this.data.page + 1
      console.log('page' + this.data.page)
      this.loadMessage(this.data.session_id, this.data.status, true)
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  showToast: function(str, src) {
    if (src == "") {
      wx.showToast({
        title: str,
        icon: 'success', //图标，支持"success"、"loading" 
        //image: src,//自定义图标的本地路径，image 的优先级高于 icon
        duration: 2000, //提示的延迟时间，单位毫秒，默认：1500 
        mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false 
        success: function() {},
        fail: function() {},
        complete: function() {}
      });
    } else {
      wx.showToast({
        title: str,
        //icon: 'loading',//图标，支持"success"、"loading" 
        image: src, //自定义图标的本地路径，image 的优先级高于 icon
        duration: 2000, //提示的延迟时间，单位毫秒，默认：1500 
        mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false 
        success: function() {},
        fail: function() {},
        complete: function() {}
      });
    }
  },
  // 提交回复
  submitRely: async function (e) {
    // 消息为空
    if (!/[^\s]+/.test(this.data.reply_content)) {
      this.setData({
        reply_content: ""
      });
      this.showToast("消息为空", "/images/icons/error.png");
      return;
    }
    // TODO: 在线更新该回复
    const res = await server.request('POST', 'messages/' + this.data.target_user_id, {
      content: this.data.reply_content,
      about: this.data.status === 'detail' ? this.data.taskID : ""
    })
    if(res.statusCode != 200){
      this.showToast("提交失败", "/images/icons/error.png")
      return
    }
    this.data.session_id = res.data.id
    await this.loadMessage(this.data.session_id, this.data.status, false)
    this.showToast("消息提交", "")
    this.setData({
      reply_content: ""
    })
  },
  // 评论内容刷新
  replyInputChange: function(e) {
    this.setData({
      reply_content: e.detail.value
    })
  },
})