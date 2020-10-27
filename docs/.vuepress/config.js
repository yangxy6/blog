module.exports = {
  title: "小芒果的博客",
  description: 'day day up!',
  head: [
    ['link', {
      rel: 'icon',
      href: '/mango.png'
    }]
  ],
  port: 4000,
  evergreen: true,
  themeConfig: {
    //主题配置
    nav: [
      // 导航栏
      {
        text: "目录",
        link: "/"
      },
    ], // 侧边栏
    sidebar: [
      // {
      //   title: "源码系列",
      //   path: "/",
      // },
      {
        title: "浏览器", // 必要的
        path: "/browser/", // 可选的, 标题的跳转链接，应为绝对路径且必须存在
        collapsable: false, // 可选的, 默认值是 true,
        sidebarDepth: 1, // 可选的, 默认值是 1
      },
    ],
  },
  markdown: {
    lineNumbers: true
  }
};