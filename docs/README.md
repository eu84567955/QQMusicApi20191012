# QQMusicApi

这是一个基于 Express + Axios 的 Nodejs 项目，一切仅供学习参考，该支持的还是要支持的，不然杰伦喝不起奶茶了。

其实有点点嫌弃qq音乐接口的数据格式，所以会对部分接口返回做一些处理，但是考虑到一些之前扒过接口的项目，有些人可能还是喜欢原汁原味，
可以在接口处增加一个参数 `raw=1` 。

对于所有处理过的返回数据，都会包含 `result`，`100` 表示成功，`500` 表示穿参错误，`400` 为 node 捕获的未知异常，`301` 表示缺少用户登陆的 cookie

灵感来源：[Binaryify/NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi)

## Start

```shell
$ git clone git@github.com:jsososo/QQMusicApi.git

$ npm install

$ npm start
```

项目默认端口为 3300

**在线接口测试网址：[http://api.qq.jsososo.com](http://api.qq.jsososo.com)**

## 用前须知

!> 该项目仅做接口转发，部分接口通过修改 `Referer` 实现，所有数据均不做存储处理，大家还是理性的保护好自己的个人信息，谨防诈骗

!> QQ音乐登陆的这个问题还是难绕过去，目前还是需要登陆并手动获取 [https://y.qq.com](https://y.qq.com) 的 `cookie`，注入网站或node，
如果又什么更好的解决办法，欢迎大家提 pr 给我

!> 本项目仅供学习使用，请尊重版权，请勿利用此项目从事商业行为!
本项目仅供学习使用，请尊重版权，请勿利用此项目从事商业行为!
本项目仅供学习使用，请尊重版权，请勿利用此项目从事商业行为


## 更新记录

19-10-10：🤬 热搜词、关注歌手、关注粉丝列表

19-09-23：🏊 歌单、mv 的分类获取

19-09-21：🚢 新增 MV 信息、根据分类筛选歌手、新碟推荐、新 MV 推荐

19-09-20：🐬 支持在线测试

19-09-20：🐫 新增 mv 接口，返回结果优化

19-09-19：🙀 评论、推荐、歌手接口

19-09-18：🐧 init

## 接口文档

### vkey & guid 获取

先介绍 vkey 和 guid 的获取，因为这是拼凑音乐链接的关键，也是播放音乐的核心一步

接口：`/vkey`

返回示例：
```javascript
{
  "data": {
    "vkey": "78159670DE0BF35ABEF86841070FDA6818BC95FB25E5C983547E9D29C9803D30971A3500E2D85D5204848BDC4E3E130BE9FCC63EB73F0F47",
    "guid": "5339940689",
    "domain": "http://ws.stream.qqmusic.qq.com/"
  },
  "result": 100,
  "success": true
}
```

下面是不同格式的音乐对应的 url 拼接，可稳定获取128k的播放链接，但是高品质会被403，还在摸索中。。。

```javascript
// content 参数里面的文件类型可以用在下载的时候，后端将歌曲转成流，并标注返回的类型（content）
const formatMap = {
          size128: {
            val: '128k',
            s: 'M500',
            e: '.mp3',
            content: 'audio/mpeg',
          },
          size320: {
            val: '320k',
            s: 'M800',
            e: '.mp3',
            content: 'audio/mpeg',
          },
          sizeape: {
            val: '无损ape',
            s: 'A000',
            e: '.ape',
            content: 'audio/ape',
          },
          sizeflac: {
            val: '无损flac',
            s: 'F000',
            e: '.flac',
            content: 'audio/x-flac',
          }
        }
      }
const format = 'size320';
const { s, e } = formatMap[format];

// 注意是 strMediaMid 不是 songid, 也不是 songmid，付费歌曲的strMediaMid 和 songmid 不同，非付费歌曲相同
const url = `${domain}${s}${strMediaMid}${e}?guid=${guid}&vkey=${vkey}&fromtag=8&uin=0`
```

### 搜索

接口：`/search`

参数：

`key`: 关键词 必填

`pageNo`: 页码，默认 1

`pageSize`: 一页返回数量，默认 20

`t`: 搜索类型 默认为 0  // 0：单曲，2：歌单，7：歌词，8：专辑，12：mv

### 获取热搜词

接口：`/search/hot`

返回示例：`k` 为热搜词，`n` 为搜索量

```javascript
{
  "result": 100,
  "data": [
    {
      "k": "PHOENIX 涅槃 ",
      "n": 440301
    },
    {
      "k": "嚣张 ",
      "n": 430912
    },
    ...
  ]
}
```


### 用户信息

!> 这个接口是需要登陆 cookie 才能获取的，不然会返回 301，所以如果有误需要考虑一下可能是 cookie 过期

接口：`/user/detail`

参数：

`id`: qq号 必填

返回中 `mymusic` 为喜欢的音乐，`mydiss` 为用户创建的歌单，需要注意的是，喜欢的音乐中的歌单id为 `id`，歌单中的歌单id为 `dissid`

### 歌单

#### 1、获取歌单详情

接口：`/songlist`

参数：
`id`: 歌单id 必填

返回说明：

这些表示各种码率对应的文件大小，如果为0则表示该格式的文件不存在
```javascript
{
  "size128": 1922927,
  "size320": 4803503,
  "sizeape": 10810010,
  "sizeflac": 10827560,
}
```

#### 2、获取歌单分类

接口：`/songlist/category`

这个接口没有参数，返回几种类型下的小分类 `id` 和 `name`，不同于歌手的筛选，搜索歌单时只能用一个 `id`，不能用且关系。

#### 3、根据分类获取歌单

接口：`/songlist/list`

参数

`num`: 默认为 20，返回数量

`sort`: 默认是 5，// 5: 推荐，2: 最新，其他数字的排列值最后都会返回推荐

`category`: 分类 id，默认 10000000 （全部），其他值从上面的分类接口获取

### 歌曲信息

接口：`/song`

参数：

`songmid`: 必填

这个接口包含了很多的歌曲信息，包括歌手、专辑、语种、曲风等，但是不包含歌词，`songinfo.data.track_info.album.mid` 为专辑的 mid，
下面为专辑封面图片的路径，在搜索接口中也能获取到这个参数。

```
"https://y.gtimg.cn/music/photo_new/T002R300x300M000" + mid
```
### 歌词

接口：`/lyric`

参数：

`songmid`: 必填

返回的接口中 `lyric` 和 `trans` 分别是歌词和翻译，转成了base64，这里node进行了解码。

### 推荐歌单

#### 1、为你推荐歌单

接口：`/recommend/playlist/u`

这个接口不需要参数，需要注意，和下面这个接口的数据格式不同

#### 2、按分类推荐歌单

接口：`/recommend/playlist`

参数：

`id`: 分类id，默认为 3317 // 3317: 官方歌单，59：经典，71：情歌，3056：网络歌曲，64：KTV热歌

`pageNo`: 页码，默认为 1

`pageSize`: 每页返回数量，默认为 20

### 最新推荐

#### 1、新歌推荐

接口：`/new/songs`,

参数：

`type`: 地区分类，默认为 0 // 0: 最新 1：内地，2：港台，3：欧美，4：韩国，5：日本

ps: 官方的接口其实不是这几个type，但是为了考虑与下面的新专和mv接口做兼容，所以做了改动

#### 2、新碟推荐（专辑）

接口：`/new/album`

参数：

`type`: 地区分类，默认为 1 // 1：内地，2：港台，3：欧美，4：韩国，5：日本，6：其他

`num`: 默认 10

这里和官方接口的参数是一致的

#### 3、新 MV 推荐

接口：`/new/mv`

参数：

`type`: 类型，默认为 0 // 0: 精选 1：内地，2：港台，3：欧美，4：韩国，5：日本

官方这个参数就更乱了，中英结合，还把日本拼成了 janpan，真是捉鸡

### 歌手

#### 1、歌手介绍

接口：`/singer/desc`

参数：

`singermid`: 必填

获取歌手的一些详细信息介绍

#### 2、获取热门歌曲

接口：`/singer/songs`

参数：

`singermid`: 必填

`num`: 返回歌曲数量

#### 3、获取歌手专辑

接口：`/singer/album`

参数：

`singermid`: 必填

`pageNo`: 默认 1

`pageSize`: 默认 20

#### 4、获取mv

接口：`/singer/mv`

参数：

`singermid`: 必填

`pageNo`: 默认 1

`pageSize`: 默认 20

#### 5、相似歌手

接口：`/singer/sim`

参数：

`singermid`: 必填

官方接口是有返回数量参数的，但是最多只返回10个，所以这里就写死返回 10 个

#### 6、获取歌手分类

接口：`/singer/category`

这个接口没有参数，会返回 地区：`area`，类型：`genre`，首字母：`index`，性别/组合：`sex` 这些分类项的各个数据

#### 7、根据分类获取歌手列表

接口：`/singer/list`

参数：

`area`: 地区，默认 -100

`genre`: 风格，默认 -100

`index`: 首字母，默认 -100

`sex`: 性别/组合，默认 -100

`pageNo`: 默认 1

这个接口固定返回 80 条信息

### 获取评论

接口：`/comment`

参数：

`id`: singid 必填

`pageNo`: 默认 1

`pageSize`: 默认 20

`type`: 默认 0  // 0：获取最新评论，1：获取热评

当 `pageNo` 为 1 且 `type` 为 0 时，会返回15条热评 `hot_comment`

### 电台

#### 1、电台分类

接口：`/radio/category`

返回电台场景分类以及场景下的各个电台

#### 2、获取电台歌曲

接口：`/radio`

参数：

`id`: 电台id，从上面的分类接口中获取

获取电台中歌曲，其中个性电台需要登陆 cookie

### MV

#### 1、获取 MV 信息

接口：`/mv`

参数：

`id`: 视频的 vid，必填

返回 `info` 为 MV 信息，`recommend` 为相关推荐的 MV

#### 2、获取 MV 播放链接

接口：`/mv/url`

参数：

`id`: 视频的 vid , 必填，多个用,分割

返回的链接都是可以直接播放的完整mv视频

#### 3、获取 MV 分类

接口：`/mv/category`

和获取歌手分类接口类似

#### 4、根据分类获取 MV 列表

接口：`/mv/list`

参数

`pageNo`: 默认 1

`pageSize`: 默认 20

`area`: 地区，默认 15 全部，具体数值从上面分类接口获取

`version`: MV 类型，默认 7 全部，具体数值从上面分类接口获取

### 关注、粉丝

#### 1、获取关注的歌手列表

接口：`/user/follow/singers`

该接口需要用户登陆 cookie

参数

`pageNo`: 默认 1

`pageSize`: 默认 20

`id`: 用户的 qq 号，默认为当前登陆用户

#### 2、获取关注的用户列表

接口：`/user/follow/users`

该接口需要用户登陆 cookie

参数

`pageNo`: 默认 1

`pageSize`: 默认 20

`id`: 用户的 qq 号，默认为当前登陆用户

#### 3、获取用户的粉丝列表

接口：`/user/fans`

该接口需要用户登陆 cookie

参数

`pageNo`: 默认 1

`pageSize`: 默认 20

`id`: 用户的 qq 号，默认为当前登陆用户

#### 4、关注/取消关注 歌手

接口：`/user/follow`

该接口需要用户登陆 cookie

`singermid`: 关注的歌手 mid，必填

`operation`: 操作，1：关注，2：取消关注，默认为 1

