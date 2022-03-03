module.exports = {
  title: "小芒果的博客",
  description: 'day day up!',
  head: [
    ['link', {
      rel: 'icon',
      href: '/mango.png'
    }]
  ],
  base:'/blog/',
  port: 4000,
  evergreen: true,
  themeConfig: {
    // 其它配置
    repo: 'https://github.com/yangxy6/blog',
    repoLabel: 'Github',
    // 所有页面全部开启自动生成侧边栏
    sidebar: 'auto',
    // 1.接受字符串，它设置了最后更新时间的label，例如：最后更新时间：2019年5月3日 21:51:53
    lastUpdated: '最后更新时间',
    // 2.设置true，开启最后更新时间
    lastUpdated: true,
    //主题配置
    nav: [
      // 导航栏
      {
        text: "TS学习",
        link: "/typescript/"
      },
      {
        text: "浏览器", // 必要的
        link: "/browser/",
      }
    ], // 侧边栏
    sidebar: [
      // {
      //   title: "源码系列",
      //   path: "/",
      // },
      // {
      //   title: "浏览器", // 必要的
      //   path: "/browser/", // 可选的, 标题的跳转链接，应为绝对路径且必须存在
      //   collapsable: false, // 可选的, 默认值是 true,
      //   sidebarDepth: 1, // 可选的, 默认值是 1
      // },
    ],
  },
  markdown: {
    lineNumbers: true
  }
};