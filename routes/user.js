const express = require('express');
const router = express.Router();
const request  = require('../util/request');

router.get('/cookie', (req, res, next) => {
  res.send(req.cookies);
});

router.post('/setCookie', (req, res, next) => {
  const { cookie } = req.query;

  cookie.split(' ').forEach((k) => res.append('Set-Cookie', k));
  global.cookieStr = cookie;

  res.send({
    result: 100,
    data: '操作成功',
  })
});

// 获取用户歌单
router.get('/detail', async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.send({
      result: 500,
      errMsg: 'id 不能为空',
    })
  }
  const result = await request({
    url: 'http://c.y.qq.com/rsc/fcgi-bin/fcg_get_profile_homepage.fcg',
    data: {
      cid: 205360838, // 管他什么写死就好了
      userid: id, // qq号
      reqfrom: 1,
    }
  });

  if (result.code === 1000) {
    return res.send({
      result: 301,
      errMsg: '未登陆',
      info: '建议在 https://y.qq.com 登陆并复制 cookie 尝试'
    })
  }

  result.result = 100;
  res.send(result);
});

// 获取关注的歌手
router.get('/follow/singers', async (req, res) => {
  const { id = req.cookies.uin, pageNo = 1, pageSize = 20, raw } = req.query;
  if (!id) {
    return res.send({
      result: 500,
      errMsg: 'id 不能为空',
    })
  }

  const result = await request({
    url: 'https://c.y.qq.com/rsc/fcgi-bin/fcg_order_singer_getlist.fcg',
    data: {
      utf8: 1,
      page: pageNo,
      perpage: pageSize,
      uin: id,
      g_tk: 5381,
      format: 'json',
    }
  });

  if (result.code === 1000) {
    return res.send({
      result: 301,
      errMsg: '未登陆',
      info: '建议在 https://y.qq.com 登陆并复制 cookie 尝试'
    })
  }

  if (raw) {
    return res.send(result);
  }

  res.send({
    total: result.num,
    pageNo: Number(pageNo),
    pageSize: Number(pageSize),
    data: result.list,
  })
});

// 关注歌手操作
router.get('/follow', async (req, res) => {
  const { singermid, raw, operation = 1, type = 1 } = req.query;

  const urlMap = {
    12: 'https://c.y.qq.com/rsc/fcgi-bin/fcg_order_singer_del.fcg',
    11: 'https://c.y.qq.com/rsc/fcgi-bin/fcg_order_singer_add.fcg',
  };

  if (!singermid) {
    return res.send({
      result: 500,
      errMsg: 'singermid 不能为空',
    });
  }

  const url = urlMap[(type * 10) + (operation * 1)];
  const result = await request({
    url,
    data: {
      g_tk: 5381,
      format: 'json',
      singermid,
    }
  });

  if (Number(raw)) {
    return res.send(result);
  }

  switch (result.code) {
    case 1000:
      return res.send({
        result: 301,
        errMsg: '未登陆',
        info: '建议在 https://y.qq.com 登陆并复制 cookie 尝试'
      });
    case 0:
      return res.send({
        result: 100,
        data: '操作成功',
        message: 'success',
      });
    default:
      return res.send({
        result: 200,
        errMsg: '未知异常',
        info: result,
      })
  }
});

// 获取关注的用户
router.get('/follow/users', async (req, res) => {
  const { id = req.cookies.uin, pageNo = 1, pageSize = 20, raw } = req.query;
  if (!id) {
    return res.send({
      result: 500,
      errMsg: 'id 不能为空',
    })
  }

  const result = await request({
    url: 'https://c.y.qq.com/rsc/fcgi-bin/friend_follow_or_listen_list.fcg',
    data: {
      utf8: 1,
      start: (pageNo - 1) * pageSize,
      num: pageSize,
      uin: id,
      format: 'json',
      g_tk: 5381,
    }
  });

  if (result.code === 1000) {
    return res.send({
      result: 301,
      errMsg: '未登陆',
      info: '建议在 https://y.qq.com 登陆并复制 cookie 尝试'
    })
  }

  if (Number(raw)) {
    return res.send(result);
  }

  res.send({
    result: 100,
    pageNo: pageNo / 1,
    pageSize: pageSize / 1,
    data: result.list,
  })
});

// 获取用户粉丝
router.get('/fans', async (req, res) => {
  const { id = req.cookies.uin, pageNo = 1, pageSize = 20, raw } = req.query;
  if (!id) {
    return res.send({
      result: 500,
      errMsg: 'id 不能为空',
    })
  }

  const result = await request({
    url: 'https://c.y.qq.com/rsc/fcgi-bin/friend_follow_or_listen_list.fcg',
    data: {
      utf8: 1,
      start: (pageNo - 1) * pageSize,
      num: pageSize,
      uin: id,
      format: 'json',
      g_tk: 5381,
      is_listen: 1,
    }
  });

  if (result.code === 1000) {
    return res.send({
      result: 301,
      errMsg: '未登陆',
      info: '建议在 https://y.qq.com 登陆并复制 cookie 尝试'
    })
  }

  if (Number(raw)) {
    return res.send(result);
  }

  res.send({
    result: 100,
    pageNo: pageNo / 1,
    pageSize: pageSize / 1,
    data: result.list,
  })
});

module.exports = router;
