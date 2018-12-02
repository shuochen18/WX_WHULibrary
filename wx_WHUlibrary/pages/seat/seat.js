// pages/seat/seat.js
var util = require('../../utils/util.js');
Page({

  Gettoken: function (event) {
      var page = this
      page.setData({ token: '' })
      wx.request({
        url: 'http://seat.lib.whu.edu.cn/rest/auth',
        data: {
          username: page.data.id,
          password: page.data.pwd
        },
        method: 'GET',
        header: {
          'content-type': 'application/json' // 默认值
        },
        success(res) {
          var token = res.data.data.token
          if (page.data.timeflag != 3) {
              page.release(token)
          }
          else { 
            page.reserve(token)
            }
        
            page.setData({ token: token })
        }
      })

  },


    student1:function(){
      var page=this
      page.setData({user:'student_1'})
      page.setData({ id: '2015302590xxx' })
      page.setData({ pwd: 'xxxxxx'})
      page.setData({ seat: page.data.seat1 })
      var Today = new Date()
      var dh = 22 - Today.getHours()
      var dm = 44- Today.getMinutes()
      var ds = 59 - Today.getSeconds()
      var timeinterval = dh * 3600 + dm * 60 + ds

      if ((page.data.timeflag == 3) && (timeinterval > 0)){ 
 
            console.log('start count down!')
            wx.showToast({
              title: '开始定时',
              icon: 'success',
              duration: 1000,
              mask: true
            })
            var timer=setInterval(function () {
              timeinterval--;
              page.setData({ 'timeinterval': timeinterval + '秒' })
              if(timeinterval==0){
                clearInterval(timer)
                page.Gettoken()
              }    
            }, 1000);
      }
      else{
        page.Gettoken()
      }
   

    },

   
  release:  function(token){//一键释放座位
    var page=this
      wx.request({
        url: 'http://seat.lib.whu.edu.cn/rest/v2/stop',
        data: {
          token:token,
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success(res) {
          console.log(res.data)
          page.setData({ releaseflag: res.data.message })
          if(res.data.status=='success'){            
            console.log('success')
            page.reserve(token)
          }
          else{
            page.reserve(token)
            console.log('failed')
          }
        }
      })
    },
    
  reserve: function (token) {  
          var page=this;
          console.log(page.data.seat[page.data.index])
          wx.request({
            url: 'http://seat.lib.whu.edu.cn/rest/v2/freeBook', 
            data: {
              startTime:page.data.starttime,
              endTime: '1350',
              date: page.data.date,
              seat: page.data.seat[page.data.index],
              token: token
             },
            header: {
              'content-type': "application/x-www-form-urlencoded" // 默认值
            },
            method: 'POST' ,
            success(res) {
              console.log(res.data)
              if(res.data.status=='fail'){
                page.setData({ reserveflag:res.data.message })
                page.data.index+=1
                wx.showToast({
                  title: '失败，请重试',
                  icon: 'loading',
                  duration: 1000,
                  mask: true
                })
              } 
              else{
                page.setData({ reserveflag: '预约成功,'+ res.data.data.location })
                wx.showToast({
                  title: '预定成功',
                  icon: 'success',
                  duration: 1000,
                  mask: true
                })
              }
            }
          })
        },
      
  data: {
      index:0,
      id:'',
      pwd:'',
      seat1: ['xxxx','xxxx','xxxx','xxxx','xxxx','xxxx','xxxx'],
      token:'',
      releaseflag:'无',
      reserveflag:'无',
      user:'',
      timeinterval:'无'
       },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var Tomorrow = new Date()
    var Today = new Date()
    Today.setDate(Today.getDate());
    Tomorrow.setDate(Tomorrow.getDate()+1);
    var date = util.formatTime(Today)
    var newdate = util.formatTime(Tomorrow)
    var hour=Tomorrow.getHours()



    if((13-hour)>0){
      console.log('在上午')
      this.setData({'timeflag':1})
      this.setData({'starttime':870})
      this.setData({ date: date })
    }
    else if ((18 - hour) > 0) {
      console.log('在下午')
      this.setData({ 'timeflag': 2 })
      this.setData({ 'starttime': 1110 })
      this.setData({ date: date })
    }

    else{
      console.log('在晚上')
      this.setData({ 'timeflag': 3 })
      this.setData({ 'starttime': 510 })
      this.setData({ date: newdate })


    }
    
    console.log(newdate)
   
  },

 
})