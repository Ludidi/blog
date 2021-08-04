export const data = {
  "key": "v-6c4aa45a",
  "path": "/test/config.html",
  "title": "config",
  "lang": "zh-CN",
  "frontmatter": {},
  "excerpt": "",
  "headers": [],
  "filePathRelative": "test/config.md",
  "git": {
    "updatedTime": 1628058395000,
    "contributors": [
      {
        "name": "ludd",
        "email": "ludd0312@aliyun.com",
        "commits": 1
      }
    ]
  }
}

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept()
  if (__VUE_HMR_RUNTIME__.updatePageData) {
    __VUE_HMR_RUNTIME__.updatePageData(data)
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(({ data }) => {
    __VUE_HMR_RUNTIME__.updatePageData(data)
  })
}
