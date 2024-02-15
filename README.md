# netlify-site-info-api

根据 [Stellar](https://xaoxuu.com/wiki/stellar) 主题作者编写 [site-info-api](https://github.com/xaoxuu/site-info-api) 的项目进行修改，使用 [Netlify](https://netlify.com) 部署，适用于 Stellar 主题中 [link](https://xaoxuu.com/wiki/stellar/tag-plugins/express/#link-%E9%93%BE%E6%8E%A5%E5%8D%A1%E7%89%87) 标签获取 title、icon、desc 的 json 格式信息并渲染。

> [!WARNING]
> 原作者大大的 [site-info-api](https://github.com/xaoxuu/site-info-api) 我本人直接在 Netlify 平台部署还是不能使用，有兴趣的少侠可以试试。

使用方式：

1. [fork](https://github.com/jhlzlove/netlify-site-info-api/fork) 本项目
2. 注册 [Netlify](https://netlify.com) 账号选择 Deploy with Github 并选择上面 fork 的项目
3. 在 `Environment Variables` 中添加名为 `HOSTS` 的变量：
    |  key  |                  value                  |
    | :---: | :-------------------------------------: |
    | HOSTS | ['', 'localhost', 'yourname.github.io'] |
4. `Build command` 项指定 `npm i`(不同于 Vercel，Netlify 需要自己指定构建命令)

> [!IMPORTANT]
> 'yourname.github.io' 需要替换为自己博客的域名

# 感谢

- [site-info-api](https://github.com/xaoxuu/site-info-api)
- [Netlify Function](https://docs.netlify.com/functions/overview/)
